import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { FadeUp } from "./reveal";
import { track } from "../lib/api";

const TENURES = [10, 15, 20, 25, 30];

const BANKS = [
  { name: "SBI", color: "#22409A" },
  { name: "HDFC Bank", color: "#004C8F" },
  { name: "Axis Bank", color: "#97144D" },
  { name: "ICICI Bank", color: "#F58220" },
  { name: "IDFC FIRST", color: "#9E1B32" },
  { name: "& more", color: "#4A1523" },
];

const fmt = (n) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
      ? `₹${(n / 100000).toFixed(2)} L`
      : `₹${Math.round(n).toLocaleString("en-IN")}`;

export const EmiCalculator = () => {
  const [amount, setAmount] = useState(3700000);
  const [rate, setRate] = useState(7.2);
  const [years, setYears] = useState(25);
  const [income, setIncome] = useState(100000);

  const { emi, eligible, yearly, stepUp, combined } = useMemo(() => {
    const r = rate / 1200;
    const n = years * 12;
    const pow = Math.pow(1 + r, n);
    const e = (amount * r * pow) / (pow - 1);
    const maxEmi = income * 0.6;
    const elig = (maxEmi * (pow - 1)) / (r * pow);
    const simulate = (annualStepUp, extraYearly) => {
      let bal = amount;
      let paid = 0;
      let m = 0;
      while (bal > 0.5 && m < 1200) {
        m += 1;
        const yearIndex = Math.ceil(m / 12) - 1;
        const monthlyEmi = e * (annualStepUp ? Math.pow(1.1, yearIndex) : 1);
        bal = bal * (1 + r);
        let thisPay = monthlyEmi;
        if (extraYearly && m % 12 === 0) thisPay += monthlyEmi;
        if (thisPay > bal) thisPay = bal;
        bal -= thisPay;
        paid += thisPay;
      }
      return { years: (m / 12).toFixed(1), saved: Math.max(0, e * n - paid) };
    };
    return {
      emi: e,
      eligible: elig,
      yearly: simulate(false, true),
      stepUp: simulate(true, false),
      combined: simulate(true, true),
    };
  }, [amount, rate, years, income]);

  return (
    <div data-testid="emi-tool" className="grid gap-8 md:grid-cols-2 md:gap-14">
          <FadeUp delay={0.1} className="space-y-8">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="emi-amount" className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
                  Loan Amount
                </label>
                <span data-testid="emi-amount-value" className="font-display text-xl text-maroon">{fmt(amount)}</span>
              </div>
              <input
                id="emi-amount"
                data-testid="emi-amount-slider"
                type="range"
                min={500000}
                max={15000000}
                step={100000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-maroon"
              />
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-ink/40">
                <span>₹5 L</span><span>₹1.5 Cr</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="emi-rate" className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
                  Interest Rate
                </label>
                <span data-testid="emi-rate-value" className="font-display text-xl text-maroon">{rate.toFixed(1)}% p.a.</span>
              </div>
              <input
                id="emi-rate"
                data-testid="emi-rate-slider"
                type="range"
                min={7}
                max={12}
                step={0.05}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-maroon"
              />
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-ink/40">
                <span>7%</span><span>12%</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="emi-income" className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
                  Monthly Income
                </label>
                <span data-testid="emi-income-value" className="font-display text-xl text-maroon">₹{income.toLocaleString("en-IN")}</span>
              </div>
              <input
                id="emi-income"
                data-testid="emi-income-slider"
                type="range"
                min={20000}
                max={500000}
                step={5000}
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full accent-maroon"
              />
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-ink/40">
                <span>₹20 K</span><span>₹5 L</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-ink/60">Tenure</p>
              <div className="flex flex-wrap gap-2">
                {TENURES.map((y) => (
                  <button
                    key={y}
                    data-testid={`emi-tenure-${y}`}
                    onClick={() => setYears(y)}
                    className={`border px-4 py-2 text-sm transition-colors ${
                      years === y
                        ? "border-maroon bg-maroon text-ivory"
                        : "border-maroon/25 bg-ivory text-ink hover:border-maroon"
                    }`}
                  >
                    {y} yrs
                  </button>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="flex h-full flex-col justify-between border border-brass/40 bg-maroon-deep p-7 md:p-9">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brass-light">Your Monthly EMI</p>
                <p data-testid="emi-result" className="mt-3 font-display text-5xl italic tracking-tight text-ivory md:text-6xl">
                  ₹{Math.round(emi).toLocaleString("en-IN")}
                </p>
                <div data-testid="emi-eligibility" className="mt-5 border border-brass/40 bg-ivory/5 px-4 py-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brass-light">Loan you may be eligible for</p>
                  <p data-testid="emi-eligible-amount" className="mt-1 font-display text-2xl italic text-ivory">{fmt(eligible)}</p>
                </div>
                <div className="mt-5 space-y-3 border-t border-ivory/15 pt-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brass-light">Smart ways to finish early</p>
                  <div data-testid="emi-tip-extra-yearly" className="border border-ivory/15 bg-ivory/5 px-4 py-3">
                    <p className="text-sm font-semibold text-ivory">Pay 1 extra EMI to principal every year</p>
                    <p data-testid="emi-tip-extra-yearly-result" className="mt-0.5 text-xs text-ivory/70">
                      Loan done in ~{yearly.years} yrs · saves {fmt(yearly.saved)} interest
                    </p>
                  </div>
                  <div data-testid="emi-tip-step-up" className="border border-ivory/15 bg-ivory/5 px-4 py-3">
                    <p className="text-sm font-semibold text-ivory">Increase EMI by 10% every year</p>
                    <p data-testid="emi-tip-step-up-result" className="mt-0.5 text-xs text-ivory/70">
                      Loan done in ~{stepUp.years} yrs · saves {fmt(stepUp.saved)} interest
                    </p>
                  </div>
                  <div data-testid="emi-tip-combined" className="border border-brass bg-brass/15 px-4 py-3">
                    <p className="text-sm font-semibold text-brass-light">Do both together</p>
                    <p data-testid="emi-tip-combined-result" className="mt-0.5 text-xs text-ivory">
                      Loan done in ~{combined.years} yrs · saves {fmt(combined.saved)} interest
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-xs leading-relaxed text-ivory/55">
                  Indicative only. Eligibility assumes banks allow EMI up to ~60% of monthly income (can go up to 65% with strong credit) at the selected rate and tenure.
                </p>
              </div>
              <a
                data-testid="emi-whatsapp-btn"
                href={`https://wa.me/917001660016?text=${encodeURIComponent(`Hi, I checked the EMI calculator for a ${fmt(amount)} loan over ${years} years (EMI ≈ ₹${Math.round(emi).toLocaleString("en-IN")}). I'd like to discuss home loan options for Manthan Legacy.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { placement: "emi_tool" })}
                className="mt-7 flex items-center justify-center gap-2.5 bg-brass px-6 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-maroon-deep transition-colors hover:bg-brass-light"
              >
                <MessageCircle className="h-4 w-4" /> Discuss on WhatsApp
              </a>
            </div>
          </FadeUp>

      <FadeUp delay={0.2} className="mt-10 md:col-span-2">
        <div data-testid="emi-bank-partners" className="border-t border-maroon/10 pt-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-ink/50">Banking Partners</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {BANKS.map((b) => (
              <span
                key={b.name}
                data-testid={`emi-bank-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="border border-maroon/15 bg-ivory px-4 py-2 text-sm font-bold tracking-wide"
                style={{ color: b.color }}
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </FadeUp>
    </div>
  );
};
