import Image from "next/image";
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
      activityDuration: "PT40M",
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

const screenshots = {
  workout: { src: "/screenshots/workout1.webp", label: "Today's workout" },
  tracking: { src: "/screenshots/workout2withrest.webp", label: "Track your sets" },
  progress: { src: "/screenshots/stats1.webp", label: "Progress over time" },
  history: { src: "/screenshots/history.webp", label: "Session history" },
  stats: { src: "/screenshots/stats2.webp", label: "Stats & records" },
} as const;

type ScreenVariant = keyof typeof screenshots;

function AppScreenshot({ variant }: { variant: ScreenVariant }) {
  const { src, label } = screenshots[variant];
  return (
    <div className="flex w-[180px] flex-shrink-0 flex-col items-center gap-2">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
        <Image
          src={src}
          alt={label}
          width={393}
          height={852}
          unoptimized
          className="block w-full"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
      </div>
    </div>
  );
}

function FeatureSection({
  eyebrow,
  title,
  description,
  items,
  screenVariant,
  reverse,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  screenVariant: ScreenVariant;
  reverse?: boolean;
}) {
  return (
    <section className="border-t border-white/5 py-20">
      <div
        className={`mx-auto flex max-w-2xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:gap-16 ${
          reverse ? "lg:flex-row-reverse" : ""
        }`}
      >
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500/70">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
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
        <div className="flex flex-shrink-0 justify-center">
          <AppScreenshot variant={screenVariant} />
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
    <div className="mx-auto min-h-screen max-w-2xl bg-[#0a0a0a] text-white">
      <JsonLd headline={headline} description={heroDescription} faq={faq} />

      {/* Nav */}
      <nav className="border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
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

      {/* Hero */}
      <header className="px-6 pt-20 pb-16 text-center sm:pt-24 sm:pb-20">
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-400">
          {subheadline}
        </p>
        <div className="mt-10">
          <Link
            href="/program"
            className="inline-block rounded-xl bg-red-500 px-7 py-3.5 text-base font-semibold transition-colors hover:bg-red-600"
          >
            Start Training Free
          </Link>
        </div>
      </header>

      {/* App screenshots */}
      <section className="overflow-hidden pb-12">
        <div className="flex justify-center gap-4 px-6">
          <AppScreenshot variant="workout" />
          <AppScreenshot variant="tracking" />
          <div className="hidden sm:block">
            <AppScreenshot variant="progress" />
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="border-y border-white/5 py-10">
        <div className="grid grid-cols-4 gap-4 px-6 text-center">
          <div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="mt-1 text-[10px] text-zinc-500 sm:text-xs">days/week</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">40</p>
            <p className="mt-1 text-[10px] text-zinc-500 sm:text-xs">min/session</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="mt-1 text-[10px] text-zinc-500 sm:text-xs">kettlebell</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">$4</p>
            <p className="mt-1 text-[10px] text-zinc-500 sm:text-xs">per month</p>
          </div>
        </div>
      </section>

      {/* The Program teaser */}
      <section className="border-b border-white/5 py-20">
        <div className="px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500/70">
            The program
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Built around the kettlebell complex.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Every session opens with a kettlebell complex: swings, cleans,
            squats, presses, windmills. Functional strength and conditioning
            in one continuous flow. Then a focused hypertrophy superset
            and finisher.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
          "Log sets as you go: weight, reps, notes",
          "See your last session's numbers inline",
          "Rest timer with audio cues",
          "Tempo guidance on every exercise",
        ]}
        screenVariant="tracking"
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
        screenVariant="history"
        reverse
      />

      {/* Feature: Program Design */}
      <FeatureSection
        eyebrow="Program design"
        title="Opinionated. On purpose."
        description="This isn't a random workout generator. It's a single, carefully designed program. Every exercise, every tempo, every rep range has a reason. You don't have to think. Just follow the plan."
        items={[
          "Kettlebell complex for conditioning and strength",
          "Hypertrophy supersets for muscle",
          "Tempo-controlled reps for real time under tension",
          "Push / pull / carry split across three days",
        ]}
        screenVariant="workout"
      />

      {/* Small features grid */}
      <section className="border-t border-white/5 py-16">
        <div className="px-6">
          <div className="grid gap-8 sm:grid-cols-2">
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
        <div className="px-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            Simple pricing. No gimmicks.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">
            Browse the program for free. Subscribe to track your workouts
            and see your progress over time.
          </p>

          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/10 bg-[#1a1a1a] px-6 py-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Monthly</p>
            <div className="mt-3 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold tracking-tight text-white">$4</span>
              <span className="text-sm text-zinc-500">/mo</span>
            </div>
            <p className="mt-2 text-xs text-zinc-600">Cancel anytime</p>

            <div className="my-6 h-px bg-white/5" />

            <ul className="space-y-2.5 text-sm">
              {[
                "Full program access",
                "Log sets, reps, and weight",
                "Session history",
                "Progress charts",
                "Built-in rest timer",
                "Works on any device",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg className="h-3.5 w-3.5 shrink-0 text-red-500/70" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm2.854 4.146a.5.5 0 00-.708 0L7 8.793 5.854 7.646a.5.5 0 10-.708.708l1.5 1.5a.5.5 0 00.708 0l3.5-3.5a.5.5 0 000-.708z" />
                  </svg>
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/program"
              className="mt-7 block rounded-xl bg-red-500 py-3 text-center text-sm font-semibold transition-colors hover:bg-red-600"
            >
              Start Training
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 py-16">
        <div className="px-6">
          <h2 className="mb-8 text-xl font-bold text-white">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faq} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5 py-16">
        <div className="px-6 text-center">
          <h2 className="text-2xl font-bold">Ready to start?</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Try the first workout free. No sign-up required.
          </p>
          <div className="mt-6">
            <Link
              href="/program"
              className="inline-block rounded-xl bg-red-500 px-7 py-3.5 text-base font-semibold transition-colors hover:bg-red-600"
            >
              Start Training Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="px-6 text-center text-xs text-zinc-600">
          Dungym. A workout program by Taylor Prince.
        </div>
      </footer>
    </div>
  );
}
