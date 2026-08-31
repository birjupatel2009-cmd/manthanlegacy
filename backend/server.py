from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import random
import logging
import httpx
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
    crm_synced: bool = False
    created_at: str


class TrackEvent(BaseModel):
    event: str = Field(min_length=1, max_length=60)
    meta: Optional[dict[str, Any]] = None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def valid_phone(phone: str) -> bool:
    return bool(PHONE_RE.match(phone))


DAEBUILD_URL = os.environ.get("DAEBUILD_WEBHOOK_URL")
DAEBUILD_KEY = os.environ.get("DAEBUILD_API_KEY")

NXC_APP_KEY = os.environ.get("NXC_APP_KEY")
NXC_AUTH_KEY = os.environ.get("NXC_AUTH_KEY")
NXC_TEMPLATE = os.environ.get("NXC_OTP_TEMPLATE")
NXC_TEMPLATE_LANG = os.environ.get("NXC_OTP_TEMPLATE_LANG", "en_US")
NXC_API_URL = os.environ.get("NXC_API_URL")


def nxc_configured() -> bool:
    return all([NXC_APP_KEY, NXC_AUTH_KEY, NXC_TEMPLATE, NXC_API_URL])


async def send_whatsapp_otp(phone: str, code: str) -> bool:
    payload = {
        "appkey": NXC_APP_KEY,
        "authkey": NXC_AUTH_KEY,
        "to": [f"91{phone}"],
        "template_id": NXC_TEMPLATE,
        "language": NXC_TEMPLATE_LANG,
        "variables": {"variableKey1": code},
        "buttons": {"b1_type": "url", "b1_value": code},
    }
    async with httpx.AsyncClient(timeout=20) as http:
        resp = await http.post(NXC_API_URL, json=payload)
        data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
        ok = resp.status_code == 200 and data.get("message_status") == "Success"
        if not ok:
            logger.warning("NXC OTP send failed (%s): %s", resp.status_code, resp.text[:300])
        return ok


BUDGET_MAP = {
    "₹30–40 Lakh": ("3000000", "4000000"),
    "₹40–50 Lakh": ("4000000", "5000000"),
    "₹50 Lakh+": ("5000000", "15000000"),
}


async def push_to_daebuild(lead: "Lead") -> bool:
    if not DAEBUILD_URL or not DAEBUILD_KEY:
        return False
    remarks = (
        f"Interested in Vatva: {lead.interested_vatva} | "
        f"Looking for: {lead.unit_type} | "
        f"Budget: {lead.budget} | "
        f"Plan to buy: {lead.timeline}"
    )
    min_budget, max_budget = BUDGET_MAP.get(lead.budget, ("", ""))
    payload = {
        "lead_id": lead.id,
        "api_version": "1.0",
        "google_key": DAEBUILD_KEY,
        "is_test": False,
        "user_column_data": [
            {"column_name": "Project Name", "string_value": "Manthan Legacy", "column_id": "project_name"},
            {"column_name": "Full Name", "string_value": lead.name, "column_id": "FULL_NAME"},
            {"column_name": "Phone", "string_value": f"+91{lead.phone}", "column_id": "PHONE_NUMBER"},
            {"column_name": "User Email", "string_value": "", "column_id": "email"},
            {"column_name": "City", "string_value": "Ahmedabad", "column_id": "city"},
            {"column_name": "date", "string_value": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"), "column_id": "lead_date"},
            {"column_name": "Preference Name", "string_value": lead.unit_type, "column_id": "looking_for"},
            {"column_name": "Source", "string_value": "Website", "column_id": "source"},
            {"column_name": "Sub Source", "string_value": "Manthan Legacy Landing Page", "column_id": "sub_source"},
            {"column_name": "Budget Range", "string_value": f"{min_budget}-{max_budget}" if min_budget else lead.budget, "column_id": "combine_budget"},
            {"column_name": "Minimum Budget", "string_value": min_budget, "column_id": "min_budget"},
            {"column_name": "Maximum Budget", "string_value": max_budget, "column_id": "max_budget"},
            {"column_name": "Remarks", "string_value": remarks, "column_id": "remarks"},
        ],
    }
    try:
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.post(DAEBUILD_URL, json=payload)
            data = resp.json()
            ok = bool(data.get("response", {}).get("success"))
            if not ok:
                logger.warning("DaeBuild rejected lead %s: %s", lead.id, data)
            return ok
    except Exception:
        logger.exception("DaeBuild sync failed for lead %s", lead.id)
        return False


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
    channel = "demo"
    if nxc_configured():
        try:
            if await send_whatsapp_otp(phone, code):
                channel = "whatsapp"
        except Exception:
            logger.exception("NXC OTP send error")
    resp = {"sent": True, "expires_in_minutes": OTP_TTL_MIN, "channel": channel}
    if channel == "demo":
        # MOCKED OTP: NXC WhatsApp credentials not configured yet, code returned for demo
        resp["dev_code"] = code
    return resp


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
    created_lead = Lead.from_mongo(created)
    crm_synced = await push_to_daebuild(created_lead)
    if crm_synced:
        await db.leads.update_one({"_id": result.inserted_id}, {"$set": {"crm_synced": True}})
        created_lead.crm_synced = True
    return created_lead


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
