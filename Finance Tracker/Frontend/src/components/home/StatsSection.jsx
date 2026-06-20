const stats = [
  {value: "50K+", label: "Transactions organized every month"},
  {value: "4.9/5", label: "Average satisfaction score"},
  {value: "12 hrs", label: "Saved per month on manual tracking"},
  {value: "99.9%", label: "Platform uptime for your daily workflow"},
];

export default function StatsSection() {
    return (
        <section className="relative z-10 px-4 py-10 overflow-hidden">
            <div className="absolute inset-0 -z-20 bg-linear-to-br from-blue-900 via-indigo-950 to-slate-900" />
            <div className="container mx-auto">
                <div className="grid grid-cols-2  md:grid-cols-4 md:divide-x md:divide-y-0">
                    {stats.map((stat) => (
                        <div key={stat.label} className="py-6 text-center md:py-0">
                            <div className="bg-linear-to-br from-cyan-400 to-blue-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                                {stat.value}
                            </div>
                            <div className="mx-auto mt-2 max-w-[16rem] text-sm font-medium leading-6 text-indigo-200">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
