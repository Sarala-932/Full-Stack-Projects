import {ArrowRight} from "lucide-react";
import {Link} from "react-router";
import {Button} from "../ui/button";

export default function CTASection() {
  return (
    <section className="relative bg-transparent px-4 py-18 overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-linear-to-br from-blue-950 to-slate-950" />
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-[36px] bg-linear-to-r from-blue-700 via-cyan-600 to-emerald-500 px-8 py-16 text-white shadow-[0_35px_100px_-35px_rgba(14,165,233,0.45)] md:px-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/75">Ready To Start</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Build a financial system you can actually trust every day
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/85">
              Sign in, organize your accounts, and turn scattered transaction history into focused, useful
              decisions.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="px-6 py-8 text-lg">
              <Link to="/sign-in">
                Login to Wealth Wise
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 px-6 text-lg py-8 text-white hover:bg-white/20"
            >
              <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
                Watch walkthrough
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
