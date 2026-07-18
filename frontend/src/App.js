import "@/App.css";
import { Toaster } from "sonner";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Manifesto from "@/components/Manifesto";
import Wonders from "@/components/Wonders";
import Booking from "@/components/Booking";
import Pricing from "@/components/Pricing";
import Terms from "@/components/Terms";
import Footer from "@/components/Footer";

function App() {
  return (
    <div className="App">
      <SmoothScroll>
        <div className="grain relative" data-testid="home-root">
          <Header />
          <main>
            <Hero />
            <Marquee />
            <Manifesto />
            <Wonders />
            <Booking />
            <Pricing />
            <Terms />
            <Footer />
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1E1B4B",
                color: "#FACC15",
                border: "1px solid rgba(250, 204, 21, 0.2)",
                borderRadius: "999px",
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        </div>
      </SmoothScroll>
    </div>
  );
}

export default App;
