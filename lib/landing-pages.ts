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
  {
    slug: "strength-training-at-home",
    title: "Strength Training at Home, No Gym Required | Dungym",
    metaTitle: "Strength Training at Home, No Gym Required | Dungym",
    metaDescription:
      "Build real strength at home with a structured 3-day program. Kettlebell complexes plus compound lifts. No gym membership needed, just a kettlebell and 40 minutes.",
    headline: "Build real strength without leaving your house.",
    subheadline:
      "A structured strength program designed for your living room, garage, or basement. Three days a week, 40 minutes, one kettlebell.",
    heroDescription:
      "You don't need a gym membership to get strong. Dungym was built for people who train at home. Every session uses a kettlebell complex for functional strength and conditioning, then compound movements (bench press, pull-ups, RDLs) for muscle. Prescribed tempo on every rep so you build strength through full ranges of motion. 40 minutes, three days a week. That's it.",
    features: [
      {
        title: "No gym required",
        description:
          "Everything in the program can be done in a garage, basement, spare room, or backyard. No cables, no machines, no commute.",
      },
      {
        title: "Compound movements only",
        description:
          "Kettlebell swings, bench press, pull-ups, RDLs, rows, farmer's carries. Multi-joint exercises that build strength efficiently with minimal equipment.",
      },
      {
        title: "Strength and conditioning together",
        description:
          "The kettlebell complex builds your conditioning. The supersets build muscle. One session covers both. No separate cardio days needed.",
      },
      {
        title: "Progressive overload at home",
        description:
          "Track your weights and reps in the app. Move up when the prescribed work feels controlled. Linear progression that works without a full weight rack.",
      },
      {
        title: "Time-efficient sessions",
        description:
          "40 minutes from warm-up to finisher. No waiting for equipment, no walking across a gym floor. Start training the moment you're ready.",
      },
      {
        title: "Sustainable long-term",
        description:
          "Three days a week with built-in rest. A program you can run for years without burnout, overtraining, or schedule conflicts.",
      },
    ],
    faq: [
      {
        question: "Can I really build strength training at home?",
        answer:
          "Yes. Compound movements with progressive overload build strength regardless of location. A kettlebell, bench, and pull-up bar give you access to all the major movement patterns: hinge, squat, press, pull, and carry.",
      },
      {
        question: "What if I only have a kettlebell?",
        answer:
          "You can start with just the kettlebell. The complex is the core of every session and only requires one bell. As you progress, a bench and pull-up bar unlock the full superset work.",
      },
      {
        question: "How does this compare to going to a gym?",
        answer:
          "For building functional strength and lean muscle, home training with compound movements is equally effective. You trade machine isolation work for free-weight stability and save hours per week on commuting.",
      },
    ],
    keywords: [
      "strength training at home",
      "home strength workout",
      "at home strength program",
      "home workout for strength",
      "strength training without gym",
      "build muscle at home",
    ],
  },
  {
    slug: "kettlebell-program-for-beginners",
    title: "Kettlebell Program for Beginners, Start Here | Dungym",
    metaTitle: "Kettlebell Program for Beginners, Start Here | Dungym",
    metaDescription:
      "A beginner-friendly kettlebell program with tempo guidance on every rep. Learn swings, cleans, presses, and windmills in a structured 3-day plan. Start with Day 1 free.",
    headline: "New to kettlebells? Start here.",
    subheadline:
      "A structured program with tempo guidance on every rep. Learn the movements, build the habit, get strong.",
    heroDescription:
      "Dungym is built around fundamental kettlebell movements: swings, cleans, front squats, presses, and windmills. Every exercise has a prescribed tempo that teaches you proper control. Slow eccentrics, controlled concentrics. The app guides you through each session with rest timers and tempo cues. Start with a weight that feels moderate and let the program teach you the rest.",
    features: [
      {
        title: "Tempo teaches technique",
        description:
          "Every rep has a prescribed tempo (e.g., 3-1-1-0). The slow eccentrics force you to control the weight. You learn proper form by slowing down, not by watching videos.",
      },
      {
        title: "Five core movements",
        description:
          "Single-arm swings, cleans, front squats, presses, and windmills. Master these five and you have a complete training foundation.",
      },
      {
        title: "Three days a week",
        description:
          "Monday, Wednesday, Friday. Enough frequency to build skill and strength, enough rest to recover. Perfect for building the training habit.",
      },
      {
        title: "Start light, progress naturally",
        description:
          "Begin with a weight where round 3 is challenging but clean. When it feels controlled, move up. No complicated periodization, just simple progression.",
      },
      {
        title: "Guided sessions",
        description:
          "The app tells you what to do, how many reps, what tempo, and when to rest. No guesswork, no decision fatigue.",
      },
      {
        title: "Try Day 1 free",
        description:
          "See the full Day 1 workout before committing. No sign-up required. If it clicks, subscribe for $5/mo to unlock the full program.",
      },
    ],
    faq: [
      {
        question: "I've never used a kettlebell. Can I do this program?",
        answer:
          "If you can safely swing a kettlebell, you can start this program. The tempo prescriptions will teach you control. Start with a lighter weight and focus on form. If you're completely new, practice basic swings for a week first.",
      },
      {
        question: "What weight kettlebell should a beginner use?",
        answer:
          "Most men should start with a 16kg kettlebell, most women with a 12kg. The key is that round 3 of the complex should feel challenging but your form should stay clean. Go lighter if needed.",
      },
      {
        question: "How long before I see results?",
        answer:
          "Most people notice improved grip strength and conditioning within 2-3 weeks. Visible muscle changes typically appear at 6-8 weeks. The tempo work accelerates results because every rep is maximally effective.",
      },
      {
        question: "What if an exercise is too hard?",
        answer:
          "Use a lighter kettlebell or reduce reps. The windmill is usually the hardest movement for beginners. Start with no weight on windmills and add the bell once you have the pattern. The program adapts to your level.",
      },
    ],
    keywords: [
      "kettlebell program for beginners",
      "beginner kettlebell workout",
      "kettlebell training for beginners",
      "starting kettlebell program",
      "learn kettlebell exercises",
      "kettlebell workout plan beginner",
    ],
  },
  {
    slug: "push-pull-workout-routine",
    title: "Push Pull Carry Workout Routine, 3 Days a Week | Dungym",
    metaTitle: "Push Pull Carry Workout Routine, 3 Days a Week | Dungym",
    metaDescription:
      "A push/pull/carry workout split built around kettlebell complexes. Monday push, Wednesday pull, Friday carry. Complete program with tempo and tracking.",
    headline: "Push. Pull. Carry. Repeat.",
    subheadline:
      "A clean 3-day split. Every session starts with the kettlebell complex, then focuses on one movement pattern.",
    heroDescription:
      "The Dungym program uses a push/pull/carry split across three days. Monday is bench press, rows, and anti-extension. Wednesday is pull-ups, Pallof press, and anti-rotation. Friday is RDLs, dead bugs, and farmer's carries. Every session opens with the same kettlebell complex for conditioning. This split covers every movement pattern with enough volume to grow and enough rest to recover.",
    features: [
      {
        title: "Monday: Push + Anti-Extension",
        description:
          "Bench press and barbell rows paired in a superset. Hanging leg raises as finisher. Upper body horizontal pressing with core stability.",
      },
      {
        title: "Wednesday: Pull + Anti-Rotation",
        description:
          "Pull-ups and Pallof press paired in a superset. Cossack squats as finisher. Vertical pulling with rotational stability.",
      },
      {
        title: "Friday: Carry + Total Body",
        description:
          "RDLs and dead bugs paired in a superset. Farmer's carries as finisher. Posterior chain strength with loaded carries.",
      },
      {
        title: "Same complex, different focus",
        description:
          "The kettlebell complex (swings, cleans, squats, presses, windmills) opens every session. Then the superset targets a specific pattern for focused volume.",
      },
      {
        title: "Balanced programming",
        description:
          "Push and pull are balanced. Horizontal and vertical movements are balanced. Anterior and posterior chain work is balanced. No imbalances, no weak links.",
      },
      {
        title: "Recovery built in",
        description:
          "Each movement pattern gets trained once per week directly, with indirect work from the daily complex. Four rest days per week for full recovery.",
      },
    ],
    faq: [
      {
        question: "What is a push/pull/carry split?",
        answer:
          "A training split that organizes workouts by movement pattern. Push day focuses on pressing movements (bench press). Pull day focuses on pulling movements (pull-ups). Carry day focuses on hip hinge and loaded carries (RDLs, farmer's carries).",
      },
      {
        question: "Why push/pull/carry instead of push/pull/legs?",
        answer:
          "The kettlebell complex already trains legs every session (front squats, swings). The carry day adds RDLs for posterior chain and farmer's carries for total body strength. This avoids redundancy and covers patterns a traditional PPL misses.",
      },
      {
        question: "Is one day per movement pattern enough volume?",
        answer:
          "Yes, because the kettlebell complex provides indirect volume for every pattern every session. Your legs, shoulders, and core get trained three times per week through the complex. The superset adds focused volume on top.",
      },
    ],
    keywords: [
      "push pull workout routine",
      "push pull carry split",
      "push pull workout plan",
      "3 day push pull routine",
      "push pull workout schedule",
      "push pull carry program",
    ],
  },
  {
    slug: "full-body-kettlebell-workout",
    title: "Full Body Kettlebell Workout, 40 Minutes | Dungym",
    metaTitle: "Full Body Kettlebell Workout, 40 Minutes | Dungym",
    metaDescription:
      "A full body kettlebell workout you can do in 40 minutes. Swings, cleans, squats, presses, windmills plus compound supersets. Complete program with tracking.",
    headline: "Full body. One kettlebell. 40 minutes.",
    subheadline:
      "Every session trains your entire body through a kettlebell complex and compound supersets. No muscle left behind.",
    heroDescription:
      "Every Dungym session is a full-body workout. The kettlebell complex trains your legs (swings, squats), upper body (cleans, presses), and core (windmills) in one continuous flow. Then the superset adds focused compound work: bench press, pull-ups, RDLs, rows, and carries. 40 minutes, three times a week. Every major muscle group gets hit every session.",
    features: [
      {
        title: "Total body in every session",
        description:
          "The complex alone trains hips, quads, shoulders, back, and core. The superset adds focused work for chest, lats, hamstrings, and grip. Nothing is skipped.",
      },
      {
        title: "40-minute sessions",
        description:
          "Warm-up (5 min), complex (15 min), superset (15 min), finisher (5 min). Dense, efficient training that respects your time.",
      },
      {
        title: "One kettlebell starts it all",
        description:
          "The entire complex requires one kettlebell. Add a bench and pull-up bar for the supersets and you have a complete training setup.",
      },
      {
        title: "Conditioning built in",
        description:
          "Three rounds of the kettlebell complex with 90-120 second rests builds serious work capacity. You don't need separate cardio sessions.",
      },
      {
        title: "Compound movements only",
        description:
          "No isolation exercises. Every movement is multi-joint: swings, squats, presses, pull-ups, RDLs. More muscle recruited per rep, more efficiency per session.",
      },
      {
        title: "Train three, rest four",
        description:
          "Three full-body sessions per week gives you frequency and volume. Four rest days gives you recovery. The balance that builds muscle without breaking you down.",
      },
    ],
    faq: [
      {
        question: "Can a full body workout build muscle?",
        answer:
          "Yes. Full body training 3 times per week provides optimal training frequency for hypertrophy. Each muscle group gets trained 3 times per week (through the complex) plus targeted work through the supersets. Research supports this frequency for muscle growth.",
      },
      {
        question: "Will 40 minutes be enough?",
        answer:
          "Yes, because every minute is productive. Tempo-controlled reps with compound movements provide more stimulus per rep than fast, sloppy training. The supersets eliminate wasted rest time. Quality over quantity.",
      },
      {
        question: "Can I add more exercises?",
        answer:
          "The program is intentionally minimal. Adding exercises extends sessions and reduces recovery. If you want more work, add light mobility on rest days or increase your kettlebell weight before adding volume.",
      },
    ],
    keywords: [
      "full body kettlebell workout",
      "total body kettlebell training",
      "full body workout with kettlebell",
      "kettlebell full body routine",
      "40 minute full body workout",
      "complete kettlebell workout",
    ],
  },
  {
    slug: "tempo-training-program",
    title: "Tempo Training Program, Controlled Reps for Real Strength | Dungym",
    metaTitle: "Tempo Training Program, Controlled Reps for Real Strength | Dungym",
    metaDescription:
      "A strength program with prescribed tempo on every exercise. Slow eccentrics, controlled concentrics. Build real strength and muscle with time under tension.",
    headline: "Slow down. Get stronger.",
    subheadline:
      "Every rep has a prescribed tempo. Slow eccentrics build real strength. No bouncing, no momentum, no wasted reps.",
    heroDescription:
      "Tempo training prescribes how fast you perform each phase of a rep: eccentric (lowering), pause at bottom, concentric (lifting), pause at top. For example, a 3-1-1-0 tempo means 3 seconds down, 1 second pause, 1 second up, no pause at top. Dungym prescribes tempo on every exercise, from explosive swings (X-0-X-0) to slow windmills (3-1-3-1). This builds strength through full ranges, improves muscle control, and eliminates wasted reps.",
    features: [
      {
        title: "Prescribed tempo on every movement",
        description:
          "Every exercise in the program has a specific tempo prescription. The app displays it so you know exactly how to perform each rep.",
      },
      {
        title: "Slow eccentrics for strength",
        description:
          "3-second eccentrics create more time under tension and more muscle damage (the good kind). This is how you build strength through full ranges of motion.",
      },
      {
        title: "Explosive where it matters",
        description:
          "Kettlebell swings use an explosive tempo (X-0-X-0). Windmills use a slow tempo (3-1-3-1). Each movement gets the tempo it needs for maximum benefit.",
      },
      {
        title: "No wasted reps",
        description:
          "When you control the tempo, every rep counts. No bouncing off your chest on bench press, no kipping on pull-ups, no rushing through RDLs.",
      },
      {
        title: "Built-in timer guidance",
        description:
          "The app includes tempo cues so you can internalize the rhythm of each exercise. Over time, proper tempo becomes automatic.",
      },
      {
        title: "Better results in less time",
        description:
          "Tempo-controlled reps provide more stimulus per rep than fast, uncontrolled reps. You get more from 3 sets of 8 with tempo than 5 sets of 12 without.",
      },
    ],
    faq: [
      {
        question: "What is tempo training?",
        answer:
          "Tempo training prescribes the speed of each phase of a repetition, typically written as four numbers: eccentric-pause-concentric-pause. A tempo of 3-1-1-0 means 3 seconds lowering, 1 second pause, 1 second lifting, 0 seconds at top. 'X' means explosive.",
      },
      {
        question: "Will I need to use lighter weights?",
        answer:
          "Initially, yes. Tempo-controlled reps are harder than uncontrolled reps. Most people drop 10-20% from their normal weights when they start. The strength gains come faster because every rep is more effective.",
      },
      {
        question: "Does tempo training build more muscle?",
        answer:
          "Research shows that increased time under tension, particularly during the eccentric phase, is a primary driver of hypertrophy. Tempo training maximizes time under tension per rep, making each set more effective for muscle growth.",
      },
    ],
    keywords: [
      "tempo training program",
      "tempo training workout",
      "time under tension workout",
      "slow eccentric training",
      "controlled rep training",
      "tempo strength program",
    ],
  },
  {
    slug: "minimalist-workout-program",
    title: "Minimalist Workout Program, Maximum Results | Dungym",
    metaTitle: "Minimalist Workout Program, Maximum Results | Dungym",
    metaDescription:
      "A minimalist workout program that gets maximum results from minimum equipment and time. One kettlebell, 3 days, 40 minutes. No fluff, just compound movements.",
    headline: "Less equipment. Less time. More results.",
    subheadline:
      "One kettlebell. Three days a week. 40 minutes. A program stripped to what actually works.",
    heroDescription:
      "Most programs have too many exercises, too many days, and too much equipment. Dungym is the opposite. One kettlebell complex, one superset, one finisher. Three days a week. About 40 minutes. Every exercise is a compound movement that recruits multiple muscle groups. No isolation, no machines, no fluff. Just the movements that build the most strength with the least complexity.",
    features: [
      {
        title: "One kettlebell to start",
        description:
          "The entire kettlebell complex requires one bell. That's the core of every session. A bench and pull-up bar unlock the supersets when you're ready.",
      },
      {
        title: "Three sessions, four rest days",
        description:
          "Monday, Wednesday, Friday. That's your training. The other four days are for recovery, life, and whatever else matters to you.",
      },
      {
        title: "Compound movements only",
        description:
          "Swings, cleans, squats, presses, bench, pull-ups, RDLs, carries. Every exercise trains multiple joints and muscle groups. Maximum return per movement.",
      },
      {
        title: "No decision fatigue",
        description:
          "The program tells you exactly what to do every session: exercises, sets, reps, tempo, rest. Open the app, start training.",
      },
      {
        title: "No fluff, no filler",
        description:
          "No tricep kickbacks, no cable flyes, no leg extensions. Every exercise in the program earns its spot by training fundamental movement patterns.",
      },
      {
        title: "$5 per month",
        description:
          "No annual contracts, no upsells, no premium tiers. One price for the complete program, tracking, and progress charts. Cancel anytime.",
      },
    ],
    faq: [
      {
        question: "Can a minimalist program really build muscle?",
        answer:
          "Yes. Compound movements with progressive overload and controlled tempo are the primary drivers of muscle growth. The kettlebell complex plus supersets provide sufficient volume for all major muscle groups. Most programs include unnecessary exercises.",
      },
      {
        question: "What if I want to do more?",
        answer:
          "If you consistently complete all three sessions and the weights are going up, the program is working. Adding more training risks overtraining and reduces recovery. If you have extra energy, increase your kettlebell weight.",
      },
      {
        question: "Is this enough volume for each muscle group?",
        answer:
          "Each muscle group gets trained 2-3 times per week through the combination of the daily complex and rotating supersets. Research shows this frequency is optimal for hypertrophy. Volume per session is moderate, but frequency makes up for it.",
      },
    ],
    keywords: [
      "minimalist workout program",
      "minimal equipment workout plan",
      "simple workout program",
      "essentialist training program",
      "minimalist strength training",
      "no gym workout program",
    ],
  },
  {
    slug: "garage-gym-kettlebell-program",
    title: "Garage Gym Kettlebell Program, Built for Small Spaces | Dungym",
    metaTitle: "Garage Gym Kettlebell Program, Built for Small Spaces | Dungym",
    metaDescription:
      "A kettlebell program designed for garage gyms. Needs just 8x8 feet of space, one kettlebell, and 40 minutes. The program that was built in a garage.",
    headline: "Built in a garage. Built for yours.",
    subheadline:
      "Dungym was designed and tested in a single-car garage. A kettlebell, a bench, a pull-up bar, and 8x8 feet of space.",
    heroDescription:
      "The name Dungym comes from training in a garage: the dungeon. This program was built there, tested there, and refined there. Every exercise fits in a small space. Every session uses equipment that fits against a wall when you're done. If you have a garage, a shed, a basement, or even a covered patio, you have a gym.",
    features: [
      {
        title: "8x8 feet is all you need",
        description:
          "Enough space to swing a kettlebell overhead and lie flat on a bench. A single garage bay has room to spare. No squat rack, no barbell, no plate tree.",
      },
      {
        title: "Equipment that stores flat",
        description:
          "A kettlebell, a flat bench, and a doorway or ceiling-mounted pull-up bar. Everything stacks against the wall when you're done. Your garage stays a garage.",
      },
      {
        title: "No neighbors disturbed",
        description:
          "No dropped barbells, no slamming plates, no loud machines. Kettlebell work and controlled compound lifts are garage-friendly training.",
      },
      {
        title: "Train on your schedule",
        description:
          "Your gym is 10 steps away. No drive, no parking, no waiting. Early morning, lunch break, late night. Train whenever works for you.",
      },
      {
        title: "Weather doesn't matter",
        description:
          "Rain, snow, heat wave. Your garage gym is climate-adjacent, maybe, but always open. No gym closures, no holiday hours.",
      },
      {
        title: "One-time equipment investment",
        description:
          "A kettlebell ($40-80), a flat bench ($80-150), and a pull-up bar ($25-40). That's $145-270 total, less than 3 months of most gym memberships.",
      },
    ],
    faq: [
      {
        question: "What's the ideal garage gym setup for this program?",
        answer:
          "One kettlebell (24kg for most men, 16kg for most women), a flat bench, and a pull-up bar. Optional additions: a second lighter kettlebell for windmills, a pair of dumbbells for RDLs and carries, and a rubber mat for floor work.",
      },
      {
        question: "Can I do this in an apartment?",
        answer:
          "Most of it, yes. The kettlebell swings may be too loud for downstairs neighbors. You could substitute with deadlifts or hip thrusts on swing days. Everything else works in an apartment with enough ceiling height for overhead presses.",
      },
      {
        question: "How much does a garage gym cost to set up?",
        answer:
          "The minimum setup (one kettlebell, flat bench, pull-up bar) costs $145-270 depending on quality. That's less than 3 months of a typical gym membership, and the equipment lasts decades. Add a rubber mat ($30-50) to protect your floor.",
      },
    ],
    keywords: [
      "garage gym kettlebell program",
      "garage gym workout",
      "garage gym setup kettlebell",
      "small space workout program",
      "garage gym training plan",
      "home garage gym workout",
    ],
  },
];

export function getLandingPage(slug: string): LandingPageData | undefined {
  return landingPages.find((page) => page.slug === slug);
}

export function getAllSlugs(): string[] {
  return landingPages.map((page) => page.slug);
}
