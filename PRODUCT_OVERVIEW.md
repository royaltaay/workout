# Dungym — Full Product Description

## What It Is

**Dungym** is a mobile-first web app that delivers a complete, structured strength training program built around the kettlebell. It's designed by Taylor Prince and functions as both a workout guide and a session tracker. Users open it on their phone, follow the program, log their weights and reps in real time, and track progress over time.

It's not a generic "build your own workout" app. It's **one opinionated program, delivered as a product** — closer to buying a training plan from a coach than downloading a workout builder.

---

## The Program

**3 days per week. ~50-60 minutes per session. Kettlebell + barbell/bodyweight hybrid.**

Every session starts the same way:

1. **Warm-up** (5 min) — Row, Hip 90/90s, Arm bars, Bodyweight windmills, Goblet squat hold
2. **The Complex** (3 rounds) — A metabolic conditioning circuit performed every session:
   - Single-Arm Swings (heavy bell, 10/arm)
   - SA Clean -> Front Squat -> Press (heavy bell, 5/arm)
   - Windmill (light bell, 5-8/side)

Then the days diverge:

| Day | Theme | Superset | Finisher |
|-----|-------|----------|----------|
| **Monday** | Push / Anti-Extension | Bench Press + SA KB Row | Hanging Leg Raises |
| **Wednesday** | Pull / Anti-Rotation | Pull-Ups + Pallof Press | Goblet Cossack Squat |
| **Friday** | Carry / Total Body | RDL + Dead Bug | Farmer's Carry |

### Key Methodology

- Every rep has a **prescribed tempo** (e.g., 3-1-1-0 = 3s down, 1s pause, 1s up, 0s top). This is a serious differentiator — most apps don't prescribe tempo at all.
- **RPE-based** intensity (Rate of Perceived Exertion, 6-8 range)
- **Superset structure** — opposing/complementary movements paired with timed rest
- **Progressive overload** — weight-based, tracked across sessions

### Tempo System

Format: **Eccentric - Bottom Pause - Concentric - Top Pause** (all in seconds). **X** = explosive/maximal speed.

Example: 3-1-1-0 means 3 seconds down, 1 second pause at bottom, 1 second up, 0 pause at top.

### Progression Strategy

- **Heavy Bell**: Should make round 3 challenging but clean. If form breaks on the press, size down.
- **Light Bell**: Windmills should be slow and controlled. No grinding.
- **Moving Up**: Progress heavy bell first. When 3 rounds feel controlled, bump up one size.

### Total Exercises in the Program (12)

- **Kettlebell**: Single-Arm Swings, SA Clean -> Front Squat -> Press, Windmill, Single-Arm KB Row, Goblet Cossack Squat
- **Barbell/Dumbbell**: Bench Press, RDL
- **Bodyweight**: Pull-Ups, Hanging Leg Raises, Dead Bug
- **Loaded Carries**: Farmer's Carry
- **Resistance/Cable**: Pallof Press

---

## Features & User Experience

### Splash Screen (First Visit)

- Logo (custom sword/dagger SVG icon), app name "Dungym"
- Tagline: *"A complete strength program built around the kettlebell. Three days a week. Simple and repeatable."*
- Three selling points highlighted: The Complex, Superset + Finisher, Tempo controlled
- Two CTAs: "View the Program" (primary, red) and "Sign in for tracking & progress" (secondary)

### Main Workout View

- **Day selector tabs** (Mon / Wed / Fri) at the top — auto-selects today's workout
- **Swipeable** between days (touch gesture with smooth animation)
- **Collapsible warm-up** section
- **The Complex card** — shows all 3 exercises with bell size, reps, tempo, RPE
- **Superset card** — day-specific paired exercises
- **Finisher card** — day-specific finisher
- **Round/Set tracking dots** — tap to increment, visual glow effect when all rounds complete
- **Exercise detail expand** — tap any exercise name to reveal:
  - Form instructions/coaching cues
  - Set-by-set weight/reps input fields
  - Per-set note field (e.g., "press failed rep 4")
  - Placeholders show last session's numbers for reference
- **Auto-fill**: entering weight on set 1 propagates to sets 2 and 3
- Collapsible "Progression Notes" and "Tempo Guide" sections at bottom

### Session Timer & Controls (Bottom Bar)

- "Start session" button with play icon
- Running clock showing elapsed time (mm:ss)
- **Pause/Resume** controls
- **Discard** button (double-tap to confirm)
- **Finish** button (double-tap to confirm) — saves the session
- Session auto-starts when user begins logging data
- **Completion glow**: when all rounds/sets are done, a subtle red glow appears around the screen edges

### Rest Timer

- Tap "Rest Xs" button on any card to start a countdown timer
- Takes over the bottom bar with a progress bar and countdown
- Audible **triple beep** (880Hz oscillator via Web Audio API) when timer ends
- **Haptic vibration** on timer completion
- **Screen wake lock** stays active during rest timer
- Auto-increments the round/set count when rest timer finishes
- Skip button to dismiss early
- Auto-dismisses after 5 seconds post-completion

### History View

- Chronological list of completed sessions
- Each session card shows: day theme, date, duration
- Expandable to show all exercises with weight x reps per set, plus any notes
- Delete sessions (double-tap confirm)

### Progress Charts

- Appears when 2+ sessions exist
- SVG line chart showing weight and/or reps over time (up to last 10 sessions)
- **Dual-axis** support: red line for weight, gray dashed line for reps
- Horizontal scrolling exercise picker to switch between exercises
- Auto-scales axes with smart grid line computation

### Account & Authentication

- Passwordless email auth (OTP code sent to email)
- Shows logged-in email, sign out button
- No password to remember — just email + 8-digit code

### Bottom Navigation

- 3 tabs: Workout, History, Account
- Account tab shows user's initial when signed in
- History tab redirects anonymous users to sign-in

---

## User Tiers (Current)

| | **Anonymous (No Sign-in)** | **Signed In (Free)** |
|---|---|---|
| View full program | Yes | Yes |
| Round/set tracking | Yes | Yes |
| Rest timers + audio | Yes | Yes |
| Log weights/reps | No — shows "Sign in to log your sets" | Yes |
| Session persistence | No — data lost on refresh | Yes — saved to cloud |
| Workout history | No | Yes |
| Progress charts | No | Yes |
| Data syncs across devices | No | Yes |
| **Price** | Free | Free |

---

## Visual Design & Branding

- **Color scheme**: Dark mode only. Background #0a0a0a (near-black), cards #1a1a1a, accent color is **red-500** (#ef4444)
- **Typography**: Inter (Google Font), clean and modern
- **Icon/Logo**: Custom SVG — a minimalist sword/dagger shape in zinc tones
- **UI style**: Rounded corners (xl radius), subtle white/10 borders, minimal use of color — very iOS-native feeling
- **Animations**: Fade-in-up on page load (staggered), smooth expand/collapse, swipe transitions, splash screen fade-out
- **No light mode** currently

---

## Technical Details

- **Framework**: Next.js 16 (React 19) — App Router
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth — email OTP (passwordless)
- **Hosting**: Designed for Vercel deployment
- **PWA**: Has `manifest.json` with `display: standalone` — installable to home screen on iOS/Android. App icons for 192x192 and 180x180. Safe area inset support throughout
- **Offline**: Local draft storage via localStorage (weights/reps persist across page refreshes during a session)
- **No native app** — purely a web app, but designed to feel native when installed to home screen
- **OpenGraph + Twitter Cards**: Configured for social sharing

---

## Revenue Opportunity

Currently **everything is free**. There is no payment infrastructure — no Stripe, no subscription logic, no premium tier. The architecture already has the two-tier gate pattern built in (anonymous vs. signed-in), so adding a third tier (subscriber) is straightforward.

### Natural Paywall Placement

The existing "Sign in to log your sets" prompt in every exercise card could become "Subscribe to log your sets" for signed-in-but-not-subscribed users. The funnel would be:

```
Browse program (free) -> Sign in (free) -> Subscribe (paid) -> Full access
```

### What the Paid Tier Could Gate

- Weight/rep logging and persistence
- Session history and progress charts
- Future features (additional programs, AI coaching, etc.)

### Distribution Advantage

The PWA install flow means no App Store review process and no 30% Apple/Google cut if using Stripe directly via the web. Users install it to their home screen and it behaves like a native app.

---

## What Makes It Different

1. **It's a product, not a platform** — one curated program, not a marketplace of random workouts
2. **Tempo prescription** — almost no consumer fitness apps prescribe and display specific eccentric/concentric tempos per exercise
3. **Session-aware UX** — auto-start timer on first input, rest timer auto-advances rounds, completion glow, wake lock during rest
4. **Feels native** — PWA with safe area support, haptic feedback, audio cues, swipe navigation. Users install it to their home screen and it behaves like a native app
5. **No account friction** — passwordless OTP means zero password management
6. **Coach's perspective** — progression notes, form cues, RPE guidance built into every exercise. It's like having the program designer in your pocket
