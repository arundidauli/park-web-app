import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import QRCode from "react-qr-code";
import { CheckCircle2, Download, Calendar, User, Phone, Ticket, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { downloadTickets } from "../lib/generateTicket";

export default function SuccessModal({ open, onOpenChange, booking }) {
  const [downloading, setDownloading] = useState(false);

  if (!booking) return null;

  const totalTickets = booking.adults + booking.kidsUnder3;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTickets(booking);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
    setDownloading(false);
  };

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
            {booking.status === "Hold" ? (
              <Clock className="w-10 h-10 text-brand-yellow" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-brand-yellow" />
            )}
            <div className="mt-3 font-hindi text-3xl font-bold leading-tight">
              {booking.status === "Hold" ? "होल्ड पर है!" : "टिकट कन्फर्म!"}
            </div>
            <div className="font-display italic text-white/80">
              {booking.status === "Hold" ? "Booking on hold." : "Booking confirmed."}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Booking ID + QR */}
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-brand-orange font-display">Booking ID</div>
              <div className="font-mono font-bold text-brand-indigo text-lg mt-1" data-testid="ticket-id">
                {booking.bookingId}
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 border border-brand-indigo/10">
              <QRCode value={booking.bookingId} size={70} fgColor="#1E1B4B" bgColor="#FFFFFF" />
            </div>
          </div>

          {/* Details */}
          <div className="mt-4 space-y-1.5 text-sm">
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

          {/* Guest breakdown + pricing */}
          <div className="mt-4 rounded-2xl bg-brand-cream p-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span>{booking.adults} × Adult{booking.adults > 1 ? "s" : ""}</span>
              <span className="font-mono">₹{booking.adults * booking.rate}</span>
            </div>
            {booking.kidsUnder3 > 0 && (
              <div className="flex justify-between text-brand-ink/60">
                <span>{booking.kidsUnder3} × Kid{booking.kidsUnder3 > 1 ? "s" : ""} under 3</span>
                <span className="font-mono text-brand-teal">FREE</span>
              </div>
            )}
            <div className="flex justify-between pt-2 mt-2 border-t border-brand-indigo/10 font-semibold text-brand-indigo">
              <span>Total ({totalTickets} guest{totalTickets > 1 ? "s" : ""})</span>
              <span className="font-mono" data-testid="modal-total">₹{booking.total}</span>
            </div>
          </div>

          {/* Ticket IDs */}
          {booking.ticketIds && booking.ticketIds.length > 0 && (
            <div className="mt-3 rounded-2xl bg-brand-cream p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-indigo mb-1.5">
                <Ticket className="w-3.5 h-3.5" /> {totalTickets} Ticket{totalTickets > 1 ? "s" : ""}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {booking.ticketIds.map((id) => (
                  <span key={id} className="font-mono text-xs bg-white rounded-lg px-2 py-1 border border-brand-indigo/10 text-brand-indigo">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Download single PDF */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-teal text-white px-6 py-3 font-display font-semibold hover:bg-brand-indigo hover:text-brand-yellow transition-colors disabled:opacity-70"
            data-testid="download-tickets"
          >
            {downloading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…</>
            ) : (
              <><Download className="w-4 h-4" /> Download PDF ({totalTickets} tickets)</>
            )}
          </button>

          <button
            onClick={() => onOpenChange(false)}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full border border-brand-indigo/20 text-brand-indigo px-6 py-2.5 font-display font-semibold hover:bg-brand-cream transition-colors"
            data-testid="modal-done"
          >
            Done
          </button>

          <p className="mt-2 text-xs text-center text-brand-ink/50 font-hindi">
            प्रवेश द्वार पर QR कोड स्कैन करें।
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
