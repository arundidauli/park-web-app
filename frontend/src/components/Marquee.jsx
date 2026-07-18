export default function Marquee() {
  const items = [
    "THE 7 WONDERS OF THE WORLD",
    "★",
    "7 अजूबे पार्क",
    "★",
    "NOW IN MORADABAD",
    "★",
    "BOOK ONLINE • SKIP THE LINE",
    "★",
    "एक टिकट में सात अजूबे",
    "★",
  ];
  const row = [...items, ...items, ...items];

  return (
    <div className="bg-brand-indigo text-brand-yellow py-6 overflow-hidden border-y border-brand-indigo/50" data-testid="editorial-marquee">
      <div className="flex whitespace-nowrap animate-marquee">
        {row.map((t, i) => (
          <span
            key={i}
            className={`mx-6 md:mx-10 ${t === "★" ? "text-brand-orange text-3xl" : "font-hindi font-semibold text-3xl md:text-5xl tracking-tight uppercase"}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
