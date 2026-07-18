import { motion } from "framer-motion";
import { ShieldAlert, Ticket, DoorOpen } from "lucide-react";

const TERMS = [
  {
    icon: Ticket,
    title: "Non-refundable & non-transferable",
    hi: "टिकट न तो वापस होगा, न स्थानांतरित।",
    body: "Once purchased, tickets cannot be refunded, exchanged, or transferred to another person.",
  },
  {
    icon: DoorOpen,
    title: "One day. One visit.",
    hi: "एक टिकट, एक दिन, एक विज़िट।",
    body: "Each ticket is valid for a single-day, single-entry visit on the date selected during booking.",
  },
  {
    icon: ShieldAlert,
    title: "Right of admission reserved",
    hi: "प्रवेश के अधिकार सुरक्षित।",
    body: "Park management reserves the right to deny entry to visitors who violate park rules or safety guidelines.",
  },
];

export default function Terms() {
  return (
    <section className="py-24 md:py-32 bg-brand-indigo text-white overflow-hidden" data-testid="terms-section">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex items-baseline justify-between mb-12">
          <span className="text-xs font-display font-semibold tracking-[0.3em] uppercase text-brand-yellow">
            The Fine Print
          </span>
          <span className="text-xs text-white/40 font-mono">§ TERMS</span>
        </div>

        <h2 className="font-hindi font-bold text-5xl md:text-7xl leading-[0.95] max-w-4xl">
          कुछ नियम,<br />
          <span className="font-display italic text-brand-yellow">read before you go.</span>
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-4 md:gap-6">
          {TERMS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
                data-testid={`term-${i}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-brand-yellow/70">0{i + 1}</span>
                  <Icon className="w-6 h-6 text-brand-yellow" />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{t.title}</h3>
                <p className="mt-1 font-hindi text-brand-yellow/80">{t.hi}</p>
                <p className="mt-4 text-white/60 text-sm leading-relaxed">{t.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
