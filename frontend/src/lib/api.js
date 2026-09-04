import axios from "axios";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, timeout: 15000 });

const SAFE_META_KEYS = ["placement", "page", "source"];

export const track = (event, meta) => {
  try {
    if (typeof window !== "undefined" && typeof window.clarity === "function") {
      window.clarity("event", event);
      if (event === "lead_submitted") window.clarity("set", "converted", "true");
      if (event === "form_start") window.clarity("set", "funnel", "form_started");
      if (event === "otp_verified") window.clarity("set", "funnel", "otp_verified");
      if (meta) {
        Object.entries(meta).forEach(([k, v]) => {
          if (SAFE_META_KEYS.includes(k)) window.clarity("set", k, String(v));
        });
      }
    }
  } catch (_) {}
  return api.post("/track", { event, meta }).catch(() => {});
};
