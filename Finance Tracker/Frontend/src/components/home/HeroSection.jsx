import {ArrowRight, PlayCircle, ShieldCheck, Sparkles, TrendingUp} from "lucide-react";
import {useEffect, useRef} from "react";
import {Link} from "react-router";
import {Button} from "../ui/button";

const highlights = ["AI spending insights", "Smart budget alerts", "Secure account overview"];

const quickStats = [
  {label: "Monthly growth", value: "+18%"},
  {label: "Budgets on track", value: "92%"},
];

export default function HeroSection() {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    if (!imageElement) {
      return undefined;
    }

    const handleScroll = () => {
      if (window.scrollY > 100) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 pt-30 pb-24">
      <div className="absolute inset-0 -z-20 bg-linear-to-br from-blue-50 via-white to-cyan-50" />
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-blue-100/70 to-transparent blur-3xl" />

      <div className="container mx-auto">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            Finance tracking for modern teams and individuals
          </div>

          <h1 className="gradient-title text-5xl leading-tight md:text-7xl lg:text-[96px]">
            Manage Your Money With Calm, Clarity, and Momentum
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
            Wealth Wise helps you track transactions, monitor cash flow, and turn financial noise into clear
            actions with real-time insights and focused reporting.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="px-8">
              <Link to="/sign-in">
                Start Tracking
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="px-8">
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
                <PlayCircle className="size-4" />
                Watch Demo
              </a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-700 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image-wrapper relative mx-auto mt-16 max-w-6xl">
          <div
            ref={imageRef}
            className="hero-image relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.45)]"
          >
            <div className="pointer-events-none absolute left-6 top-6 hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg md:block">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <TrendingUp className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Net Savings</p>
                  <p className="text-lg font-semibold text-slate-900">$18,240</p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6 hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg lg:block">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Protected</p>
                  <p className="text-lg font-semibold text-slate-900">Bank-grade security</p>
                </div>
              </div>
            </div>

            <img
              src="/banner.svg"
              width={1280}
              height={720}
              alt="Wealth Wise dashboard preview"
              className="mx-auto rounded-[22px] border border-slate-200 object-cover"
            />
          </div>

          <div className="mx-auto mt-6 grid max-w-3xl gap-4 md:grid-cols-2">
            {quickStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white/90 p-5 text-left shadow-sm backdrop-blur"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
