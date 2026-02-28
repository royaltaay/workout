import { getAllSlugs, getLandingPage, homePageContent } from "@/lib/landing-pages";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dungym.com";

export function GET() {
  const slugs = getAllSlugs();

  const pageDetails = slugs
    .map((slug) => {
      const page = getLandingPage(slug);
      if (!page) return "";
      return `### ${page.headline}
URL: ${BASE_URL}/workout/${page.slug}
${page.heroDescription}

**Features:**
${page.features.map((f) => `- **${f.title}**: ${f.description}`).join("\n")}

**FAQ:**
${page.faq.map((f) => `- **Q: ${f.question}** A: ${f.answer}`).join("\n")}
`;
    })
    .join("\n---\n\n");

  const content = `# Dungym - Complete Program Guide

> A 3-day-a-week kettlebell strength program built around a functional complex plus hypertrophy supersets. Designed for home and garage gyms. Created by Taylor Prince.

## Quick Facts

- **Type**: Structured kettlebell strength program with hypertrophy work
- **Frequency**: 3 days per week (Monday, Wednesday, Friday)
- **Session Length**: ~40 minutes
- **Equipment**: One kettlebell (minimum), flat bench, pull-up bar
- **Price**: $5/month (Day 1 free, no sign-up required)
- **Platform**: Web app (works on any device)
- **URL**: ${BASE_URL}

## Program Overview

${homePageContent.heroDescription}

## The Kettlebell Complex (Every Session)

3 rounds, 90-120 sec rest between rounds:
1. **Single-Arm Swings**: 10 reps per arm, explosive tempo (X-0-X-0)
2. **Single-Arm Clean to Front Squat to Press**: 5 reps per arm, controlled tempo
3. **Windmill**: 5-8 reps per side, slow tempo (3-1-3-1)

The complex takes about 15 minutes and builds strength, conditioning, and mobility simultaneously.

## Weekly Schedule

### Monday: Push / Anti-Extension
- Kettlebell Complex (3 rounds)
- Superset: Bench Press + Barbell Rows (3 rounds)
- Finisher: Hanging Leg Raises

### Wednesday: Pull / Anti-Rotation
- Kettlebell Complex (3 rounds)
- Superset: Pull-ups + Pallof Press (3 rounds)
- Finisher: Cossack Squats

### Friday: Carry / Total Body
- Kettlebell Complex (3 rounds)
- Superset: RDLs + Dead Bugs (3 rounds)
- Finisher: Farmer's Carries

## Tempo Training

Every exercise has a prescribed tempo written as four numbers: eccentric-pause-concentric-pause.
- **3-1-1-0**: 3 seconds lowering, 1 second pause, 1 second lifting, no pause at top
- **X-0-X-0**: Explosive on both phases (used for swings)
- **3-1-3-1**: Slow on all phases (used for windmills)

Tempo-controlled reps build more strength per rep through increased time under tension.

## Equipment Guide

### Minimum Setup
- One kettlebell (24kg for most men, 16kg for most women)

### Recommended Setup
- Primary kettlebell (24kg/16kg)
- Flat bench
- Pull-up bar (doorway or ceiling mount)

### Optional Additions
- Second lighter kettlebell (for windmills)
- Pair of dumbbells (for RDLs and carries)
- Rubber floor mat

### Total Cost
- Minimum: $40-80 (one kettlebell)
- Full setup: $145-270 (less than 3 months of most gym memberships)

## Progression

- Move up one kettlebell size when 3 rounds of the complex feel controlled
- Increase superset weight when hitting top of rep range with clean tempo
- Beginners: Start with 16kg (men) or 12kg (women)

## Who This Is For

- People who want to train at home or in a garage gym
- Anyone looking for a structured, opinionated program (not random workouts)
- People who value time-efficient training (40 min, 3x/week)
- Intermediate to advanced lifters comfortable with basic kettlebell movements
- Beginners who can safely swing a kettlebell

## App Features

- Full program with exercises, sets, reps, and tempo
- Built-in rest timer with audio cues
- Workout logging (weight, reps, notes)
- Progress charts for every exercise
- Session history
- Works on any device (progressive web app)

## Pricing

- **Day 1**: Free, no sign-up required
- **Full Program**: $5/month
- Cancel anytime, no contracts

## FAQ

${homePageContent.faq.map((f) => `**Q: ${f.question}**
A: ${f.answer}`).join("\n\n")}

## All Program Pages

${pageDetails}

## Links

- Home: ${BASE_URL}
${slugs.map((slug) => `- ${slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}: ${BASE_URL}/workout/${slug}`).join("\n")}
- Start the program: ${BASE_URL}/program
- LLMs.txt: ${BASE_URL}/llms.txt
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
