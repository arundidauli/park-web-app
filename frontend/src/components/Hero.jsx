import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { scrollTo } from "./Header";
import { WONDERS } from "../lib/data";

const HeroLine = ({ children, delay = 0, className = "" }) => (
  <span className="mask-line">
    <motion.span
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay }}
      className={`block ${className}`}
    >
      {children}
    </motion.span>
  </span>
);

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yB = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yC = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, -8]);

  const floats = [
    { w: WONDERS[0], style: "top-[18%] left-[6%] w-24 h-32 md:w-32 md:h-44 rounded-t-full", y: yA, rot: rot },
    { w: WONDERS[1], style: "top-[8%] right-[10%] w-28 h-36 md:w-40 md:h-52 rounded-full", y: yB },
    { w: WONDERS[3], style: "bottom-[14%] left-[10%] w-32 h-40 md:w-44 md:h-56 rounded-[3rem]", y: yC },
    { w: WONDERS[5], style: "bottom-[8%] right-[8%] w-24 h-32 md:w-36 md:h-48 rounded-b-full", y: yA },
  ];

  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] pt-28 pb-16 md:pt-32 overflow-hidden bg-brand-cream">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full bg-brand-yellow/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[600px] h-[600px] rounded-full bg-brand-teal/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-brand-indigo/5" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-indigo/10" />

      {/* Floating wonders */}
      {floats.map((f, i) => (
        <motion.div
          key={i}
          style={{ y: f.y, rotate: f.rot }}
          className={`hidden md:block absolute ${f.style} overflow-hidden shadow-[0_25px_60px_-20px_rgba(30,27,75,0.5)] border-4 border-white`}
          data-testid={`hero-float-${i}`}
        >
          <motion.img
            src={f.w.img}
            alt={f.w.en}
            className="w-full h-full object-cover"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-display uppercase tracking-widest bg-brand-indigo/70 backdrop-blur rounded-full px-2 py-1 text-center">
            {f.w.en}
          </div>
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full bg-white border border-brand-indigo/10 px-4 py-1.5 text-xs font-semibold text-brand-indigo shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
          Moradabad Development Authority × Zing Parks
        </motion.div>

        <h1 className="mt-6 font-hindi font-bold text-brand-indigo leading-[1.05] tracking-tight text-[32px] sm:text-[44px] md:text-[56px] lg:text-[72px] max-w-4xl" data-testid="hero-headline">
          <HeroLine delay={0.1}>दुनिया के प्रसिद्ध</HeroLine>
          <HeroLine delay={0.25} className="text-brand-orange italic">अजूबे</HeroLine>
          <HeroLine delay={0.4}>
            अब आपके शहर <span className="text-brand-teal">मुरादाबाद</span> में!
          </HeroLine>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-8 max-w-2xl text-brand-ink/70 text-lg md:text-xl font-body"
          data-testid="hero-sub"
        >
          The world&apos;s seven greatest marvels — reimagined as breathtaking miniatures in one park.
          <span className="block mt-1 font-hindi-body text-brand-ink/60 text-base md:text-lg">
            ऑनलाइन टिकट बुक करें और counter की लंबी लाइन से बचें।
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button
            onClick={() => scrollTo("book")}
            className="group relative inline-flex items-center gap-3 rounded-full bg-brand-indigo text-brand-yellow px-8 py-4 font-display font-semibold text-base md:text-lg hover:scale-[1.03] active:scale-[0.98] transition-transform duration-300"
            data-testid="hero-book-cta"
          >
            Book Tickets Now
            <span className="grid place-items-center w-8 h-8 rounded-full bg-brand-yellow text-brand-indigo group-hover:rotate-45 transition-transform duration-300">
              <ArrowDown className="w-4 h-4" />
            </span>
          </button>
          <button
            onClick={() => scrollTo("wonders")}
            className="text-sm font-semibold text-brand-indigo/80 hover:text-brand-indigo underline underline-offset-4 decoration-brand-orange decoration-2"
            data-testid="hero-explore-cta"
          >
            Explore the 7 Wonders →
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-md text-brand-indigo"
        >
          {[
            { k: "07", l: "World Wonders" },
            { k: "1 Day", l: "Ticket Valid" },
            { k: "₹50+", l: "Starting Price" },
          ].map((s) => (
            <div key={s.k} className="border-l-2 border-brand-orange pl-3">
              <div className="font-display font-black text-2xl md:text-3xl leading-none">{s.k}</div>
              <div className="text-[11px] uppercase tracking-widest text-brand-ink/60 mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
