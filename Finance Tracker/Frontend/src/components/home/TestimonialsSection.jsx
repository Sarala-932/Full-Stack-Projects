import {Star} from "lucide-react";

const testimonials = [
    {
        quote: "Wealth Wise replaced the spreadsheet chaos. I can review expenses, spot patterns, and close the month without guesswork.",
        name: "Maya Thompson",
        role: "Operations Lead",
    },
    {
        quote: "The dashboard makes budget drift obvious. It saves time every week and gives our team a calmer review process.",
        name: "Daniel Brooks",
        role: "Startup Founder",
    },
    {
        quote: "I wanted something simple but smart. The insights are useful, and the interface does not feel noisy or bloated.",
        name: "Aisha Khan",
        role: "Independent Consultant",
    },
];

export default function TestimonialsSection() {
    return (
        <section className="relative bg-transparent px-4 py-18 overflow-hidden">
            <div className="absolute inset-0 -z-20 bg-linear-to-b from-slate-900 via-indigo-950 to-blue-950" />
            <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="container mx-auto">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-4 inline-flex items-center rounded-full bg-indigo-500/10 px-5 py-2 text-sm font-bold uppercase tracking-widest text-indigo-300 shadow-sm backdrop-blur-md border border-indigo-400/20">
                        Testimonials
                    </div>
                    <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white md:text-4xl">
                        Trusted by people who want clarity, not spreadsheet fatigue
                    </h2>
                </div>

                <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.name}
                            className="group relative overflow-hidden rounded-[28px] border border-slate-700/50 bg-linear-to-br from-slate-800/80 via-slate-800/60 to-indigo-900/30 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-cyan-400/50"
                        >
                            {/* Colorful Top Border Accent */}
                            <div className="absolute top-0 left-0 h-1.5 w-full bg-linear-to-r from-blue-400 via-cyan-400 to-pink-400 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
                            
                            <div className="absolute inset-0 -z-10 bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="flex gap-1 text-amber-400">
                                {Array.from({length: 5}).map((_, index) => (
                                    <Star key={index} className="size-4 fill-current" />
                                ))}
                            </div>
                            <p className="mt-6 text-lg leading-8 text-indigo-100">{testimonial.quote}</p>
                            <div className="mt-8">
                                <p className="text-base font-semibold text-white">{testimonial.name}</p>
                                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                                    {testimonial.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
