import { Phone, MessageCircle, Download } from "lucide-react";
import { track } from "../lib/api";

export const StickyCTA = ({ onDownload }) => (
  <div
    data-testid="sticky-mobile-cta"
    className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-brass/40 bg-maroon md:hidden"
  >
    <a
      data-testid="sticky-call-btn"
      href="tel:+917001660016"
      onClick={() => track("call_click", { placement: "sticky" })}
      className="flex w-14 items-center justify-center border-r border-ivory/15 text-brass"
      aria-label="Call now"
    >
      <Phone className="h-5 w-5" />
    </a>
    <a
      data-testid="sticky-whatsapp-btn"
      href="https://wa.me/917001660016?text=Hi%2C%20I%27m%20interested%20in%20Manthan%20Legacy%2C%20Vatva."
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { placement: "sticky" })}
      className="flex w-14 items-center justify-center border-r border-ivory/15 text-brass"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
    <button
      data-testid="sticky-download-btn"
      onClick={onDownload}
      className="flex flex-1 items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-[0.18em] text-ivory transition-colors active:bg-maroon-deep"
    >
      <Download className="h-4 w-4" /> Download Brochure
    </button>
  </div>
);
