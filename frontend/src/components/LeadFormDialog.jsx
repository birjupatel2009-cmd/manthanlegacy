import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { api, track } from "../lib/api";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

const QUESTIONS = [
  {
    key: "budget",
    label: "What is your budget range?",
    options: ["Under ₹40 Lakh", "₹40–60 Lakh", "₹60–80 Lakh", "₹80 Lakh+"],
  },
  {
    key: "purpose",
    label: "What is the purpose of purchase?",
    options: ["Self-use", "Investment"],
  },
  {
    key: "unit_type",
    label: "Which unit are you interested in?",
    options: ["2 BHK", "3 BHK", "Retail Shop"],
  },
  {
    key: "timeline",
    label: "When do you plan to buy?",
    options: ["Immediately", "1–3 months", "3–6 months", "Just exploring"],
  },
];

const RESEND_SECONDS = 30;

export const LeadFormDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState("");
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      track("form_start");
    }
    if (!open) {
      startedRef.current = false;
      setStep("details");
      setError("");
      setOtp("");
      setDevCode("");
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const phoneValid = /^[6-9]\d{9}$/.test(phone);

  const sendOtp = async () => {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your full name");
    if (!phoneValid) return setError("Enter a valid 10-digit mobile number");
    setLoading(true);
    try {
      const { data } = await api.post("/otp/send", { phone });
      setDevCode(data.dev_code || "");
      setCooldown(RESEND_SECONDS);
      setStep("otp");
      track("otp_sent");
    } catch (e) {
      setError(e.response?.data?.detail || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (otp.length !== 6) return setError("Enter the 6-digit OTP");
    setLoading(true);
    try {
      await api.post("/otp/verify", { phone, code: otp });
      track("otp_verified");
      setStep("questions");
    } catch (e) {
      track("otp_failed");
      setError(e.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const allAnswered = QUESTIONS.every((q) => answers[q.key]);

  const submitLead = async () => {
    if (!allAnswered || loading) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/leads", {
        name: name.trim(),
        phone,
        budget: answers.budget,
        purpose: answers.purpose,
        unit_type: answers.unit_type,
        timeline: answers.timeline,
      });
      track("lead_submitted");
      sessionStorage.removeItem("brochure_dl");
      onOpenChange(false);
      navigate("/thank-you");
    } catch (e) {
      setError(e.response?.data?.detail || "Submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-maroon/25 bg-ivory px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:border-maroon focus:outline-none transition-colors";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="lead-form-dialog"
        className="max-w-md border-maroon/20 bg-ivory p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-maroon">
            {step === "details" && "Download Brochure"}
            {step === "otp" && "Verify Your Number"}
            {step === "questions" && "Almost Done"}
          </DialogTitle>
          <p className="text-sm text-ink/60">
            {step === "details" && "Get the complete Manthan Legacy brochure instantly."}
            {step === "otp" && `OTP sent to +91 ${phone}`}
            {step === "questions" && "Help us personalise your brochure follow-up."}
          </p>
        </DialogHeader>

        {step === "details" && (
          <div className="mt-2 space-y-4">
            <div>
              <label htmlFor="lead-name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-maroon">
                Name
              </label>
              <input
                id="lead-name"
                data-testid="lead-name-input"
                className={inputCls}
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="lead-phone" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-maroon">
                Mobile Number
              </label>
              <div className="flex items-stretch border border-maroon/25 focus-within:border-maroon transition-colors">
                <span className="flex items-center border-r border-maroon/25 bg-parchment px-3 text-sm font-semibold text-maroon">
                  +91
                </span>
                <input
                  id="lead-phone"
                  data-testid="lead-phone-input"
                  className="w-full bg-ivory px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:outline-none"
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  autoComplete="tel-national"
                />
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-ink/50">
                <ShieldCheck className="h-3 w-3 text-brass-dark" /> OTP verification required
              </p>
            </div>
            {error && <p data-testid="lead-form-error" className="text-sm font-medium text-destructive">{error}</p>}
            <button
              data-testid="send-otp-btn"
              onClick={sendOtp}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-maroon py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-maroon-deep disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send OTP
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="mt-2 space-y-4">
            {devCode && (
              <div data-testid="demo-otp-hint" className="border border-brass/50 bg-brass/10 px-4 py-2.5 text-sm text-maroon">
                Demo mode — your OTP is <span className="font-bold tracking-widest">{devCode}</span>
              </div>
            )}
            <input
              data-testid="otp-input"
              className={`${inputCls} text-center text-2xl font-bold tracking-[0.5em]`}
              placeholder="••••••"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            {error && <p data-testid="otp-error" className="text-sm font-medium text-destructive">{error}</p>}
            <button
              data-testid="verify-otp-btn"
              onClick={verifyOtp}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-maroon py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-maroon-deep disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify OTP
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                data-testid="otp-back-btn"
                onClick={() => { setStep("details"); setError(""); }}
                className="flex items-center gap-1 text-ink/60 transition-colors hover:text-maroon"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Edit details
              </button>
              <button
                data-testid="resend-otp-btn"
                onClick={sendOtp}
                disabled={cooldown > 0 || loading}
                className="font-semibold text-maroon transition-colors hover:text-brass-dark disabled:text-ink/40"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {step === "questions" && (
          <div className="mt-2 space-y-5">
            {QUESTIONS.map((q, qi) => (
              <div key={q.key} data-testid={`question-${qi + 1}`}>
                <p className="mb-2 text-sm font-semibold text-ink">
                  <span className="mr-1.5 font-display italic text-brass-dark">{qi + 1}.</span>
                  {q.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const active = answers[q.key] === opt;
                    return (
                      <button
                        key={opt}
                        data-testid={`q${qi + 1}-option-${opt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        onClick={() => setAnswers((a) => ({ ...a, [q.key]: opt }))}
                        className={`border px-3.5 py-2 text-sm transition-colors ${
                          active
                            ? "border-maroon bg-maroon text-ivory"
                            : "border-maroon/25 bg-ivory text-ink hover:border-maroon"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {error && <p data-testid="lead-submit-error" className="text-sm font-medium text-destructive">{error}</p>}
            <button
              data-testid="submit-lead-btn"
              onClick={submitLead}
              disabled={!allAnswered || loading}
              className="flex w-full items-center justify-center gap-2 bg-brass py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-maroon-deep transition-colors hover:bg-brass-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Get My Brochure
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
