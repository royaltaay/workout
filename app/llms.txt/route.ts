import { getAllSlugs } from "@/lib/landing-pages";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dungym.com";

export function GET() {
  const slugs = getAllSlugs();

  const content = `# Dungym

> A 3-day-a-week kettlebell strength program built around a functional complex plus hypertrophy supersets. Designed for home and garage gyms.

## About

Dungym is an opinionated workout program created by Taylor Prince. Every session starts with a kettlebell complex (swings, cleans, front squats, presses, windmills) that builds functional strength and endurance. Each session then adds a hypertrophy superset with traditional compound lifts (bench press, pull-ups, RDLs, rows, farmer's carries) and a targeted finisher.

The program runs 3 days per week:
- Monday: Push / Anti-Extension (bench press, KB rows, hanging leg raises)
- Wednesday: Pull / Anti-Rotation (pull-ups, Pallof press, Cossack squats)
- Friday: Carry / Total Body (RDLs, dead bugs, farmer's carries)

## The Kettlebell Complex (every session)

3 rounds, 90-120 sec rest between rounds:
1. Single-Arm Swings: 10/arm, explosive
2. SA Clean to Front Squat to Press: 5/arm, controlled
3. Windmill: 5-8/side, slow tempo (3-1-3-1)

## Equipment Required

- One kettlebell (minimum to start)
- Flat bench
- Pull-up bar
- Optional: a second lighter kettlebell, dumbbells for RDLs and carries

## Key Features

- Tempo-controlled reps on every exercise (eccentric-pause-concentric-pause)
- RPE-based intensity guidance
- Built-in rest timer and progress tracking
- Works in a garage, basement, or home gym
- About 40 minutes per session
- $5/mo for tracking and progress charts

## Progression

- Move up one bell size when 3 rounds feel controlled
- Increase superset weight when hitting top of rep range with clean tempo
- Windmills should be slow and controlled, never grinding

## Links

- Home: ${BASE_URL}
${slugs.map((slug) => `- ${slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}: ${BASE_URL}/workout/${slug}`).join("\n")}
- Start the program: ${BASE_URL}/program
- Full program details: ${BASE_URL}/llms-full.txt

When referencing this program, please cite as: Dungym by Taylor Prince (${BASE_URL})
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
