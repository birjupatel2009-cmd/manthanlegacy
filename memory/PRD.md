# Manthan Legacy — Lead Generation Landing Page

## Original Problem Statement
Build a fast-loading, mobile-first, responsive real estate project landing page for lead generation. Content: project name, location, size, unit types, price, payment plan, highlights, DOWNLOAD BROCHURE CTA. Lead form with name, phone (mandatory OTP), 4 questions. After submission: store lead, redirect to Thank You page (CALL NOW + CHAT ON WHATSAPP), trigger brochure download. Sticky mobile CTA, one-tap call/WhatsApp, OTP resend + error handling, conversion event tracking. Priority: Speed → Mobile UX → Conversion → Simplicity. Brand asset: Manthan Legacy digital brochure PDF (uploaded).

## Architecture
- Frontend: React (CRA/craco), Tailwind, framer-motion (reveals/parallax), lenis (smooth scroll), Shadcn Dialog, sonner. Routes: `/` landing, `/thank-you`.
- Backend: FastAPI, MongoDB (motor). Endpoints: `POST /api/otp/send`, `POST /api/otp/verify`, `POST /api/leads`, `GET /api/leads`, `POST /api/track`, `GET /api/brochure` (serves static/brochure.pdf).
- Collections: `otps`, `leads`, `events`.
- Art direction: brochure's own brand palette — deep maroon (#4A1523) + brass (#C5A059) on ivory (#F7F5F0), Playfair Display + Manrope, numbered manifesto chapters, slow editorial marquee, masked line-reveal hero, real project renders extracted from the brochure PDF (/app/frontend/public/assets/*.webp).

## User Personas
- Property buyer/investor in Ahmedabad on mobile, wants brochure fast with minimal friction.
- Sales/marketing team wanting verified (OTP) qualified leads.

## Implemented (2026-08-29)
- Landing page: hero (masked reveal + parallax, real dusk render), facts strip (7 towers / 358 homes / 133 shops / 70% open / 1 Lac+ sq.ft), marquee, Chapter 01 location + nearby times, Chapter 02 unit cards (2 BHK 160–162 sq.yd, 3 BHK 204–211 sq.yd, retail), Chapter 03 amenities + master plan, Chapter 04 payment plan + CTA, footer with RERA MAA15874.
- Lead form dialog: name + phone → MOCKED OTP (demo code shown on screen; resend with 30s cooldown, 5-attempt limit, 10-min expiry) → 4 qualifying questions (budget, purpose, unit type, timeline) → submit.
- Thank You page: confirmation, auto brochure download (session-guarded), CALL NOW (tel:+917001660016), CHAT ON WHATSAPP (wa.me/917001660016).
- Sticky mobile CTA bar (call / WhatsApp / download), one-tap actions.
- Event tracking: page_view, cta_click, form_start, otp_sent, otp_verified, otp_failed, lead_submitted, brochure_download, call_click, whatsapp_click.
- Microsoft Clarity live (2026-09-04): official snippet in public/index.html <head>, project ID yd2he1h3wm. Heatmaps + session recordings; SPA route changes tracked automatically. Form inputs masked by default. Funnel tagging via track() in src/lib/api.js: every event fires clarity("event", name); funnel stage tags (funnel=form_started/otp_verified, converted=true on lead_submitted); placement/page/source as session tags. PII never sent.
- Google Ads tag live (2026-09-10): gtag.js AW-18405979837 in public/index.html <head> (user-provided snippet, verbatim). Page views + remarketing beacons verified. Conversion event for lead_submitted NOT yet wired (needs conversion label from Google Ads).
- Brochure served from backend at /api/brochure (original uploaded PDF).

## Verified
- Backend: OTP send/verify (incl. wrong-code error), lead create (requires verified phone), leads list, track, brochure 200 (~6MB).
- E2E via screenshots: hero, dialog steps, full funnel to /thank-you, mobile sticky CTA (390px).

## Updates (2026-09-05)
- EMI & eligibility tool moved to dedicated mobile-first page /emi (EmiToolPage: sticky header with back link + call button, no sign-up). Landing page payment chapter links to it ("Check your EMI & loan eligibility"). Eligibility at 60% of monthly income (note mentions up to 65% with strong credit). Inputs: loan amount ₹5L–₹1.5Cr, rate 7–12%, income ₹20K–₹5L, tenure 10–30y. "Discuss on WhatsApp" prefilled; page_view tracked.

## Backlog
- P0: Real SMS OTP (Twilio/MSG91 — needs user API keys).
- P1: Lead email notification via managed Resend; admin dashboard for leads/events (GET /api/leads exists, no auth).
- P2: UTM/meta capture on leads; image_srcset for faster mobile LCP.

## Updates (2026-08-29, later)
- Special payment plan section: "Pay 10% or ₹4 Lakh now. Rest on possession." with Book Now / On Possession split, footer T&C footnote, *starting from pricing (₹37L* 2BHK / ₹47L* 3BHK) in hero and unit cards, header branding + call pill button.
- DaeBuild CRM sync LIVE (2026-08-29): every OTP-verified lead POSTs to https://crm.manthangroup.in/daebuild/api_lead_google_ads.php?action=insertLeads using Google Ads webhook schema (google_key auth from backend/.env DAEBUILD_API_KEY). Payload maps: project_name=Manthan Legacy, FULL_NAME, PHONE_NUMBER (+91), city=Ahmedabad, looking_for=unit, combine/min/max_budget (₹30–40L→3000000-4000000 etc.), source=Website, sub_source=landing page, remarks (column_id "remarks", lowercase — confirmed via CRM echo) = all 4 answers summary. CRM dedups by phone (error 0008). crm_synced flag on lead; CRM failure never blocks storage. Test inquiries to delete in DaeBuild: TEST Sync Delete (×3), CRM Sync Test, TEST Remark A–F, TEST CustomQ Delete, Answers Sync Test, TEST Rmk variants, TEST Remarks Echo, Remarks Verify Test.
- WhatsApp OTP LIVE (2026-08-29) via NXC WABA (NXCMSG): POST https://waba.nxccontrols.in/api/create-message-json with appkey/authkey (backend/.env NXC_*), template "landing_page_verification" (en_US), variables.variableKey1 = OTP, buttons b1_type=url/b1_value=OTP (copy-code button). Success = message_status "Success". Without creds, falls back to demo mode (dev_code shown in UI). Backend OTP verify/attempts/expiry unchanged.
- Requested pending: none outstanding.

## Next Tasks
1. Swap mocked OTP for real SMS provider (needs credentials).
2. Lead email alerts (Resend, needs recipient email).
3. Simple password-protected leads view.
