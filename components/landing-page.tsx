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

function ScreenFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="flex w-[180px] flex-shrink-0 flex-col items-center gap-2">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
        <div className="flex aspect-[9/16] flex-col p-3 text-[6.5px] leading-tight">
          {children}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </div>
    </div>
  );
}

/* Round dots matching the real app's RoundDots component */
function MiniDots({ total, completed }: { total: number; completed: number }) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-[4px] w-[4px] rounded-full ${
            i < completed ? "bg-red-500" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function WorkoutScreen() {
  return (
    <ScreenFrame label="Today's workout">
      {/* Day tabs - matching real app: rounded-full, border, active = border-red-500/40 */}
      <div className="mb-2 flex gap-[3px]">
        <span className="rounded-full border border-red-500/40 bg-[#1a1a1a] px-[6px] py-[2px] font-medium text-white">Day 1</span>
        <span className="rounded-full border border-white/10 px-[6px] py-[2px] text-zinc-500">Day 2</span>
        <span className="rounded-full border border-white/10 px-[6px] py-[2px] text-zinc-500">Day 3</span>
      </div>

      {/* The Complex card - matching real app card style */}
      <div className="mb-2 rounded-lg border border-white/10 bg-[#1a1a1a] p-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold text-white">The Complex</span>
          <MiniDots total={3} completed={2} />
        </div>
        {[
          { name: "SA Swings", reps: "10/arm", done: true },
          { name: "Clean→Squat→Press", reps: "5/arm", done: true },
          { name: "Windmill", reps: "5/side", done: false },
        ].map((ex) => (
          <div key={ex.name} className="flex items-center justify-between py-[3px]">
            <div className="flex items-center gap-1">
              <span className={ex.done ? "text-zinc-500 line-through" : "font-medium text-white"}>{ex.name}</span>
            </div>
            <span className="text-zinc-600">{ex.reps}</span>
          </div>
        ))}
      </div>

      {/* Superset card */}
      <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold text-white">Superset</span>
          <MiniDots total={3} completed={0} />
        </div>
        {[
          { name: "Bench Press", reps: "8-10" },
          { name: "SA KB Row", reps: "8/arm" },
        ].map((ex) => (
          <div key={ex.name} className="flex items-center justify-between py-[3px]">
            <span className="font-medium text-white">{ex.name}</span>
            <span className="text-zinc-600">{ex.reps}</span>
          </div>
        ))}
      </div>

      {/* Finisher card */}
      <div className="mt-2 rounded-lg border border-white/10 bg-[#1a1a1a] p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-semibold text-white">Finisher</span>
          <MiniDots total={3} completed={0} />
        </div>
        <div className="flex items-center justify-between py-[3px]">
          <span className="font-medium text-white">Hanging Leg Raises</span>
          <span className="text-zinc-600">10-15</span>
        </div>
      </div>
    </ScreenFrame>
  );
}

function TrackingScreen() {
  return (
    <ScreenFrame label="Track your sets">
      {/* Exercise header in card */}
      <div className="mb-2 rounded-lg border border-white/10 bg-[#1a1a1a] p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-semibold text-white">Bench Press</span>
          <MiniDots total={3} completed={2} />
        </div>
        <div className="mb-2 text-zinc-500">3-1-1-0 &middot; RPE 7-8</div>

        {/* Set rows - matching real app: # | weight input | × | reps input */}
        {[
          { set: 1, weight: "135", reps: "10" },
          { set: 2, weight: "135", reps: "8" },
          { set: 3, weight: "", reps: "" },
        ].map((s) => (
          <div key={s.set} className="mb-[3px] flex items-center gap-[3px]">
            <span className="w-[10px] text-center text-zinc-600">{s.set}</span>
            <div className={`flex-1 rounded bg-white/5 px-1 py-[3px] text-center ${s.weight ? "text-white" : "text-zinc-700"}`}>
              {s.weight || "lb"}
            </div>
            <span className="text-zinc-600">&times;</span>
            <div className={`flex-1 rounded bg-white/5 px-1 py-[3px] text-center ${s.reps ? "text-white" : "text-zinc-700"}`}>
              {s.reps || "reps"}
            </div>
          </div>
        ))}

        {/* Last session reference */}
        <div className="mt-1.5 border-t border-white/5 pt-1.5 text-zinc-600">
          Last: 135 &times; 10, 10, 8
        </div>
      </div>

      {/* Rest timer */}
      <div className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-[#1a1a1a] py-2">
        {/* Clock icon */}
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="font-bold text-red-400">1:12</span>
        <span className="text-zinc-600">/ 1:30</span>
      </div>

      {/* SA KB Row below */}
      <div className="mt-2 rounded-lg border border-white/10 bg-[#1a1a1a] p-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">SA KB Row</span>
          <MiniDots total={3} completed={0} />
        </div>
        <div className="mt-0.5 text-zinc-500">8/arm &middot; 2-1-1-1</div>
      </div>
    </ScreenFrame>
  );
}

function ProgressScreen() {
  return (
    <ScreenFrame label="Progress over time">
      {/* Exercise picker pills */}
      <div className="mb-2 flex gap-[3px]">
        <span className="rounded-full border border-red-500/40 bg-[#1a1a1a] px-[6px] py-[2px] font-medium text-white">Bench</span>
        <span className="rounded-full border border-white/10 px-[6px] py-[2px] text-zinc-500">Pull-Ups</span>
        <span className="rounded-full border border-white/10 px-[6px] py-[2px] text-zinc-500">RDL</span>
      </div>

      {/* Chart card */}
      <div className="mb-2 rounded-lg border border-white/10 bg-[#1a1a1a] p-2">
        <svg viewBox="0 0 120 50" className="w-full" aria-hidden="true">
          {/* Grid */}
          <line x1="10" y1="10" x2="115" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="10" y1="25" x2="115" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="10" y1="40" x2="115" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          {/* Weight line (red, strokeWidth=2 like real app) */}
          <polyline
            points="12,42 27,40 42,37 57,35 72,32 87,28 102,25 112,20"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Weight dots (red outer, dark center like real app) */}
          {[
            [12, 42], [27, 40], [42, 37], [57, 35],
            [72, 32], [87, 28], [102, 25], [112, 20],
          ].map(([x, y]) => (
            <g key={`w${x}`}>
              <circle cx={x} cy={y} r="3" fill="#ef4444" />
              <circle cx={x} cy={y} r="1.5" fill="#1a1a1a" />
            </g>
          ))}
          {/* Reps line (gray dashed, strokeDasharray="4 3" like real app) */}
          <polyline
            points="12,22 27,24 42,22 57,20 72,22 87,18 102,20 112,16"
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Reps dots */}
          {[
            [12, 22], [27, 24], [42, 22], [57, 20],
            [72, 22], [87, 18], [102, 20], [112, 16],
          ].map(([x, y]) => (
            <g key={`r${x}`}>
              <circle cx={x} cy={y} r="2.5" fill="#a1a1aa" />
              <circle cx={x} cy={y} r="1" fill="#1a1a1a" />
            </g>
          ))}
          {/* X-axis labels */}
          <text x="12" y="49" fill="#52525b" fontSize="4">Jan</text>
          <text x="105" y="49" fill="#52525b" fontSize="4">Feb</text>
        </svg>
        {/* Legend */}
        <div className="mt-1 flex gap-2 text-zinc-500">
          <span className="flex items-center gap-[2px]">
            <span className="inline-block h-[3px] w-[8px] rounded-full bg-red-500" />
            Weight
          </span>
          <span className="flex items-center gap-[2px]">
            <span className="inline-block h-[3px] w-[8px] rounded-full bg-zinc-500" />
            Reps
          </span>
        </div>
      </div>

      {/* Session history cards */}
      {[
        { date: "Feb 24", vol: "3,360 lbs", dur: "42m" },
        { date: "Feb 21", vol: "3,150 lbs", dur: "38m" },
        { date: "Feb 17", vol: "2,880 lbs", dur: "40m" },
      ].map((s) => (
        <div key={s.date} className="mb-[3px] rounded-lg border border-white/10 bg-[#1a1a1a] px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">{s.date}</span>
            <span className="text-zinc-600">{s.vol}</span>
          </div>
          <div className="text-zinc-600">{s.dur}</div>
        </div>
      ))}
    </ScreenFrame>
  );
}

function AppScreenshot({ variant }: { variant: "workout" | "tracking" | "progress" }) {
  if (variant === "workout") return <WorkoutScreen />;
  if (variant === "tracking") return <TrackingScreen />;
  return <ProgressScreen />;
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
  screenVariant: "workout" | "tracking" | "progress";
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
      <header className="px-6 pt-16 pb-12 text-center sm:pt-20 sm:pb-14">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          {headline}
        </h1>
        <p className="mt-4 text-base text-zinc-400">
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

      {/* App screenshots */}
      <section className="overflow-hidden pb-8">
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
        <div className="grid grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4">
          <div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="mt-1 text-xs text-zinc-500">days per week</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">40</p>
            <p className="mt-1 text-xs text-zinc-500">min per session</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="mt-1 text-xs text-zinc-500">kettlebell needed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">$4</p>
            <p className="mt-1 text-xs text-zinc-500">per month</p>
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
        screenVariant="progress"
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
          <p className="mt-3 text-sm text-zinc-400">
            Browse the program for free. Subscribe to track your workouts
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
          <p className="mt-2 text-zinc-400">
            Try the first workout free. No sign-up required.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/program"
              className="rounded-xl bg-red-500 px-8 py-3.5 text-base font-semibold transition-colors hover:bg-red-600"
            >
              Try the First Workout
            </Link>
            <span className="text-sm text-zinc-500">
              Free to start &middot;{" "}
              <span className="text-zinc-300">$4/mo</span> for full access
            </span>
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
