import { motion } from "framer-motion";

const CHAPTERS = [
  {
    n: "01",
    title: "एक शहर, सात अजूबे",
    en: "One City. Seven Wonders.",
    body: "7 Ajoobe Park brings the seven marvels of humanity — from the Taj Mahal to the Colosseum — into a single, walkable universe in New Moradabad. Every miniature has been crafted with obsessive detail so the wonder feels real.",
  },
  {
    n: "02",
    title: "एक सार्वजनिक पहल",
    en: "A Public Initiative.",
    body: "Built as a joint effort by the Moradabad Development Authority (M.D.A.) and Zing Parks, the park is designed to be affordable, family-first, and a source of civic pride for Moradabad.",
  },
  {
    n: "03",
    title: "एक ऑनलाइन टिकट",
    en: "One Online Ticket.",
    body: "Book instantly from your phone. Skip the counter queue. Weekdays start at ₹50 per person, weekends at ₹100, and kids below 3 always enter free — no exceptions, no fine print.",
  },
];

export default function Manifesto() {
  return (
    <section id="story" className="relative py-24 md:py-36 bg-brand-cream" data-testid="manifesto">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex items-baseline justify-between mb-12 md:mb-20">
          <span className="text-xs md:text-sm font-display font-semibold tracking-[0.3em] uppercase text-brand-orange">
            The Manifesto
          </span>
          <span className="text-xs text-brand-ink/50 font-mono">MDA × ZING PARKS</span>
        </div>

        <div className="grid gap-16 md:gap-24">
          {CHAPTERS.map((c, i) => (
            <motion.article
              key={c.n}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-12 gap-6 md:gap-10 items-start"
              data-testid={`manifesto-chapter-${c.n}`}
            >
              <div className="md:col-span-3">
                <div className="font-display font-black text-6xl md:text-8xl text-brand-indigo/90 leading-none">
                  {c.n}
                </div>
                <div className="mt-3 h-[3px] w-16 bg-brand-orange" />
              </div>
              <div className="md:col-span-6">
                <h3 className="font-hindi text-4xl md:text-5xl font-bold text-brand-indigo leading-tight">
                  {c.title}
                </h3>
                <p className="mt-2 font-display text-xl md:text-2xl italic text-brand-teal">
                  {c.en}
                </p>
              </div>
              <div className="md:col-span-3">
                <p className="text-brand-ink/70 leading-relaxed">{c.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
