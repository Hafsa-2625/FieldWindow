import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/landing/Reveal";
import { SprayDemo, HarvestDemo } from "@/components/landing/HowDemos";

export const metadata: Metadata = {
  title: "FieldWindow — a tiny window into when to spray & harvest",
  description:
    "Cute go/no-go weather for small plots. Safe spray hours and dry harvest stretches, planned from free WeatherAI forecasts.",
};

export default function LandingPage() {
  return (
    <div className="landing-root">
      <section className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/landing-hero-orchard.png"
          alt="Soft illustrated view through a window onto a misty orchard at dawn"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="landing-hero-veil pointer-events-none absolute inset-0" />

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <nav className="flex items-center justify-between px-6 py-5 sm:px-10">
            <span className="font-display text-xl tracking-tight text-paper drop-shadow-sm sm:text-2xl">
              FieldWindow
            </span>
            <Link
              href="/app"
              className="rounded-xl bg-paper/95 px-4 py-2 text-sm font-semibold text-canopy shadow-sm transition duration-300 hover:bg-paper"
            >
              Open planner
            </Link>
          </nav>

          <div className="flex flex-1 flex-col justify-end px-6 pb-16 pt-10 sm:px-10 sm:pb-20">
            <p className="landing-rise font-display text-xs uppercase tracking-[0.28em] text-frost/90">
              For little orchards &amp; big decisions
            </p>
            <h1 className="landing-rise landing-rise-delay-1 mt-3 max-w-2xl font-display text-5xl font-medium leading-[1.05] text-paper sm:text-6xl md:text-7xl">
              FieldWindow
            </h1>
            <p className="landing-rise landing-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-paper/90 sm:text-lg">
              A soft little window that turns the forecast into two answers:
              when it&apos;s safe to spray, and which dry days are worth harvest
              day.
            </p>
            <div className="landing-rise landing-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-xl bg-canopy px-6 py-3 text-sm font-semibold text-paper transition duration-300 hover:bg-moss"
              >
                Peek outside
              </Link>
              <a
                href="#how"
                className="rounded-xl border border-paper/50 bg-paper/10 px-6 py-3 text-sm font-semibold text-paper backdrop-blur-sm transition duration-300 hover:bg-paper/20"
              >
                How it works
              </a>
            </div>
          </div>
        </div>

        <span aria-hidden className="landing-leaf landing-leaf-a" />
        <span aria-hidden className="landing-leaf landing-leaf-b" />
        <span aria-hidden className="landing-leaf landing-leaf-c" />
      </section>

      <section
        id="how"
        className="landing-how relative overflow-hidden px-6 py-20 sm:px-10 sm:py-28"
      >
        <span aria-hidden className="how-float how-float-a" />
        <span aria-hidden className="how-float how-float-b" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <p className="font-display text-xs uppercase tracking-[0.28em] text-canopy/80">
              Peek inside
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl text-ink sm:text-4xl md:text-[2.75rem] md:leading-tight">
              Two quiet answers. Not a wall of charts.
            </h2>
            <p className="mt-4 max-w-lg text-ink/60">
              FieldWindow reads the sky, then draws a friendly yes / maybe / no —
              like opening the shutter and knowing the day.
            </p>
          </Reveal>

          <div className="mt-14 space-y-14 sm:space-y-20">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <Reveal delayMs={60}>
                <p className="inline-flex items-center gap-2 font-display text-sm tracking-wide text-canopy">
                  <span className="how-dot bg-canopy" />
                  Spray strip
                </p>
                <h3 className="mt-3 font-display text-2xl text-ink sm:text-[1.7rem]">
                  Hours that won&apos;t wash your work away
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">
                  Soft greens mean go. Honey means caution. Coral means wait for
                  the rain to pass. Tap any hour later in the planner for the why.
                </p>
              </Reveal>
              <Reveal delayMs={140}>
                <SprayDemo />
              </Reveal>
            </div>

            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <Reveal delayMs={60} className="order-2 lg:order-1">
                <HarvestDemo />
              </Reveal>
              <Reveal delayMs={140} className="order-1 lg:order-2">
                <p className="inline-flex items-center gap-2 font-display text-sm tracking-wide text-sky">
                  <span className="how-dot bg-sky" />
                  Harvest stretch
                </p>
                <h3 className="mt-3 font-display text-2xl text-ink sm:text-[1.7rem]">
                  The longest dry run on the calendar
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">
                  Seven little days. Wet ones wear a cloud; the best dry stretch
                  lights up in leaf-green so you can plan baskets, not
                  spreadsheets.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-close relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="font-display text-4xl text-ink sm:text-5xl">
              Ready when the orchard is.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink/65">
              Auto-locate, or tap Nairobi, Bomet, Eldoret and friends. One
              forecast load powers the whole planner.
            </p>
            <Link
              href="/app"
              className="mt-8 inline-block rounded-xl bg-canopy px-8 py-3.5 text-sm font-semibold text-paper transition duration-300 hover:bg-moss hover:shadow-md"
            >
              Open the planner
            </Link>
          </Reveal>
        </div>
        <span aria-hidden className="landing-blob landing-blob-1" />
        <span aria-hidden className="landing-blob landing-blob-2" />
      </section>

      <footer className="landing-footer border-t border-ink/10">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-14">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <p className="font-display text-2xl text-ink">FieldWindow</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">
                A small spray &amp; harvest planner for orchards — go/no-go from
                the free WeatherAI forecast, without drowning in charts.
              </p>
            </div>

            <div className="flex flex-wrap gap-10 sm:gap-14">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
                  Explore
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/app"
                      className="text-ink/70 transition duration-300 hover:text-canopy"
                    >
                      Open planner
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#how"
                      className="text-ink/70 transition duration-300 hover:text-canopy"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://weather-ai.co/docs"
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink/70 transition duration-300 hover:text-canopy"
                    >
                      WeatherAI docs
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
                  Free tier
                </p>
                <ul className="mt-3 space-y-1.5 font-mono text-xs text-ink/45">
                  <li>/v1/weather-geo</li>
                  <li>/v1/hourly</li>
                  <li>/v1/daily</li>
                  <li>/v1/usage</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-ink/10 pt-6 text-xs text-ink/40 sm:flex-row sm:items-center sm:justify-between">
            <p>Built as a WeatherAI take-home · quota-aware by design</p>
            <Link
              href="/app"
              className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-canopy/10 px-3 py-1.5 font-medium text-canopy transition duration-300 hover:bg-canopy hover:text-paper"
            >
              Peek outside
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
