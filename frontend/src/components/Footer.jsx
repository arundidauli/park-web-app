import { MapPin, Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { PARK } from "../lib/data";

export default function Footer() {
  return (
    <footer id="visit" className="relative bg-brand-cream text-brand-indigo pt-20 pb-10" data-testid="footer">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-full bg-brand-indigo text-brand-yellow font-display font-black text-xl">7</span>
              <div>
                <div className="font-hindi text-2xl font-bold leading-none">अजूबे पार्क</div>
                <div className="font-display text-[10px] tracking-[0.3em] text-brand-teal">MORADABAD</div>
              </div>
            </div>
            <p className="mt-6 text-brand-ink/70 max-w-sm">{PARK.tagEn}</p>
            <p className="mt-2 font-hindi text-brand-ink/60 max-w-sm">{PARK.tagHi}</p>

            <div className="mt-8 flex items-center gap-3">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 grid place-items-center rounded-full bg-brand-indigo text-brand-yellow hover:bg-brand-orange hover:text-white transition-colors"
                  aria-label="social"
                  data-testid={`social-${i}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-5">
            <div>
              <div className="text-xs tracking-[0.25em] uppercase text-brand-orange font-display">Visit</div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=New+Moradabad+Chaudharpur"
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-start gap-2 text-brand-ink/80 hover:text-brand-indigo transition-colors"
                data-testid="footer-address"
              >
                <MapPin className="w-4 h-4 mt-1 shrink-0 text-brand-teal" />
                <span>{PARK.address}</span>
              </a>
            </div>
            <div>
              <div className="text-xs tracking-[0.25em] uppercase text-brand-orange font-display">Contact</div>
              <a href={`tel:${PARK.phone}`} className="mt-2 flex items-center gap-2 text-brand-ink/80 hover:text-brand-indigo" data-testid="footer-phone">
                <Phone className="w-4 h-4 text-brand-teal" /> {PARK.phone}
              </a>
              <a href={`mailto:${PARK.email}`} className="mt-1 flex items-center gap-2 text-brand-ink/80 hover:text-brand-indigo" data-testid="footer-email">
                <Mail className="w-4 h-4 text-brand-teal" /> {PARK.email}
              </a>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs tracking-[0.25em] uppercase text-brand-orange font-display mb-3">Find Us</div>
            <div className="relative rounded-3xl overflow-hidden border border-brand-indigo/10 aspect-[4/3] bg-brand-indigo" data-testid="map-placeholder">
              <iframe
                title="7 Ajoobe Park Map"
                src="https://www.google.com/maps?q=New+Moradabad+Chaudharpur+Uttar+Pradesh+244102&output=embed"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-brand-indigo/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-brand-ink/60">
          <div>© {new Date().getFullYear()} 7 Ajoobe Park. All rights reserved.</div>
          <div className="font-display tracking-[0.2em] uppercase">A M.D.A. × Zing Parks Initiative</div>
        </div>
      </div>
    </footer>
  );
}
