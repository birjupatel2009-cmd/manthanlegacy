from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import random
import logging
from pathlib import Path
from pydantic import BaseModel, Field, BeforeValidator
from typing import List, Optional, Annotated, Any
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]
PHONE_RE = re.compile(r"^[6-9]\d{9}$")
OTP_TTL_MIN = 10
VERIFY_WINDOW_MIN = 60
BROCHURE_PATH = ROOT_DIR / "static" / "brochure.pdf"


class BaseDocument(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        return self.model_dump(by_alias=True, exclude={"id"})

    @classmethod
    def from_mongo(cls, doc: dict):
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return cls(**doc)


class OtpSend(BaseModel):
    phone: str


class OtpVerify(BaseModel):
    phone: str
    code: str


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str
    interested_vatva: str
    unit_type: str
    budget: str
    timeline: str


class Lead(BaseDocument):
    name: str
    phone: str
    interested_vatva: str
    unit_type: str
    budget: str
    timeline: str
    source: str = "landing_page"
    created_at: str


class TrackEvent(BaseModel):
    event: str = Field(min_length=1, max_length=60)
    meta: Optional[dict[str, Any]] = None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def valid_phone(phone: str) -> bool:
    return bool(PHONE_RE.match(phone))


@api_router.get("/")
async def root():
    return {"message": "Manthan Legacy API", "status": "ok"}


@api_router.post("/otp/send")
async def send_otp(body: OtpSend):
    phone = body.phone.strip()
    if not valid_phone(phone):
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")
    code = f"{random.randint(0, 999999):06d}"
    await db.otps.update_one(
        {"phone": phone},
        {"$set": {
            "code": code,
            "verified": False,
            "attempts": 0,
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MIN)).isoformat(),
            "created_at": now_iso(),
        }},
        upsert=True,
    )
    # MOCKED OTP: no SMS provider configured, code returned for demo
    return {"sent": True, "dev_code": code, "expires_in_minutes": OTP_TTL_MIN}


@api_router.post("/otp/verify")
async def verify_otp(body: OtpVerify):
    phone = body.phone.strip()
    code = body.code.strip()
    doc = await db.otps.find_one({"phone": phone})
    if not doc:
        raise HTTPException(status_code=400, detail="Request an OTP first")
    if doc.get("attempts", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Request a new OTP.")
    expires = datetime.fromisoformat(doc["expires_at"])
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    if doc["code"] != code:
        await db.otps.update_one({"phone": phone}, {"$inc": {"attempts": 1}})
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")
    await db.otps.update_one(
        {"phone": phone},
        {"$set": {"verified": True, "verified_at": now_iso()}},
    )
    return {"verified": True}


@api_router.post("/leads", status_code=201)
async def create_lead(body: LeadCreate):
    phone = body.phone.strip()
    if not valid_phone(phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")
    otp = await db.otps.find_one({"phone": phone, "verified": True})
    if not otp or not otp.get("verified_at"):
        raise HTTPException(status_code=403, detail="Phone number not verified")
    verified_at = datetime.fromisoformat(otp["verified_at"])
    if datetime.now(timezone.utc) - verified_at > timedelta(minutes=VERIFY_WINDOW_MIN):
        raise HTTPException(status_code=403, detail="Verification expired. Please verify again.")
    lead = Lead(
        name=body.name.strip(),
        phone=phone,
        interested_vatva=body.interested_vatva,
        unit_type=body.unit_type,
        budget=body.budget,
        timeline=body.timeline,
        created_at=now_iso(),
    )
    result = await db.leads.insert_one(lead.to_mongo())
    created = await db.leads.find_one({"_id": result.inserted_id})
    return Lead.from_mongo(created)


@api_router.get("/leads", response_model=List[Lead])
async def list_leads():
    docs = await db.leads.find().sort("created_at", -1).to_list(500)
    return [Lead.from_mongo(d) for d in docs]


@api_router.post("/track", status_code=201)
async def track_event(body: TrackEvent):
    await db.events.insert_one({
        "event": body.event,
        "meta": body.meta or {},
        "created_at": now_iso(),
    })
    return {"ok": True}


@api_router.get("/brochure")
async def download_brochure():
    if not BROCHURE_PATH.exists():
        raise HTTPException(status_code=404, detail="Brochure not available")
    return FileResponse(
        BROCHURE_PATH,
        media_type="application/pdf",
        filename="Manthan-Legacy-Brochure.pdf",
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
