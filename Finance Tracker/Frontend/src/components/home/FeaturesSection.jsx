import {BellRing, PieChart, ShieldCheck, Target, Wallet, Zap} from "lucide-react";

const features = [
    {
        icon: Wallet,
        title: "Unified money view",
        description: "See balances, inflows, and outflows in one focused dashboard instead of juggling tabs.",
        cardBg: "bg-blue-50/95",
        iconBg: "bg-blue-600",
        iconShadow: "shadow-blue-600/20",
    },
    {
        icon: PieChart,
        title: "Category intelligence",
        description:
            "Break spending into clear patterns so you know exactly where money is moving every week.",
        cardBg: "bg-purple-50/95",
        iconBg: "bg-purple-600",
        iconShadow: "shadow-purple-600/20",
    },
    {
        icon: BellRing,
        title: "Budget guardrails",
        description:
            "Get timely alerts when expenses drift off plan, before they become end-of-month surprises.",
        cardBg: "bg-orange-50/95",
        iconBg: "bg-orange-500",
        iconShadow: "shadow-orange-500/20",
    },
    {
        icon: Target,
        title: "Goal tracking",
        description:
            "Turn savings targets into measurable milestones and keep progress visible all month long.",
        cardBg: "bg-emerald-50/95",
        iconBg: "bg-emerald-600",
        iconShadow: "shadow-emerald-600/20",
    },
    {
        icon: Zap,
        title: "Fast daily updates",
        description:
            "Capture activity quickly and keep your financial picture current without extra admin work.",
        cardBg: "bg-cyan-50/95",
        iconBg: "bg-cyan-500",
        iconShadow: "shadow-cyan-500/20",
    },
    {
        icon: ShieldCheck,
        title: "Secure by default",
        description:
            "Build around trusted authentication and consistent access controls for safer money management.",
        cardBg: "bg-rose-50/95",
        iconBg: "bg-rose-500",
        iconShadow: "shadow-rose-500/20",
    },
];

export default function FeaturesSection() {
    return (
        <section className="relative bg-transparent px-4 py-18 overflow-hidden">
            <div className="absolute inset-0 -z-20 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900" />
            <div className="container mx-auto">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-4 inline-flex items-center rounded-full bg-indigo-500/10 px-5 py-2 text-sm font-bold uppercase tracking-widest text-indigo-300 shadow-sm backdrop-blur-md border border-indigo-400/20">
                        Features
                    </div>
                    <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                        Everything you need to run a cleaner financial routine
                    </h2>
                    <p className="mt-5 text-lg leading-8 text-indigo-200">
                        Each workflow is designed to reduce noise, shorten review time, and help you act
                        faster on the numbers that matter.
                    </p>
                </div>

                <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className={`rounded-[28px] ${feature.cardBg} p-8 shadow-xl transition-transform duration-200 hover:-translate-y-1 backdrop-blur-xl border border-white/20`}
                            >
                                <div
                                    className={`inline-flex rounded-2xl ${feature.iconBg} p-3 text-white shadow-lg ${feature.iconShadow}`}
                                >
                                    <Icon className="size-6" />
                                </div>
                                <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
                                <p className="mt-3 text-base leading-7 text-slate-600 font-medium">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
