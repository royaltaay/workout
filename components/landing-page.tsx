import Image from "next/image";
import Link from "next/link";
import { FaqAccordion } from "./faq-accordion";
import { landingPages } from "@/lib/landing-pages";

type LandingPageProps = {
  headline: string;
  subheadline: string;
  heroDescription: string;
  features: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  slug?: string;
  breadcrumbTitle?: string;
};

function JsonLd({
  headline,
  description,
  faq,
  slug,
  breadcrumbTitle,
}: {
  headline: string;
  description: string;
  faq: { question: string; answer: string }[];
  slug?: string;
  breadcrumbTitle?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dungym.com";
  const pageUrl = slug ? `${baseUrl}/workout/${slug}` : baseUrl;

  const schemas: Record<string, unknown>[] = [
    // Organization schema - establishes brand entity
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Dungym",
      url: baseUrl,
      logo: `${baseUrl}/icon.png`,
      description:
        "A 3-day kettlebell strength program built around a functional complex plus hypertrophy supersets. Designed for home and garage gyms.",
      founder: {
        "@type": "Person",
        name: "Taylor Prince",
      },
      sameAs: [],
    },
    // WebSite schema with SearchAction for sitelinks search box
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Dungym",
      url: baseUrl,
      description:
        "A 3-day-a-week kettlebell strength program you can do at home.",
      publisher: {
        "@type": "Organization",
        name: "Dungym",
      },
    },
    // SoftwareApplication schema
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Dungym",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      description,
      url: baseUrl,
      offers: {
        "@type": "Offer",
        price: "5",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description:
          "Free to try Day 1. $5/mo for the full program, workout tracking, and progress charts.",
      },
      author: {
        "@type": "Person",
        name: "Taylor Prince",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "47",
        bestRating: "5",
        worstRating: "1",
      },
    },
    // FAQPage schema for rich snippets
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
    // ExercisePlan schema
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
      intensity: "Moderate to High",
      author: {
        "@type": "Person",
        name: "Taylor Prince",
      },
      url: pageUrl,
    },
    // BreadcrumbList schema for navigation hierarchy
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        ...(slug
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: breadcrumbTitle || headline,
                item: pageUrl,
              },
            ]
          : []),
      ],
    },
    // HowTo schema - shows as rich snippet for "how to" searches
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Do the Dungym Kettlebell Workout",
      description:
        "A step-by-step guide to performing the Dungym kettlebell complex and superset workout. Each session takes about 40 minutes.",
      totalTime: "PT40M",
      tool: [
        { "@type": "HowToTool", name: "Kettlebell (24kg men / 16kg women)" },
        { "@type": "HowToTool", name: "Flat bench" },
        { "@type": "HowToTool", name: "Pull-up bar" },
      ],
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Warm Up",
          text: "5 minutes of hip 90/90s, arm bars, and light mobility work to prepare joints and activate muscles.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Kettlebell Complex Round 1",
          text: "Single-arm swings (10/arm), clean to front squat to press (5/arm), windmills (5-8/side). Rest 90-120 seconds.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Kettlebell Complex Rounds 2-3",
          text: "Repeat the complex for 2 more rounds with 90-120 seconds rest between rounds. Focus on clean form especially in round 3.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Hypertrophy Superset",
          text: "Perform the day's superset (push, pull, or carry focus) for 3 rounds with prescribed tempo. Log weight and reps.",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Finisher",
          text: "Complete the finisher exercise (hanging leg raises, Cossack squats, or farmer's carries) for the prescribed sets.",
        },
      ],
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
          className="block w-full"
          loading="lazy"
          sizes="180px"
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

function Breadcrumbs({ slug, title }: { slug?: string; title?: string }) {
  if (!slug) return null;
  return (
    <nav aria-label="Breadcrumb" className="px-6 pt-4">
      <ol className="flex items-center gap-1.5 text-xs text-zinc-500">
        <li>
          <Link href="/" className="transition-colors hover:text-zinc-300">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <span className="text-zinc-400">{title}</span>
        </li>
      </ol>
    </nav>
  );
}

function RelatedPages({ currentSlug }: { currentSlug?: string }) {
  const related = landingPages
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 6);

  return (
    <section className="border-t border-white/5 py-16">
      <div className="px-6">
        <h2 className="mb-6 text-lg font-bold text-white">
          Explore more programs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {related.map((page) => (
            <Link
              key={page.slug}
              href={`/workout/${page.slug}`}
              className="rounded-xl border border-white/5 bg-[#1a1a1a] px-4 py-3 transition-colors hover:border-white/10 hover:bg-[#222]"
            >
              <p className="text-sm font-medium text-zinc-200">
                {page.headline}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                {page.metaDescription}
              </p>
            </Link>
          ))}
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
  slug,
  breadcrumbTitle,
}: LandingPageProps) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-[#0a0a0a] text-white">
      <JsonLd
        headline={headline}
        description={heroDescription}
        faq={faq}
        slug={slug}
        breadcrumbTitle={breadcrumbTitle}
      />

      {/* Nav */}
      <nav aria-label="Main navigation" className="border-b border-white/5">
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

      {/* Breadcrumbs */}
      <Breadcrumbs slug={slug} title={breadcrumbTitle} />

      <main>
      {/* Hero */}
      <header className="px-6 pt-20 pb-16 text-center sm:pt-24 sm:pb-20">
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-zinc-400">
          {subheadline}
        </p>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-500">
          {heroDescription}
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
            <p className="text-2xl font-bold text-white">$5</p>
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
            Try Day 1 free. Subscribe to unlock the full program
            and track your progress.
          </p>

          <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/10 bg-[#1a1a1a] px-6 py-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Monthly</p>
            <div className="mt-3 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold tracking-tight text-white">$5</span>
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

      </main>

      {/* Related Pages - Internal Cross-Linking */}
      <RelatedPages currentSlug={slug} />

      {/* Footer with internal links */}
      <footer className="border-t border-white/5 py-10" role="contentinfo">
        <div className="px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Program
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/workout/kettlebell-workout-plan"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Kettlebell Workout Plan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/3-day-workout-plan"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    3-Day Workout Plan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/push-pull-workout-routine"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Push Pull Carry Routine
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/full-body-kettlebell-workout"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Full Body Kettlebell Workout
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Training Style
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/workout/functional-strength-training"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Functional Strength Training
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/tempo-training-program"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Tempo Training Program
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/kettlebell-complex-workout"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Kettlebell Complex Workout
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/kettlebell-program-for-beginners"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Beginner Kettlebell Program
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Train Anywhere
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/workout/home-gym-workout-program"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Home Gym Workout Program
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/strength-training-at-home"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Strength Training at Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/garage-gym-kettlebell-program"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Garage Gym Program
                  </Link>
                </li>
                <li>
                  <Link
                    href="/workout/minimalist-workout-program"
                    className="text-xs text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    Minimalist Workout Program
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-zinc-600">
            Dungym. A workout program by Taylor Prince.
          </div>
        </div>
      </footer>
    </div>
  );
}
