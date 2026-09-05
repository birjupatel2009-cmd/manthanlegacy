import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { EmiCalculator } from "../components/EmiCalculator";
import { FadeUp } from "../components/reveal";
import { track } from "../lib/api";

export default function EmiToolPage() {
  useEffect(() => {
    track("page_view", { page: "emi_tool" });
  }, []);

  return (
    <div data-testid="emi-tool-page" className="min-h-[100svh] bg-ivory">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-maroon/10 bg-ivory/90 px-5 py-4 backdrop-blur-md">
        <Link to="/" data-testid="emi-back-link" className="leading-tight">
          <span className="block text-[9px] font-bold uppercase tracking-[0.28em] text-brass-dark">Manthan Group</span>
          <span className="font-display text-lg tracking-wide text-maroon">
            MANTHAN <span className="italic text-brass-dark">Legacy</span>
          </span>
        </Link>
        <a
          data-testid="emi-call-btn"
          href="tel:+917001660016"
          onClick={() => track("call_click", { placement: "emi_tool" })}
          className="flex items-center gap-2 rounded-full bg-brass px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-maroon-deep transition-colors hover:bg-brass-light"
        >
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        <FadeUp>
          <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brass-dark">
            <span className="inline-block h-px w-10 bg-brass" /> Home Loan Tool
          </p>
          <h1 className="font-display text-4xl tracking-tight text-maroon sm:text-5xl">
            EMI &amp; eligibility, <span className="italic text-brass-dark">in seconds.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65 md:text-base">
            Slide to your numbers — see your monthly EMI and the loan amount you may be eligible for. No sign-up needed.
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-9">
          <EmiCalculator />
        </FadeUp>
      </main>

      <footer className="border-t border-maroon/10 px-5 py-8 text-center">
        <p className="font-display text-base text-maroon">
          MANTHAN <span className="italic text-brass-dark">Legacy</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink/45">
          A Manthan Group initiative · 14+ years · 500+ homes delivered · RERA No. MAA15874
        </p>
      </footer>
    </div>
  );
}
