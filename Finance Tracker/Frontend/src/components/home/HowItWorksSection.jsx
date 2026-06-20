import {ArrowRight, FileText, LineChart, WalletCards} from "lucide-react";

const steps = [
  {
    icon: WalletCards,
    step: "Step 1",
    title: "Connect your workflow",
    description: "Start by signing in and setting up the accounts, categories, and budgets you actually use.",
  },
  {
    icon: FileText,
    step: "Step 2",
    title: "Track every movement",
    description: "Add transactions quickly and keep each expense, transfer, and saving event in one place.",
  },
  {
    icon: LineChart,
    step: "Step 3",
    title: "Review and optimize",
    description: "Use performance summaries and alerts to tighten spending and improve monthly decisions.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative bg-transparent px-4 py-18 text-white overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950" />
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-300">How It Works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            A simple flow that turns financial data into daily confidence
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            You do not need a complicated setup. Start small, keep data current, and let the platform surface
            the patterns worth acting on.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="relative rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex rounded-2xl bg-white/10 p-3 text-blue-200">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm uppercase tracking-[0.35em] text-slate-400">{item.step}</span>
                </div>

                <h3 className="mt-8 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-slate-300">{item.description}</p>

                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden size-6 -translate-y-1/2 text-blue-300 lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
