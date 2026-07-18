import { motion } from "framer-motion";
import { WONDERS } from "../lib/data";

export default function Wonders() {
  return (
    <section id="wonders" className="relative py-24 md:py-36 bg-white" data-testid="wonders-section">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-20">
          <div>
            <span className="text-xs font-display font-semibold tracking-[0.3em] uppercase text-brand-orange">
              The Collection
            </span>
            <h2 className="mt-3 font-hindi font-bold text-brand-indigo text-5xl md:text-7xl leading-[0.95]">
              सात अजूबे,<br />
              <span className="text-brand-teal italic font-display">one journey</span>
            </h2>
          </div>
          <p className="max-w-sm text-brand-ink/70">
            Miniature-scale reproductions of every wonder, arranged along a walking trail spanning the entire park. Tap any card to see the wonder in focus.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-3 md:gap-4 auto-rows-[130px] md:auto-rows-[180px]">
          {[
            { i: 0, cls: "col-span-6 md:col-span-7 row-span-2" },
            { i: 1, cls: "col-span-3 md:col-span-5 row-span-1" },
            { i: 2, cls: "col-span-3 md:col-span-5 row-span-1" },
            { i: 3, cls: "col-span-6 md:col-span-4 row-span-2" },
            { i: 4, cls: "col-span-3 md:col-span-4 row-span-1" },
            { i: 5, cls: "col-span-3 md:col-span-4 row-span-1" },
            { i: 6, cls: "col-span-6 md:col-span-12 row-span-1" },
          ].map(({ i, cls }) => {
            const w = WONDERS[i];
            return (
              <motion.figure
                key={w.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative ${cls} overflow-hidden rounded-3xl bg-brand-indigo`}
                data-testid={`wonder-card-${w.id}`}
              >
                <img
                  src={w.img}
                  alt={w.en}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.06] transition-[transform,opacity] duration-[900ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-indigo via-brand-indigo/30 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-brand-yellow font-display">
                        №{String(w.id).padStart(2, "0")} · {w.loc}
                      </div>
                      <div className="mt-1 font-hindi font-bold text-2xl md:text-4xl leading-tight">{w.hi}</div>
                      <div className="font-display italic text-sm md:text-base text-white/80">{w.en}</div>
                    </div>
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
