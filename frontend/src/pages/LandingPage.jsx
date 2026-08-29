import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDown, Building2, Trees, ShieldCheck, TrainFront, Hospital,
  GraduationCap, ShoppingBasket, Route, Phone, Download, MapPin,
} from "lucide-react";
import { RevealLine, FadeUp } from "../components/reveal";
import { Marquee } from "../components/Marquee";
import { LeadFormDialog } from "../components/LeadFormDialog";
import { StickyCTA } from "../components/StickyCTA";
import { track } from "../lib/api";

const FACTS = [
  ["7", "Residential Towers"],
  ["358", "2 & 3 BHK Homes"],
  ["133", "Shops & Showrooms"],
  ["70%", "Open Area"],
  ["1 Lac+", "Sq. Ft. Open Spaces"],
];

const NEARBY = [
  { icon: Route, place: "Ring Road", time: "3 min" },
  { icon: ShoppingBasket, place: "Osia & D-Mart", time: "4 min" },
  { icon: GraduationCap, place: "International Schools", time: "5 min" },
  { icon: TrainFront, place: "Railway Station", time: "7 min" },
  { icon: Hospital, place: "Zydus Hospital", time: "8 min" },
];

const AMENITIES = [
  "Clubhouse & Multi-purpose Hall", "Gymnasium & Yoga Room", "Temple & Divine Courtyards",
  "Jogging Track & Skating Rink", "Children's Play Area", "Library & Co-working Space",
  "Landscaped Gardens & Gazebo", "24×7 Security with CCTV", "Senior Citizen Sit-outs",
];

const Chapter = ({ num, title, children, className = "" }) => (
  <section className={`relative overflow-hidden ${className}`}>
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-8 right-0 select-none font-display text-[26vw] leading-none text-maroon/5 md:text-[18vw]"
    >
      {num}
    </span>
    <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
      <FadeUp>
        <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brass-dark">
          <span className="inline-block h-px w-10 bg-brass" /> Chapter {num}
        </p>
        <h2 className="font-display text-4xl tracking-tight text-maroon sm:text-5xl">{title}</h2>
      </FadeUp>
      {children}
    </div>
  </section>
);

export default function LandingPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 700], [0, 110]);

  useEffect(() => {
    track("page_view", { page: "landing" });
  }, []);

  const openForm = (placement) => {
    track("cta_click", { placement });
    setFormOpen(true);
  };

  return (
    <div data-testid="landing-page" className="bg-ivory text-ink">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between border-b border-ivory/10 bg-maroon-deep/40 px-5 py-4 backdrop-blur-md md:px-10">
        <div data-testid="brand-mark" className="leading-tight">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brass-light">Manthan Group</p>
          <p className="font-display text-xl tracking-wide text-ivory">
            MANTHAN <span className="italic text-brass-light">Legacy</span>
          </p>
        </div>
        <a
          data-testid="nav-call-btn"
          href="tel:+917001660016"
          onClick={() => track("call_click", { placement: "nav" })}
          className="flex items-center gap-2 rounded-full bg-brass px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-maroon-deep transition-colors hover:bg-brass-light"
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">+91 70016 60016</span>
          <span className="sm:hidden">Call</span>
        </a>
      </header>

      {/* Hero */}
      <section data-testid="hero-section" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-maroon-deep">
        <motion.img
          src="/assets/hero.webp"
          alt="Manthan Legacy towers at dusk, Vatva Ahmedabad"
          fetchpriority="high"
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
          style={{ y: heroImgY }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/70 to-maroon-deep/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-deep/60 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-32 pt-32 md:px-10 md:pb-36">
          <RevealLine delay={0.15} className="mb-5 text-[11px] font-bold uppercase tracking-[0.35em] text-brass-light md:text-xs">
            By Manthan Group · RERA No. MAA15874
          </RevealLine>
          <h1 className="font-display text-4xl leading-[1.02] tracking-tight text-ivory sm:text-5xl lg:text-6xl">
            <RevealLine delay={0.3}>Serene living,</RevealLine>
            <RevealLine delay={0.42} className="italic text-brass-light">a lasting legacy.</RevealLine>
          </h1>
          <RevealLine delay={0.58} className="mt-6 max-w-md text-sm leading-relaxed text-ivory/80 md:text-base">
            2 &amp; 3 BHK homes and high-street retail across 7 towers — with 70% open green space in Vatva, Ahmedabad.
          </RevealLine>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
            className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <button
              data-testid="download-brochure-btn"
              onClick={() => openForm("hero")}
              className="group flex items-center justify-center gap-3 bg-brass px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-maroon-deep transition-colors hover:bg-brass-light"
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download Brochure
            </button>
            <div className="text-sm text-ivory/80">
              <span className="block text-[11px] uppercase tracking-[0.25em] text-ivory/50">Starting Price</span>
              <span data-testid="hero-price" className="block font-display text-lg italic leading-snug text-ivory">
                2 BHK starting from ₹37L* <span className="text-brass-light">·</span> 3 BHK starting from ₹47L*
              </span>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-6 right-6 z-10 hidden text-ivory/60 md:block"
        >
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </motion.div>
      </section>

      {/* Facts strip */}
      <section data-testid="facts-strip" className="border-b border-maroon/15 bg-ivory">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-maroon/10 sm:grid-cols-3 lg:grid-cols-5">
          {FACTS.map(([value, label], i) => (
            <FadeUp key={label} delay={i * 0.06} className="px-5 py-7 text-center">
              <p className="font-display text-3xl text-maroon md:text-4xl">{value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/55">{label}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      <Marquee />

      {/* Chapter 01 — Residences */}
      <Chapter num="01" title="Residences & Retail" className="bg-parchment/50">
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { img: "/assets/balcony.webp", name: "Big 2 BHK", size: "160–162 Sq. Yd.", note: "202 residences · Blocks A–D · From ₹37L*" },
            { img: "/assets/courtyard.webp", name: "Spacious 3 BHK", size: "204–211 Sq. Yd.", note: "156 residences · Blocks E–G · From ₹47L*" },
            { img: "/assets/greens.webp", name: "Retail & Showrooms", size: "133 Units", note: "High-street shops on a two-road corner" },
          ].map((card, i) => (
            <FadeUp key={card.name} delay={i * 0.08}>
              <article data-testid={`unit-card-${i + 1}`} className="group border border-maroon/15 bg-ivory">
                <div className="overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-maroon">{card.name}</h3>
                  <p className="mt-1 font-display text-lg italic text-brass-dark">{card.size}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-ink/55">{card.note}</p>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.2} className="mt-8">
          <p className="text-sm text-ink/60">
            3-side open homes for light and air · Spacious layouts with neat finishes · Every tower an independent identity.
          </p>
        </FadeUp>
      </Chapter>

      {/* Payment plan + final CTA */}
      <section data-testid="payment-plan-section" className="relative overflow-hidden bg-maroon-deep text-ivory">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-10 md:py-24">
          <FadeUp>
            <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brass-light">
              <span className="inline-block h-px w-10 bg-brass" /> Chapter 02 · Special Payment Plan
            </p>
            <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
              Pay 10% or ₹4 Lakh now. <span className="italic text-brass-light">Rest on possession.</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.1} className="mt-8 max-w-xl">
            <div data-testid="payment-split" className="grid grid-cols-2 divide-x divide-ivory/15 border border-ivory/15">
              <div className="px-5 py-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass-light">Book Now</p>
                <p className="mt-2 font-display text-2xl italic text-ivory md:text-3xl">10% or ₹4 Lakh*</p>
              </div>
              <div className="px-5 py-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brass-light">On Possession</p>
                <p className="mt-2 font-display text-2xl italic text-ivory md:text-3xl">Balance 90%</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ivory/75 md:text-base">
              Reserve your Manthan Legacy home with just 10% or ₹4 Lakh* today — nothing more to pay until possession. Download the brochure for the complete price list, floor plans and payment details.
            </p>
          </FadeUp>
          <FadeUp delay={0.18} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              data-testid="download-brochure-btn-footer"
              onClick={() => openForm("payment_section")}
              className="group flex items-center justify-center gap-3 bg-brass px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-maroon-deep transition-colors hover:bg-brass-light"
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download Brochure
            </button>
            <a
              data-testid="payment-call-link"
              href="tel:+917001660016"
              onClick={() => track("call_click", { placement: "payment_section" })}
              className="flex items-center justify-center gap-2 border border-ivory/30 px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition-colors hover:border-brass hover:text-brass-light"
            >
              <Phone className="h-4 w-4" /> +91 70016 60016
            </a>
          </FadeUp>
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 border-t border-ivory/15 pt-6 text-xs text-ivory/60">
            <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-brass" /> 14+ years of experience</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-brass" /> 500+ homes delivered</span>
            <span className="flex items-center gap-2"><Trees className="h-3.5 w-3.5 text-brass" /> 1.1M sq. ft. developed</span>
          </div>
        </div>
      </section>

      {/* Chapter 03 — Open living */}
      <Chapter num="03" title="70% Open to the Sky">
        <div className="mt-10 grid gap-10 md:grid-cols-5 md:gap-14">
          <FadeUp delay={0.1} className="md:col-span-3">
            <div className="overflow-hidden rounded-tr-3xl rounded-bl-3xl border border-brass/40">
              <img
                src="/assets/masterplan.webp"
                alt="Manthan Legacy master plan with landscaped open spaces"
                loading="lazy"
                className="w-full object-cover"
              />
            </div>
          </FadeUp>
          <div className="flex flex-col justify-center md:col-span-2">
            <FadeUp delay={0.15}>
              <p className="text-base leading-relaxed text-ink/75">
                Over 1 lakh sq. ft. of pure open space — divine courtyards, tree-lined drive-ins and amenities for health, recreation and family bonding.
              </p>
            </FadeUp>
            <ul data-testid="amenities-list" className="mt-7 grid gap-x-4 gap-y-2.5 sm:grid-cols-2 md:grid-cols-1">
              {AMENITIES.map((a, i) => (
                <FadeUp key={a} delay={0.08 + i * 0.03}>
                  <li className="flex items-center gap-2.5 text-sm text-ink/75">
                    <span className="inline-block h-1.5 w-1.5 rotate-45 bg-brass" /> {a}
                  </li>
                </FadeUp>
              ))}
            </ul>
          </div>
        </div>
      </Chapter>

      {/* Chapter 04 — Location */}
      <Chapter num="04" title="The Vatva Address">
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
          <FadeUp delay={0.1}>
            <div className="overflow-hidden rounded-tr-3xl rounded-bl-3xl border border-brass/40">
              <img
                src="/assets/facade.webp"
                alt="Manthan Legacy tower facade"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </FadeUp>
          <div className="flex flex-col justify-center">
            <FadeUp delay={0.15}>
              <p className="flex items-start gap-2 text-base leading-relaxed text-ink/75">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-brass-dark" />
                A prime two-road corner landmark in Vatva, East Ahmedabad — close to everything that matters, yet wrapped in shaded greens.
              </p>
            </FadeUp>
            <ul data-testid="nearby-list" className="mt-8 divide-y divide-maroon/10">
              {NEARBY.map(({ icon: Icon, place, time }, i) => (
                <FadeUp key={place} delay={0.1 + i * 0.05}>
                  <li className="flex items-center justify-between py-3.5">
                    <span className="flex items-center gap-3 text-sm font-medium text-ink/80">
                      <Icon className="h-4 w-4 text-brass-dark" /> {place}
                    </span>
                    <span className="font-display italic text-maroon">{time}</span>
                  </li>
                </FadeUp>
              ))}
            </ul>
            <FadeUp delay={0.3} className="mt-8">
              <button
                data-testid="download-brochure-btn-location"
                onClick={() => openForm("location_section")}
                className="group flex items-center justify-center gap-3 bg-maroon px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-maroon-deep"
              >
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                Download Brochure
              </button>
            </FadeUp>
          </div>
        </div>
      </Chapter>

      {/* Footer */}
      <footer className="border-t border-maroon/10 bg-ivory px-5 py-10 pb-28 md:px-10 md:pb-10">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-lg text-maroon">
            MANTHAN <span className="italic text-brass-dark">Legacy</span>
          </p>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-ink/50">
            *Starting from prices. Payment plan subject to terms and availability.
            Manthan Legacy by Manthan Group (Karm Infra) · Vatva, Ahmedabad · RERA No. MAA15874 · www.manthangroup.in.
            Images are artistic interpretations. This page is for information only and does not constitute an offer.
          </p>
        </div>
      </footer>

      <StickyCTA onDownload={() => openForm("sticky")} />
      <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
