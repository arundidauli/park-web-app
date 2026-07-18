import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Minus, Plus, User, Phone, Mail, Sparkles, Loader2, Ban } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { priceForDate, isWeekend } from "../lib/data";
import SuccessModal from "./SuccessModal";

const API_URL = process.env.REACT_APP_API_URL;
const SHEETS_URL = process.env.REACT_APP_SHEETS_URL;
const BYPASS = process.env.REACT_APP_BYPASS_PAYMENT === "true";

const Counter = ({ label, hi, value, onChange, min = 0, testId }) => (
  <div className="flex items-center justify-between rounded-2xl border border-brand-indigo/10 bg-white p-4">
    <div>
      <div className="font-display font-semibold text-brand-indigo">{label}</div>
      <div className="font-hindi text-sm text-brand-ink/60">{hi}</div>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 grid place-items-center rounded-full border border-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo hover:text-brand-yellow transition-colors disabled:opacity-40"
        disabled={value <= min}
        aria-label={`decrease ${label}`}
        data-testid={`${testId}-dec`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-8 text-center font-mono font-bold text-lg text-brand-indigo" data-testid={`${testId}-value`}>
        {value}
      </div>
      <button
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 grid place-items-center rounded-full bg-brand-indigo text-brand-yellow hover:bg-brand-orange hover:text-white transition-colors"
        aria-label={`increase ${label}`}
        data-testid={`${testId}-inc`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function Booking() {
  const [date, setDate] = useState(null);
  const [adults, setAdults] = useState(2);
  const [kidsUnder3, setKidsUnder3] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [booking, setBooking] = useState(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [parkOpen, setParkOpen] = useState(true);
  const [holdBooking, setHoldBooking] = useState(false);

  // Fetch holidays + park config on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const url = API_URL || (SHEETS_URL ? SHEETS_URL + "?action=settings" : null);
      if (!url) return;
      try {
        const settingsUrl = API_URL
          ? API_URL + "/api/settings"
          : SHEETS_URL + "?action=settings";
        const res = await fetch(settingsUrl);
        const data = await res.json();
        if (data.holidays) setHolidays(data.holidays);
        if (data.config && data.config.park_open === "false") setParkOpen(false);
      } catch (e) {
        // Settings not available — default to open
      }
    };
    fetchSettings();
  }, []);

  // Holiday date strings as a Set for fast lookup
  const holidaySet = useMemo(() => new Set(holidays.map(h => h.date)), [holidays]);

  // Check if selected date is a holiday
  const selectedHoliday = useMemo(() => {
    if (!date) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    return holidays.find(h => h.date === dateStr) || null;
  }, [date, holidays]);

  const perPerson = priceForDate(date);
  const total = adults * perPerson;
  const weekend = isWeekend(date);
  const isDateBlocked = !parkOpen || !!selectedHoliday;

  const canPay = useMemo(() => (
    date && adults >= 1 && name.trim().length >= 2 && /^[6-9]\d{9}$/.test(phone) && /^\S+@\S+\.\S+$/.test(email) && !isDateBlocked
  ), [date, adults, name, phone, email, isDateBlocked]);

  const handlePay = async () => {
    if (!canPay) {
      toast.error("कृपया पूरा फ़ॉर्म सही से भरें / Please complete the form.");
      return;
    }

    setProcessing(true);
    const bookingId = "AJ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const totalTickets = adults + kidsUnder3;
    const ticketIds = Array.from({ length: totalTickets }, (_, i) =>
      bookingId + "-" + String(i + 1).padStart(2, "0")
    );
    // ── Bypass / Demo mode: skip Razorpay ──
    if (BYPASS || !SHEETS_URL) {
      // Save to local backend if available
      if (API_URL) {
        try {
          const bookingStatus = holdBooking ? "Hold" : "Confirmed";
          const res = await fetch(API_URL + "/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              date: format(date, "yyyy-MM-dd"),
              name: name.trim(),
              phone,
              email: email.trim(),
              adults,
              kidsUnder3,
              rate: perPerson,
              total,
              dayType: weekend ? "Weekend" : "Weekday",
              status: bookingStatus,
            }),
          });
          const data = await res.json();
          if (data.success) {
            ticketIds.length = 0;
            ticketIds.push(...data.ticketIds);
          } else {
            toast.error(data.detail || "Booking failed");
            setProcessing(false);
            return;
          }
        } catch (e) {
          // Backend not running — use client-side ticket IDs
        }
      }

      setBooking({
        bookingId,
        ticketIds,
        date: format(date, "yyyy-MM-dd"),
        name: name.trim(),
        phone,
        email: email.trim(),
        adults,
        kidsUnder3,
        rate: perPerson,
        total,
        dayType: weekend ? "Weekend" : "Weekday",
        paymentId: "DEMO-" + bookingId,
        status: holdBooking ? "Hold" : "Confirmed",
      });
      setModalOpen(true);
      toast.success(holdBooking ? "Booking on hold! (Demo mode)" : "Booking confirmed! (Demo mode — no payment)");
      setDate(null);
      setAdults(2);
      setKidsUnder3(0);
      setName("");
      setPhone("");
      setEmail("");
      setProcessing(false);
      return;
    }

    // ── Real Razorpay flow ──
    try {
      // Step 1: Create Razorpay order via Apps Script
      const orderRes = await fetch(SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-order",
          amount: total,
          bookingId,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        toast.error(orderData.error || "Failed to create order");
        setProcessing(false);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "7 Ajoobe Park",
        description: "Ticket Booking — " + bookingId,
        order_id: orderData.orderId,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: "#1E1B4B",
        },
        handler: async function (response) {
          // Step 3: Verify payment via Apps Script
          try {
            const verifyRes = await fetch(SHEETS_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "verify-payment",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking: {
                  bookingId,
                  date: format(date, "yyyy-MM-dd"),
                  name: name.trim(),
                  phone,
                  email: email.trim(),
                  adults,
                  kidsUnder3,
                  rate: perPerson,
                  total,
                  dayType: weekend ? "Weekend" : "Weekday",
                },
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setBooking({
                bookingId,
                ticketIds: verifyData.ticketIds,
                date: format(date, "yyyy-MM-dd"),
                name: name.trim(),
                phone,
                email: email.trim(),
                adults,
                kidsUnder3,
                rate: perPerson,
                total,
                dayType: weekend ? "Weekend" : "Weekday",
                paymentId: response.razorpay_payment_id,
                status: holdBooking ? "Hold" : "Confirmed",
              });
              setModalOpen(true);
              toast.success("Payment successful! टिकट कन्फर्म।");

              // Reset form
              setDate(null);
              setAdults(2);
              setKidsUnder3(0);
              setName("");
              setPhone("");
              setEmail("");
            } else {
              toast.error(verifyData.error || "Payment verification failed. Contact support.");
            }
          } catch (err) {
            toast.error("Payment received but confirmation pending. Contact support with ID: " + response.razorpay_payment_id);
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <section id="book" className="relative py-24 md:py-36 bg-white overflow-hidden" data-testid="booking-section">
      <div className="pointer-events-none absolute -top-32 right-0 w-[400px] h-[400px] rounded-full bg-brand-yellow/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-brand-teal/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="text-xs font-display font-semibold tracking-[0.3em] uppercase text-brand-orange">
              Book Your Visit
            </span>
            <h2 className="mt-3 font-hindi font-bold text-brand-indigo text-5xl md:text-7xl leading-[0.95]">
              टिकट बुक करें,<br />
              <span className="font-display italic text-brand-teal">skip the line.</span>
            </h2>
          </div>
          <p className="max-w-sm text-brand-ink/70">
            Pick a date, tell us who&apos;s coming, and pay in a single tap. Your QR ticket appears instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Form */}
          <div className="lg:col-span-3 rounded-[2rem] bg-brand-cream/70 p-6 md:p-10 border border-brand-indigo/10">
            <ol className="space-y-8">
              <li>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-brand-orange">01</span>
                  <span className="font-display font-semibold text-brand-indigo">Choose your visit date</span>
                </div>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <button
                      className="w-full flex items-center justify-between rounded-2xl border border-brand-indigo/15 bg-white px-5 py-4 text-left hover:border-brand-indigo/40 transition-colors"
                      data-testid="date-trigger"
                    >
                      <span className={date ? "text-brand-indigo font-semibold" : "text-brand-ink/40"}>
                        {date ? format(date, "EEEE, d MMMM yyyy") : "Select a date"}
                      </span>
                      <CalendarIcon className="w-5 h-5 text-brand-teal" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-brand-indigo/10" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => { setDate(d); setDateOpen(false); }}
                      disabled={(d) => {
                        const ds = format(d, "yyyy-MM-dd");
                        return d < new Date() || holidaySet.has(ds) || !parkOpen;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {date && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1 ${weekend ? "bg-brand-orange/10 text-brand-orange" : "bg-brand-teal/10 text-brand-teal"}`}
                    data-testid="date-badge"
                  >
                    <Sparkles className="w-3 h-3" />
                    {weekend ? "Weekend rate applies — ₹100 per person" : "Weekday rate — ₹50 per person"}
                  </motion.div>
                )}
                {!parkOpen && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1 bg-red-50 text-red-600 border border-red-200">
                    <Ban className="w-3 h-3" /> Park is currently closed
                  </div>
                )}
                {selectedHoliday && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1 bg-red-50 text-red-600 border border-red-200">
                    <Ban className="w-3 h-3" /> {selectedHoliday.reason}
                  </div>
                )}
              </li>

              <li>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-brand-orange">02</span>
                  <span className="font-display font-semibold text-brand-indigo">Who&apos;s coming with you?</span>
                </div>
                <div className="space-y-3">
                  <Counter
                    label="Adults & kids over 3"
                    hi="वयस्क एवं 3 वर्ष से बड़े बच्चे"
                    value={adults}
                    onChange={setAdults}
                    min={1}
                    testId="adults"
                  />
                  <Counter
                    label="Kids under 3 · always FREE"
                    hi="3 वर्ष से छोटे बच्चे · निःशुल्क"
                    value={kidsUnder3}
                    onChange={setKidsUnder3}
                    min={0}
                    testId="kids"
                  />
                </div>
              </li>

              <li>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-brand-orange">03</span>
                  <span className="font-display font-semibold text-brand-indigo">Your details</span>
                </div>
                <div className="grid gap-3">
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-teal" />
                    <Input
                      placeholder="Full name / पूरा नाम"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 rounded-2xl border-brand-indigo/15 bg-white focus-visible:ring-brand-indigo"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-teal" />
                      <Input
                        placeholder="10-digit phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="pl-10 h-12 rounded-2xl border-brand-indigo/15 bg-white focus-visible:ring-brand-indigo"
                        data-testid="input-phone"
                        inputMode="tel"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-teal" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 rounded-2xl border-brand-indigo/15 bg-white focus-visible:ring-brand-indigo"
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                </div>
              </li>
            </ol>

            {/* Hold toggle */}
            <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl border border-brand-indigo/10 bg-white">
              <button
                onClick={() => setHoldBooking(!holdBooking)}
                className={`relative w-11 h-6 rounded-full transition-colors ${holdBooking ? "bg-brand-orange" : "bg-brand-indigo/20"}`}
                data-testid="hold-toggle"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${holdBooking ? "translate-x-5" : ""}`} />
              </button>
              <div>
                <div className="font-display font-semibold text-brand-indigo text-sm">Put on Hold</div>
                <div className="font-hindi text-xs text-brand-ink/60">पक्का करने से पहले होल्ड पर रखें</div>
              </div>
            </div>
          </div>

          {/* Live Summary */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 rounded-[2rem] bg-brand-indigo text-white p-6 md:p-8 shadow-[0_25px_80px_-30px_rgba(30,27,75,0.6)] overflow-hidden relative">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-orange/40 blur-3xl" />
              <div className="relative">
                <div className="text-xs tracking-[0.3em] uppercase text-brand-yellow font-display">Live Summary</div>
                <div className="mt-1 font-hindi text-2xl font-bold">आपका ऑर्डर</div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>Date</span>
                    <span className="font-mono text-white" data-testid="summary-date">
                      {date ? format(date, "d MMM yyyy") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Rate</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={perPerson + String(weekend)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="font-mono text-white"
                        data-testid="summary-rate"
                      >
                        ₹{perPerson} · {weekend ? "Weekend" : "Weekday"}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Adults / Kids 3+</span>
                    <span className="font-mono text-white" data-testid="summary-adults">× {adults}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Kids under 3</span>
                    <span className="font-mono text-brand-yellow" data-testid="summary-kids">
                      × {kidsUnder3} <span className="text-white/50">(FREE)</span>
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/15">
                  <div className="flex items-end justify-between">
                    <div className="text-white/70 text-sm">Total payable</div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={total}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="font-display font-black text-5xl text-brand-yellow leading-none"
                        data-testid="summary-total"
                      >
                        ₹{total}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={processing || isDateBlocked}
                  className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow text-brand-indigo px-6 py-4 font-display font-bold text-base hover:bg-white transition-colors disabled:opacity-70"
                  data-testid="proceed-pay"
                >
                  {processing ? (<><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>) : holdBooking ? "Hold ₹" + total : "Pay ₹" + total}
                </button>
                <p className="mt-3 text-center text-[11px] text-white/50 font-hindi">
                  भुगतान करके आप हमारी शर्तों से सहमत होते हैं।
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SuccessModal open={modalOpen} onOpenChange={setModalOpen} booking={booking} />
    </section>
  );
}
