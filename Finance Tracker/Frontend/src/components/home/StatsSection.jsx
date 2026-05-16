const stats = [
  {value: "50K+", label: "Transactions organized every month"},
  {value: "4.9/5", label: "Average satisfaction score"},
  {value: "12 hrs", label: "Saved per month on manual tracking"},
  {value: "99.9%", label: "Platform uptime for your daily workflow"},
];

export default function StatsSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-4 py-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold tracking-tight text-blue-600 md:text-5xl">{stat.value}</div>
              <div className="mx-auto mt-3 max-w-[16rem] text-sm leading-6 text-slate-600 md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
