import {Star} from "lucide-react";

const testimonials = [
  {
    quote:
      "Wealth Wise replaced the spreadsheet chaos. I can review expenses, spot patterns, and close the month without guesswork.",
    name: "Maya Thompson",
    role: "Operations Lead",
  },
  {
    quote:
      "The dashboard makes budget drift obvious. It saves time every week and gives our team a calmer review process.",
    name: "Daniel Brooks",
    role: "Startup Founder",
  },
  {
    quote:
      "I wanted something simple but smart. The insights are useful, and the interface does not feel noisy or bloated.",
    name: "Aisha Khan",
    role: "Independent Consultant",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-slate-50 px-4 py-24">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">Testimonials</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Trusted by people who want clarity, not spreadsheet fatigue
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.35)]"
            >
              <div className="flex gap-1 text-amber-400">
                {Array.from({length: 5}).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-6 text-lg leading-8 text-slate-700">{testimonial.quote}</p>
              <div className="mt-8">
                <p className="text-base font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
