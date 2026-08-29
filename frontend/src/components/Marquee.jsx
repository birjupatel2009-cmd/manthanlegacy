const ITEMS = [
  "Manthan Legacy",
  "Vatva, Ahmedabad",
  "2 & 3 BHK Serene Living",
  "70% Open Spaces",
  "RERA Approved",
];

export const Marquee = () => {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      data-testid="editorial-marquee"
      className="overflow-hidden border-y border-maroon/15 bg-parchment/60 py-4"
      aria-hidden="true"
    >
      <div className="animate-marquee flex w-max items-center whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center">
                <span className="font-display text-lg italic text-maroon md:text-xl">
                  {item}
                </span>
                <span className="mx-8 inline-block h-1.5 w-1.5 rotate-45 bg-brass" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
