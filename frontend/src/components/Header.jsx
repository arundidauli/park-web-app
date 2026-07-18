import { motion } from "framer-motion";
import { Ticket } from "lucide-react";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -80 });
  else el.scrollIntoView({ behavior: "smooth" });
};

export default function Header() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
      data-testid="site-header"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-4">
        <div className="flex items-center justify-between rounded-full bg-white/80 backdrop-blur-xl border border-brand-indigo/10 shadow-[0_10px_40px_-15px_rgba(30,27,75,0.25)] pl-5 pr-2 py-2">
          <button
            onClick={() => scrollTo("top")}
            className="flex items-center gap-2 group"
            data-testid="logo-button"
          >
            <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-indigo text-brand-yellow font-display font-black">7</span>
            <span className="flex flex-col leading-none">
              <span className="font-hindi text-xl font-bold text-brand-indigo tracking-tight">अजूबे</span>
              <span className="font-display text-[10px] tracking-[0.3em] text-brand-teal">PARK</span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-indigo/80">
            <button onClick={() => scrollTo("wonders")} className="hover:text-brand-indigo transition-colors" data-testid="nav-wonders">Wonders</button>
            <button onClick={() => scrollTo("story")} className="hover:text-brand-indigo transition-colors" data-testid="nav-story">Story</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-brand-indigo transition-colors" data-testid="nav-pricing">Pricing</button>
            <button onClick={() => scrollTo("visit")} className="hover:text-brand-indigo transition-colors" data-testid="nav-visit">Visit</button>
          </nav>

          <button
            onClick={() => scrollTo("book")}
            className="group inline-flex items-center gap-2 rounded-full bg-brand-indigo text-brand-yellow pl-5 pr-5 py-2.5 text-sm font-semibold hover:bg-brand-yellow hover:text-brand-indigo transition-colors duration-300"
            data-testid="header-book-cta"
          >
            <Ticket className="w-4 h-4" />
            Book Tickets
          </button>
        </div>
      </div>
    </motion.header>
  );
}

export { scrollTo };
