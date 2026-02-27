export type LandingPageData = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  subheadline: string;
  heroDescription: string;
  features: {
    title: string;
    description: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  keywords: string[];
};

// The canonical home page content
export const homePageContent: Omit<LandingPageData, "slug"> = {
  title: "Dungym | Kettlebell Strength Program You Can Do at Home",
  metaTitle: "Dungym | Kettlebell Strength Program You Can Do at Home",
  metaDescription:
    "A 3-day-a-week kettlebell strength program built around a functional complex plus hypertrophy supersets. Do it in your garage, your basement, or anywhere. No gym required.",
  headline: "Strength training that fits your life.",
  subheadline:
    "A 3-day kettlebell program built around a functional complex, supplemented with hypertrophy work. Do it in your garage.",
  heroDescription:
    "Dungym is an opinionated workout plan. Three sessions a week. Every session starts with a kettlebell complex (swings, cleans, squats, presses, windmills) that builds functional strength and endurance simultaneously. Then you finish with a traditional hypertrophy superset: bench press, pull-ups, RDLs, carries. About 40 minutes per session.",
  features: [
    {
      title: "Kettlebell complex every session",
      description:
        "Swings, cleans, front squats, presses, and windmills. One continuous flow that builds strength, endurance, and mobility in 15 minutes.",
    },
    {
      title: "Hypertrophy supersets",
      description:
        "Bench press, pull-ups, RDLs, rows, carries. Traditional strength work paired in supersets to build muscle efficiently.",
    },
    {
      title: "Tempo-controlled reps",
      description:
        "Every exercise has a prescribed tempo. Slow eccentrics build real strength. No bouncing, no momentum, no wasted reps.",
    },
    {
      title: "Three days a week",
      description:
        "Monday push, Wednesday pull, Friday carry. Enough stimulus to grow, enough rest to recover. Sustainable for years.",
    },
    {
      title: "Minimal equipment",
      description:
        "One kettlebell is all you need to start. Add a bench and a pull-up bar when you're ready. No cable machines, no gym membership.",
    },
    {
      title: "Track your progress",
      description:
        "Log sets, reps, and weight. See your progress over time. Built-in rest timer with tempo guidance.",
    },
  ],
  faq: [
    {
      question: "What equipment do I need?",
      answer:
        "One kettlebell to start. A second (lighter) bell, a flat bench, and a pull-up bar round out the full setup. Dumbbells are helpful for RDLs and carries but not required.",
    },
    {
      question: "How long does each workout take?",
      answer:
        "About 40 minutes including warm-up. The complex takes about 15 minutes, the superset takes about 20, and the finisher wraps it up.",
    },
    {
      question: "Is this for beginners?",
      answer:
        "You should be comfortable with basic kettlebell movements: swings, cleans, and presses. If you can swing a kettlebell safely, you can do this program. The tempo work will teach you the rest.",
    },
    {
      question: "How do I progress?",
      answer:
        "When 3 rounds of the complex feel controlled, move up one kettlebell size. For the superset work, increase weight when you can hit the top of the rep range with clean tempo across all sets.",
    },
    {
      question: "Can I do this at home?",
      answer:
        "That's the whole point. The name comes from training in a garage (the dungeon). All you need is enough space to swing a kettlebell and a pull-up bar.",
    },
    {
      question: "What makes this different from other kettlebell programs?",
      answer:
        "Most kettlebell programs are either pure conditioning (high-rep swings) or pure strength (Turkish get-ups). Dungym combines a functional complex for conditioning with traditional hypertrophy work for muscle. You get both.",
    },
  ],
  keywords: [
    "kettlebell workout program",
    "home gym workout",
    "garage gym program",
    "3 day workout plan",
    "kettlebell strength training",
    "functional fitness program",
    "kettlebell complex workout",
    "home workout plan",
    "minimal equipment workout",
  ],
};

// Programmatic landing pages targeting specific search intents
export const landingPages: LandingPageData[] = [
  {
    slug: "kettlebell-workout-plan",
    title: "Kettlebell Workout Plan, 3 Days a Week | Dungym",
    metaTitle: "Kettlebell Workout Plan, 3 Days a Week | Dungym",
    metaDescription:
      "A structured kettlebell workout plan you can follow 3 days a week. Built around a functional complex with swings, cleans, presses, and windmills plus hypertrophy supersets.",
    headline: "A kettlebell workout plan that actually builds strength.",
    subheadline:
      "Three days a week. A functional complex plus hypertrophy work. Follow the plan, track your progress.",
    heroDescription:
      "Most kettlebell programs are just random circuits. Dungym is a structured 3-day program where every session starts with a kettlebell complex (swings, cleans, front squats, presses, and windmills) then adds traditional strength work like bench press, pull-ups, and RDLs. Prescribed tempo on every rep. Real progression.",
    features: [
      {
        title: "Structured, not random",
        description:
          "Monday is push, Wednesday is pull, Friday is carry. Each day has the same complex, a different superset, and a targeted finisher. You always know what to do.",
      },
      {
        title: "Functional complex",
        description:
          "Swings, cleans, front squats, presses, and windmills. Three rounds of the complex opens every session and builds your conditioning base.",
      },
      {
        title: "Hypertrophy supersets",
        description:
          "After the complex: bench + rows, pull-ups + Pallof press, RDLs + dead bugs. Traditional strength work that builds muscle.",
      },
      {
        title: "Tempo-controlled reps",
        description:
          "Every rep has a prescribed tempo (e.g., 3-1-1-0). Slow eccentrics, controlled concentrics. No momentum, real time under tension.",
      },
      {
        title: "Built-in progression",
        description:
          "Start with a weight that makes round 3 challenging. When it feels controlled, move up. Simple, sustainable progression.",
      },
      {
        title: "Track everything",
        description:
          "Log your sets, weights, and reps. Built-in rest timer. See your progress over time with charts.",
      },
    ],
    faq: [
      {
        question: "What does a typical kettlebell workout look like?",
        answer:
          "Warm-up (5 min of hip 90/90s and arm bars), then 3 rounds of the kettlebell complex (swings, clean-squat-press, windmills), then a superset of two strength exercises for 3 rounds, then a finisher. About 40 minutes total.",
      },
      {
        question: "How heavy should my kettlebell be?",
        answer:
          "Your bell should make round 3 challenging but not sloppy. Most men start with a 24kg. Most women start with a 16kg. Adjust based on your press strength. A lighter second bell is helpful for windmills but not required.",
      },
      {
        question: "Can I do this 4 or 5 days a week?",
        answer:
          "The program is designed for 3 days with rest in between. Recovery is when you grow. If you want more, add light mobility work or Zone 2 cardio on off days.",
      },
    ],
    keywords: [
      "kettlebell workout plan",
      "kettlebell program",
      "kettlebell training plan",
      "structured kettlebell workout",
      "3 day kettlebell program",
    ],
  },
  {
    slug: "home-gym-workout-program",
    title: "Home Gym Workout Program, Minimal Equipment | Dungym",
    metaTitle: "Home Gym Workout Program, Minimal Equipment | Dungym",
    metaDescription:
      "A complete home gym workout program that needs just a kettlebell, a bench, and a pull-up bar. Three days a week, 40 minutes per session. Built for garage gyms.",
    headline: "A complete workout program for your home gym.",
    subheadline:
      "One kettlebell, a bench, and a pull-up bar. Three days a week. That's all you need.",
    heroDescription:
      "You don't need a commercial gym to get strong. Dungym was built in a garage. That's where the name comes from. Every session uses a kettlebell for the functional complex, then basic equipment (bench, pull-up bar) for strength supersets. 40 minutes, three days a week. No machines, no cables, no excuses.",
    features: [
      {
        title: "Built for garage gyms",
        description:
          "The program was designed and tested in a garage. A kettlebell, a flat bench, a pull-up bar, and some floor space. That's the whole setup.",
      },
      {
        title: "No machines needed",
        description:
          "Every exercise uses free weights or bodyweight. Bench press, pull-ups, kettlebell swings, rows, RDLs, farmer's carries. Nothing requires a cable stack.",
      },
      {
        title: "40 minutes per session",
        description:
          "Walk into your garage, warm up for 5 minutes, train for 35. No commute, no waiting for equipment, no distractions.",
      },
      {
        title: "Strength and conditioning",
        description:
          "The kettlebell complex builds your engine. The supersets build muscle. You get both without needing separate cardio sessions.",
      },
      {
        title: "Three days, full recovery",
        description:
          "Monday, Wednesday, Friday. Each day has a different focus: push, pull, carry. Rest days are for recovery.",
      },
      {
        title: "Progress tracking built in",
        description:
          "Log your sessions in the app. See your weights go up over time. Know when it's time to move to a heavier bell.",
      },
    ],
    faq: [
      {
        question: "What's the minimum equipment I need?",
        answer:
          "One kettlebell to start. A flat bench and a pull-up bar complete the setup. A second lighter bell and a pair of dumbbells are nice to have but not required.",
      },
      {
        question: "How much space do I need?",
        answer:
          "Enough to swing a kettlebell and lie on a bench. A single garage bay is plenty. About 8x8 feet of clear floor space works.",
      },
      {
        question: "Is this as effective as a gym program?",
        answer:
          "For building functional strength, conditioning, and lean muscle, yes. You won't isolate small muscles like you would with cable machines, but the compound movements and kettlebell work build more practical strength.",
      },
    ],
    keywords: [
      "home gym workout program",
      "garage gym workout",
      "minimal equipment workout",
      "home workout plan",
      "garage gym program",
    ],
  },
  {
    slug: "3-day-workout-plan",
    title: "3-Day Workout Plan, Full Body Strength | Dungym",
    metaTitle: "3-Day Workout Plan, Full Body Strength | Dungym",
    metaDescription:
      "A 3-day-a-week workout plan combining kettlebell complexes with traditional strength training. Push, pull, and carry splits. 40 minutes per session.",
    headline: "Three days a week. That's all you need.",
    subheadline:
      "Monday push. Wednesday pull. Friday carry. A kettlebell complex every session, plus hypertrophy supersets.",
    heroDescription:
      "You don't need to train 6 days a week. Dungym is a 3-day program where every session counts. Each day opens with a kettlebell complex for conditioning, then moves to a focused superset (push day, pull day, carry day). Tempo-controlled reps, built-in rest timers, and progress tracking. About 40 minutes per session.",
    features: [
      {
        title: "Push / Pull / Carry split",
        description:
          "Monday: bench press and rows. Wednesday: pull-ups and anti-rotation. Friday: RDLs and farmer's carries. Every movement pattern covered.",
      },
      {
        title: "Kettlebell complex every day",
        description:
          "Swings, clean-squat-press, and windmills. Three rounds to start every session. Builds your conditioning base without separate cardio.",
      },
      {
        title: "Real rest days",
        description:
          "Train Monday, Wednesday, Friday. Rest Tuesday, Thursday, Saturday, Sunday. Recovery is when adaptation happens.",
      },
      {
        title: "40-minute sessions",
        description:
          "5-minute warm-up, 15-minute complex, 15-minute superset, 5-minute finisher. Dense, efficient training.",
      },
      {
        title: "Sustainable for years",
        description:
          "Three days is a frequency you can maintain long-term. No burnout, no overtraining, no schedule conflicts.",
      },
      {
        title: "Progressive overload",
        description:
          "Track your weights and reps. Move up when the prescribed work feels controlled. Simple linear progression.",
      },
    ],
    faq: [
      {
        question: "Is 3 days a week enough to build muscle?",
        answer:
          "Yes. Research consistently shows that training each muscle group 2-3 times per week is optimal for hypertrophy. The kettlebell complex hits everything every session, and the supersets provide targeted volume.",
      },
      {
        question: "What should I do on rest days?",
        answer:
          "Rest. Light walking, mobility work, or Zone 2 cardio are fine. Don't add extra lifting. The program is designed around the recovery built into the schedule.",
      },
      {
        question: "Can I change the days?",
        answer:
          "Yes, as long as you keep a rest day between sessions. Tuesday/Thursday/Saturday works just as well. The key is the rest day between each session.",
      },
    ],
    keywords: [
      "3 day workout plan",
      "3 day split",
      "three day workout routine",
      "3 day full body workout",
      "3 day strength program",
    ],
  },
  {
    slug: "functional-strength-training",
    title: "Functional Strength Training Program | Dungym",
    metaTitle: "Functional Strength Training Program | Dungym",
    metaDescription:
      "Build functional strength with kettlebell complexes and compound movements. A program that combines conditioning, mobility, and hypertrophy in 3 sessions per week.",
    headline: "Strength that transfers to real life.",
    subheadline:
      "Kettlebell complexes for functional power. Compound lifts for muscle. Three days a week.",
    heroDescription:
      "Functional strength isn't doing circus tricks on a BOSU ball. It's swinging a heavy kettlebell, pressing it overhead, carrying heavy loads, and having the mobility to move well. Dungym combines a kettlebell complex (swings, cleans, squats, presses, windmills) with traditional compound lifts (bench, pull-ups, RDLs) in a 3-day program that builds strength you can actually use.",
    features: [
      {
        title: "Kettlebell complex for movement quality",
        description:
          "Swings build hip power. Cleans build timing. Front squats build core stability. Presses build overhead strength. Windmills build mobility. One flow, every session.",
      },
      {
        title: "Compound lifts for strength",
        description:
          "Bench press, pull-ups, RDLs, rows, farmer's carries. Multi-joint movements that build real-world strength, not just gym strength.",
      },
      {
        title: "Mobility built into the program",
        description:
          "Windmills, Cossack squats, dead bugs, and warm-up flows. You don't need a separate mobility routine. It's in the training.",
      },
      {
        title: "Anti-rotation and anti-extension",
        description:
          "Pallof presses, hanging leg raises, dead bugs. Core training that teaches stability, not just flexion. This is what prevents injuries.",
      },
      {
        title: "Tempo for control",
        description:
          "Prescribed tempos on every movement. 3-second eccentrics build strength through full ranges. No cheating, no momentum.",
      },
      {
        title: "Minimal equipment, maximum transfer",
        description:
          "A kettlebell, a bench, and a bar. No machines that lock you into fixed movement paths. Every rep requires stabilization.",
      },
    ],
    faq: [
      {
        question: "What is functional strength training?",
        answer:
          "Training that builds strength in movement patterns you use in daily life: hinging, squatting, pressing, pulling, carrying, and rotating. Dungym covers all of these patterns across the three training days.",
      },
      {
        question: "Will this help with sports performance?",
        answer:
          "Yes. The kettlebell complex builds hip power and conditioning. The compound lifts build raw strength. The mobility work improves range of motion. These translate directly to most sports.",
      },
      {
        question: "Is this program good for injury prevention?",
        answer:
          "The tempo work, mobility movements (windmills, Cossack squats), and anti-rotation/anti-extension exercises are specifically chosen to build resilient joints and a stable core. Many users report fewer aches and better posture.",
      },
    ],
    keywords: [
      "functional strength training",
      "functional fitness program",
      "functional workout plan",
      "kettlebell functional training",
      "compound movement program",
    ],
  },
  {
    slug: "kettlebell-complex-workout",
    title: "Kettlebell Complex Workout, Build Strength and Conditioning | Dungym",
    metaTitle:
      "Kettlebell Complex Workout, Build Strength and Conditioning | Dungym",
    metaDescription:
      "A kettlebell complex workout combining swings, cleans, front squats, presses, and windmills. Three rounds to build strength, conditioning, and mobility simultaneously.",
    headline: "One complex. Total-body training.",
    subheadline:
      "Swings, cleans, front squats, presses, windmills. Three rounds. The foundation of every Dungym session.",
    heroDescription:
      "A kettlebell complex is a series of movements performed back-to-back without putting the bell down. The Dungym complex chains single-arm swings, a clean into front squat into press, and windmills. 3 rounds per arm. It takes about 15 minutes and builds strength, conditioning, and mobility simultaneously. Then you move to a hypertrophy superset for targeted muscle work.",
    features: [
      {
        title: "Five movements, one flow",
        description:
          "Single-arm swings (10/arm), clean to front squat to press (5/arm), windmills (5-8/side). One continuous sequence that hits every major movement pattern.",
      },
      {
        title: "Conditioning without cardio machines",
        description:
          "Three rounds of the complex with 90-120 seconds rest elevates your heart rate and builds work capacity. No treadmill needed.",
      },
      {
        title: "Strength in every direction",
        description:
          "Horizontal pull (swings), vertical press, hip hinge (windmill), squat, and lateral stability. One complex trains your body in all planes of movement.",
      },
      {
        title: "One bell is enough",
        description:
          "The complex uses a single kettlebell. Swings and clean-squat-press use your working weight. Windmills can use the same bell at lighter effort or a second lighter bell.",
      },
      {
        title: "Plus hypertrophy work",
        description:
          "The complex is just the first 15 minutes. Each Dungym session adds a superset of traditional lifts and a finisher for complete training.",
      },
      {
        title: "Prescribed tempo and RPE",
        description:
          "Every movement has target tempo and effort level. Swings are explosive (X-0-X-0). Windmills are slow (3-1-3-1). Train each movement the way it should be trained.",
      },
    ],
    faq: [
      {
        question: "What is a kettlebell complex?",
        answer:
          "A series of kettlebell exercises performed consecutively without resting or putting the bell down between movements. The Dungym complex chains swings, clean-squat-press, and windmills into one continuous sequence.",
      },
      {
        question: "How heavy should the kettlebell be for the complex?",
        answer:
          "It should make round 3 challenging but clean. If your press breaks down, go lighter. Most men start with a 24kg. Most women start with a 16kg.",
      },
      {
        question: "How long does the complex take?",
        answer:
          "About 15 minutes for 3 rounds including rest. Each round takes roughly 3-4 minutes, with 90-120 seconds rest between rounds.",
      },
    ],
    keywords: [
      "kettlebell complex",
      "kettlebell complex workout",
      "kettlebell flow",
      "kettlebell circuit",
      "kettlebell conditioning workout",
    ],
  },
];

export function getLandingPage(slug: string): LandingPageData | undefined {
  return landingPages.find((page) => page.slug === slug);
}

export function getAllSlugs(): string[] {
  return landingPages.map((page) => page.slug);
}
