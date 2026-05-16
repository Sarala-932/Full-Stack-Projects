import {BellRing, PieChart, ShieldCheck, Target, Wallet, Zap} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Unified money view",
    description: "See balances, inflows, and outflows in one focused dashboard instead of juggling tabs.",
  },
  {
    icon: PieChart,
    title: "Category intelligence",
    description: "Break spending into clear patterns so you know exactly where money is moving every week.",
  },
  {
    icon: BellRing,
    title: "Budget guardrails",
    description: "Get timely alerts when expenses drift off plan, before they become end-of-month surprises.",
  },
  {
    icon: Target,
    title: "Goal tracking",
    description: "Turn savings targets into measurable milestones and keep progress visible all month long.",
  },
  {
    icon: Zap,
    title: "Fast daily updates",
    description: "Capture activity quickly and keep your financial picture current without extra admin work.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "Build around trusted authentication and consistent access controls for safer money management.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white px-4 py-24">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">Features</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Everything you need to run a cleaner financial routine
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Each workflow is designed to reduce noise, shorten review time, and help you act faster on
            the numbers that matter.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-[28px] border border-slate-200 bg-slate-50 p-7 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="inline-flex rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-600/20">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
