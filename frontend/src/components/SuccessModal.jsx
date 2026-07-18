import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import QRCode from "react-qr-code";
import { CheckCircle2, Download, Calendar, User, Phone } from "lucide-react";
import { format } from "date-fns";

export default function SuccessModal({ open, onOpenChange, booking }) {
  if (!booking) return null;
  const payload = JSON.stringify({
    id: booking.id,
    name: booking.name,
    date: booking.date,
    people: booking.adults + booking.kidsUnder3,
    total: booking.total,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden rounded-3xl border-brand-indigo/10 bg-white [&>button]:text-white"
        data-testid="success-modal"
      >
        <DialogTitle className="sr-only">Booking Confirmed</DialogTitle>

        <div className="bg-brand-indigo text-white p-8 relative">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 20% 30%, #FACC15 1px, transparent 1px), radial-gradient(circle at 80% 70%, #EA580C 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
          <div className="relative">
            <CheckCircle2 className="w-10 h-10 text-brand-yellow" />
            <div className="mt-3 font-hindi text-3xl font-bold leading-tight">
              टिकट कन्फर्म!
            </div>
            <div className="font-display italic text-white/80">Booking confirmed.</div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-brand-orange font-display">Ticket ID</div>
              <div className="font-mono font-bold text-brand-indigo text-lg mt-1" data-testid="ticket-id">
                {booking.id}
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 border border-brand-indigo/10">
              <QRCode value={payload} size={90} fgColor="#1E1B4B" bgColor="#FFFFFF" />
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center gap-3 text-brand-ink/80">
              <User className="w-4 h-4 text-brand-teal" /> {booking.name}
            </div>
            <div className="flex items-center gap-3 text-brand-ink/80">
              <Calendar className="w-4 h-4 text-brand-teal" /> {format(new Date(booking.date), "EEEE, d MMMM yyyy")}
            </div>
            <div className="flex items-center gap-3 text-brand-ink/80">
              <Phone className="w-4 h-4 text-brand-teal" /> {booking.phone}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-brand-cream p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span>Adults / Kids 3+</span><span className="font-mono">× {booking.adults}</span></div>
            <div className="flex justify-between"><span>Kids under 3 (Free)</span><span className="font-mono">× {booking.kidsUnder3}</span></div>
            <div className="flex justify-between pt-2 mt-2 border-t border-brand-indigo/10 font-semibold text-brand-indigo">
              <span>Total Paid</span><span className="font-mono" data-testid="modal-total">₹{booking.total}</span>
            </div>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-indigo text-brand-yellow px-6 py-3 font-display font-semibold hover:bg-brand-orange hover:text-white transition-colors"
            data-testid="modal-done"
          >
            <Download className="w-4 h-4" /> Save & Close
          </button>
          <p className="mt-3 text-xs text-center text-brand-ink/50 font-hindi">
            प्रवेश द्वार पर यह QR कोड दिखाएँ।
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
