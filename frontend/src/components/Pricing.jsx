import { motion } from "framer-motion";

export default function Pricing() {
  const rows = [
    { desc: "Children below age 3 years", hi: "3 वर्ष से कम आयु के बच्चे", weekday: "FREE", weekend: "FREE", isFree: true },
    { desc: "All other ages", hi: "अन्य सभी आयु", weekday: "₹50", weekend: "₹100", isFree: false },
  ];

  return (
    <section id="pricing" className="relative py-24 md:py-36 bg-brand-cream" data-testid="pricing-section">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="text-xs font-display font-semibold tracking-[0.3em] uppercase text-brand-orange">
              Official Rates
            </span>
            <h2 className="mt-3 font-hindi font-bold text-brand-indigo text-5xl md:text-6xl leading-[0.95]">
              टिकट की कीमत,<br /><span className="font-display italic text-brand-teal">no surprises.</span>
            </h2>
          </div>
          <p className="max-w-sm text-brand-ink/70">
            One flat rate, one park, one whole day. Pricing is set by the M.D.A. and applies year-round.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-[2rem] overflow-hidden border border-brand-indigo/10 bg-white shadow-[0_25px_80px_-30px_rgba(30,27,75,0.35)]"
        >
          {/* Header row */}
          <div className="grid grid-cols-1 md:grid-cols-3 bg-brand-indigo text-white">
            <div className="p-5 md:p-8 font-display text-xs md:text-sm tracking-[0.25em] uppercase">
              Ticket Description
            </div>
            <div className="p-5 md:p-8 font-display text-xs md:text-sm tracking-[0.25em] uppercase border-t md:border-t-0 md:border-l border-white/10">
              Monday — Friday
            </div>
            <div className="p-5 md:p-8 font-display text-xs md:text-sm tracking-[0.25em] uppercase bg-brand-orange text-white border-t md:border-t-0 md:border-l border-white/10">
              Saturday · Sunday · Public Holidays
            </div>
          </div>

          {rows.map((r, i) => (
            <div key={i} className={`grid grid-cols-1 md:grid-cols-3 border-t border-brand-indigo/10 ${i % 2 === 1 ? "bg-brand-cream/50" : ""}`}>
              <div className="p-6 md:p-8">
                <div className="font-display font-semibold text-lg md:text-xl text-brand-indigo">{r.desc}</div>
                <div className="font-hindi text-brand-ink/60 text-lg">{r.hi}</div>
              </div>
              <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-brand-indigo/10 flex items-center">
                <span className={`font-display font-black text-3xl md:text-5xl ${r.isFree ? "text-brand-teal" : "text-brand-indigo"}`} data-testid={`price-weekday-${i}`}>
                  {r.weekday}
                </span>
                {!r.isFree && <span className="ml-2 text-brand-ink/50 text-sm">/ person</span>}
              </div>
              <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-brand-indigo/10 flex items-center bg-brand-yellow/10">
                <span className={`font-display font-black text-3xl md:text-5xl ${r.isFree ? "text-brand-teal" : "text-brand-orange"}`} data-testid={`price-weekend-${i}`}>
                  {r.weekend}
                </span>
                {!r.isFree && <span className="ml-2 text-brand-ink/50 text-sm">/ person</span>}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
