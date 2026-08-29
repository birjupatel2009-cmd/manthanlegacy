import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Phone, MessageCircle, ArrowLeft } from "lucide-react";
import { API, track } from "../lib/api";

export default function ThankYouPage() {
  useEffect(() => {
    track("page_view", { page: "thank_you" });
    if (sessionStorage.getItem("brochure_allowed") !== "1") return;
    if (sessionStorage.getItem("brochure_dl")) return;
    sessionStorage.setItem("brochure_dl", "1");
    sessionStorage.removeItem("brochure_allowed");
    track("brochure_download");
    const a = document.createElement("a");
    a.href = `${API}/brochure`;
    a.download = "Manthan-Legacy-Brochure.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const redownload = () => {
    track("brochure_download", { source: "manual" });
    const a = document.createElement("a");
    a.href = `${API}/brochure`;
    a.download = "Manthan-Legacy-Brochure.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div data-testid="thank-you-page" className="flex min-h-[100svh] flex-col bg-ivory">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <CheckCircle2 className="h-12 w-12 text-brass-dark" strokeWidth={1.5} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: "easeOut" }}
          className="mt-6 font-display text-4xl tracking-tight text-maroon sm:text-5xl"
        >
          Thank you.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.6, ease: "easeOut" }}
          className="mt-4 max-w-md text-sm leading-relaxed text-ink/70 md:text-base"
        >
          Your details are verified and the <span className="font-semibold text-maroon">Manthan Legacy brochure is downloading now</span>.
          {" "}Our team will reach out shortly.{" "}
          <button
            data-testid="redownload-brochure-btn"
            onClick={redownload}
            className="font-semibold text-brass-dark underline underline-offset-4 transition-colors hover:text-maroon"
          >
            Download again
          </button>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.6, ease: "easeOut" }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <a
            data-testid="call-now-btn"
            href="tel:+917001660016"
            onClick={() => track("call_click", { placement: "thank_you" })}
            className="flex flex-1 items-center justify-center gap-3 bg-maroon px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-maroon-deep"
          >
            <Phone className="h-4 w-4" /> Call Now
          </a>
          <a
            data-testid="whatsapp-chat-btn"
            href="https://wa.me/917001660016?text=Hi%2C%20I%20just%20downloaded%20the%20Manthan%20Legacy%20brochure%20and%20would%20like%20to%20know%20more."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { placement: "thank_you" })}
            className="flex flex-1 items-center justify-center gap-3 border-2 border-maroon px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-maroon transition-colors hover:bg-maroon hover:text-ivory"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-10"
        >
          <Link
            data-testid="back-to-site-link"
            to="/"
            className="inline-flex items-center gap-2 text-sm text-ink/55 transition-colors hover:text-maroon"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Manthan Legacy
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
