import Link from "next/link";
import { FaqAccordion } from "./faq-accordion";

type LandingPageProps = {
  headline: string;
  subheadline: string;
  heroDescription: string;
  features: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
};

function JsonLd({
  headline,
  description,
  faq,
}: {
  headline: string;
  description: string;
  faq: { question: string; answer: string }[];
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dungym.com";

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Dungym",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      description,
      offers: {
        "@type": "Offer",
        price: "4",
        priceCurrency: "USD",
        description:
          "Free to view the program. $4/mo for workout tracking, progress charts, and session history.",
      },
      author: {
        "@type": "Person",
        name: "Taylor Prince",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ExercisePlan",
      name: headline,
      description,
      exerciseType: [
        "Kettlebell Training",
        "Strength Training",
        "Functional Fitness",
      ],
      activityFrequency: "3 days per week",
      activityDuration: "PT45M",
      author: {
        "@type": "Person",
        name: "Taylor Prince",
      },
      url: baseUrl,
    },
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

function DungymLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 2L14.5 16.5L16 18L17.5 16.5L16 2Z" fill="#d4d4d8" />
      <rect x="10" y="17.5" width="12" height="2" rx="1" fill="#a1a1aa" />
      <rect x="14.75" y="19.5" width="2.5" height="6" rx="0.5" fill="#71717a" />
      <circle cx="16" cy="27.5" r="2" fill="#a1a1aa" />
    </svg>
  );
}

function AppScreenshot({ label }: { label: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]">
      {/* Placeholder — replace with actual screenshots */}
      <div className="aspect-[9/16] w-full max-w-[280px]">
        {/* Red gradient glow at top */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 via-red-500/5 to-[#0a0a0a]/80" />
        {/* Simulated UI lines */}
        <div className="relative flex h-full flex-col justify-between p-5 pt-10">
          <div className="space-y-3">
            <div className="h-2.5 w-20 rounded-full bg-white/10" />
            <div className="h-2 w-32 rounded-full bg-white/5" />
            <div className="mt-6 space-y-2">
              <div className="h-8 w-full rounded-lg bg-white/[0.04]" />
              <div className="h-8 w-full rounded-lg bg-white/[0.04]" />
              <div className="h-8 w-full rounded-lg bg-white/[0.04]" />
            </div>
          </div>
          {/* Fade to background at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
        </div>
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function FeatureSection({
  eyebrow,
  title,
  description,
  items,
  screenshotLabel,
  reverse,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  screenshotLabel: string;
  reverse?: boolean;
}) {
  return (
    <section className="border-t border-white/5 py-20">
      <div
        className={`mx-auto flex max-w-5xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:gap-16 ${
          reverse ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Text */}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500/70">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            {description}
          </p>
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 text-red-500/60">&#9670;</span>
                <span className="text-zinc-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Screenshot */}
        <div className="flex flex-shrink-0 justify-center">
          <AppScreenshot label={screenshotLabel} />
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({
  headline,
  subheadline,
  heroDescription,
  features,
  faq,
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <JsonLd headline={headline} description={heroDescription} faq={faq} />

      {/* Nav */}
      <nav className="border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <DungymLogo />
            <span className="text-lg font-bold">Dungym</span>
          </Link>
          <Link
            href="/program"
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold transition-colors hover:bg-red-600"
          >
            Start Training
          </Link>
        </div>
      </nav>

      {/* Hero — centered */}
      <header className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-zinc-400 sm:text-lg">
          {subheadline}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/program"
            className="rounded-xl bg-red-500 px-6 py-3 text-base font-semibold transition-colors hover:bg-red-600"
          >
            Try the First Workout
          </Link>
          <span className="text-sm text-zinc-500">
            Free to start &middot;{" "}
            <span className="text-zinc-300">$4/mo</span> for full access
          </span>
        </div>
      </header>

      {/* App screenshots — centered below hero */}
      <section className="overflow-hidden pb-8">
        <div className="mx-auto flex justify-center gap-5 px-6">
          <AppScreenshot label="Today's workout" />
          <AppScreenshot label="Track your sets" />
          <div className="hidden sm:block">
            <AppScreenshot label="Progress over time" />
          </div>
        </div>
      </section>

      {/* Quick stats bar */}
      <section className="border-y border-white/5 py-10">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4">
          <div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="mt-1 text-xs text-zinc-500">days per week</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">~45</p>
            <p className="mt-1 text-xs text-zinc-500">min per session</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">2</p>
            <p className="mt-1 text-xs text-zinc-500">kettlebells needed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">$4</p>
            <p className="mt-1 text-xs text-zinc-500">per month</p>
          </div>
        </div>
      </section>

      {/* The Program — teaser, not giveaway */}
      <section className="border-b border-white/5 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500/70">
            The program
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Built around the kettlebell complex.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Every session opens with a kettlebell complex — swings, cleans,
            squats, presses, windmills — that builds functional strength and
            conditioning in one continuous flow. Then you move to a focused
            hypertrophy superset and finisher.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Mon
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-200">
                Push / Anti-Extension
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Complex + superset + finisher
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Wed
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-200">
                Pull / Anti-Rotation
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Complex + superset + finisher
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Fri
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-200">
                Carry / Total Body
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Complex + superset + finisher
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Workout Tracking */}
      <FeatureSection
        eyebrow="Workout tracking"
        title="Log every set. Know where you stand."
        description="Track weight, reps, and RPE for every exercise. The app remembers your last session so you know exactly what to beat. Built-in rest timer keeps you honest between sets."
        items={[
          "Log sets as you go — weight, reps, notes",
          "See your last session's numbers inline",
          "Rest timer with audio cues",
          "Tempo guidance on every exercise",
        ]}
        screenshotLabel="Set tracking"
      />

      {/* Feature: Progress */}
      <FeatureSection
        eyebrow="Progress"
        title="Watch your numbers go up."
        description="Every session you save builds your history. See your weights and reps trend over time with simple progress charts. Know when it's time to move to a heavier bell."
        items={[
          "Progress charts for every exercise",
          "Session history with full details",
          "Track weight and reps over time",
          "Clear signal when it's time to progress",
        ]}
        screenshotLabel="Progress charts"
        reverse
      />

      {/* Feature: Program Design */}
      <FeatureSection
        eyebrow="Program design"
        title="Opinionated. On purpose."
        description="This isn't a random workout generator. It's a single, carefully designed program. Every exercise, every tempo, every rep range has a reason. You don't have to think — just follow the plan."
        items={[
          "Kettlebell complex for conditioning and strength",
          "Hypertrophy supersets for muscle",
          "Tempo-controlled reps for real time under tension",
          "Push / pull / carry split across three days",
        ]}
        screenshotLabel="The program"
      />

      {/* Small features grid from data */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title}>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/5 py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            Simple pricing. No gimmicks.
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Browse the full program for free. Subscribe to track your workouts
            and see your progress over time.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-[#1a1a1a] p-8">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-white">$4</span>
              <span className="text-zinc-500">/mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-left text-sm">
              {[
                "Full program access",
                "Log sets, reps, and weight",
                "Session history",
                "Progress charts",
                "Built-in rest timer",
                "Works on any device",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-red-500/70">&#9670;</span>
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/program"
              className="mt-8 block w-full rounded-xl bg-red-500 py-3.5 text-center text-base font-semibold transition-colors hover:bg-red-600"
            >
              Start Training
            </Link>
            <p className="mt-3 text-xs text-zinc-600">
              Cancel anytime. No contracts.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-8 text-xl font-bold text-white">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faq} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-2xl font-bold">Ready to start?</h2>
          <p className="mt-2 text-zinc-400">
            View the full program. No sign-up required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/program"
              className="rounded-xl bg-red-500 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-red-600"
            >
              View the Program
            </Link>
            <span className="text-sm text-zinc-500">
              Free to browse &middot;{" "}
              <span className="text-zinc-300">$4/mo</span> to track
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-xs text-zinc-600">
          Dungym — A workout program by Taylor Prince
        </div>
      </footer>
    </div>
  );
}
