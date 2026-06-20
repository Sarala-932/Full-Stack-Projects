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
    <section className="relative overflow-hidden px-4 pt-30 pb-20">
      <div className="absolute inset-0 -z-20 bg-linear-to-br from-indigo-950 via-slate-900 to-blue-900" />
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-linear-to-b from-blue-600/20 to-transparent blur-3xl" />
      
      <div className="absolute -top-40 -right-40 -z-10 h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <div className="absolute top-40 -left-40 -z-10 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[120px]" />

      <div className="container mx-auto">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-200 shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            Finance tracking for modern teams and individuals
          </div>

          <h1 className="bg-linear-to-br from-white via-indigo-100 to-cyan-200 bg-clip-text text-transparent font-extrabold tracking-tighter pb-2 text-4xl leading-tight md:text-6xl lg:text-7xl">
            Manage Your Money With Calm, Clarity, and Momentum
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-indigo-200 md:text-lg md:leading-8">
            Wealth Wise helps you track transactions, monitor cash flow, and turn financial noise
            into clear actions with real-time insights and focused reporting.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-6 py-8 text-lg bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20 cursor-pointer">
              <Link to="/sign-in">
                Start Tracking
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 py-8 text-lg text-white border-white/20 bg-white/5 hover:bg-white/10 hover:text-white backdrop-blur cursor-pointer"
            >
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
                <PlayCircle className="size-4" />
                Watch Demo
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-full border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-indigo-200 shadow-sm backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image-wrapper relative mx-auto mt-14 max-w-5xl">
          <div
            ref={imageRef}
            className="hero-image relative rounded-[28px] border border-slate-700 bg-slate-800/40 p-3 shadow-[0_30px_100px_-30px_rgba(37,99,235,0.45)] backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -left-8 bottom-16 z-10 hidden rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl md:block lg:-left-12">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-2 text-emerald-400">
                  <TrendingUp className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Net Savings</p>
                  <p className="text-lg font-semibold text-white">$18,240</p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-8 bottom-12 z-10 hidden rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-xl lg:block lg:-right-12">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/20 p-2 text-blue-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Protected</p>
                  <p className="text-lg font-semibold text-white">Bank-grade security</p>
                </div>
              </div>
            </div>

            <img
              src="/banner.svg"
              width={1280}
              height={720}
              alt="Wealth Wise dashboard preview"
              className="mx-auto h-auto w-full rounded-[22px] border border-slate-700 bg-transparent object-contain shadow-2xl"
            />
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
            {quickStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 text-left shadow-lg backdrop-blur-md"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
