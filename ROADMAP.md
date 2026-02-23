# Dungym Launch & Feature Roadmap

Strategic implementation plan for turning the current PWA into a monetized product.

---

## Build Order

Strict priority — work these in sequence:

- [ ] **1. Payments + Subscription Gate** — Stripe checkout, `subscription_status` in DB, middleware to gate premium features (logging sets, session history, progress charts). Do NOT gate the workout program itself.
- [ ] **2. Upgrade Prompt UX** — Modal on locked feature tap: "Track progress + history / Unlock Dungym Pro / Start for $5". Single CTA, no pricing tables, no comparison plans.
- [ ] **3. Shareable Workout Card** — Post-session "Share Progress" button. Generates image (workout name, duration, weights, streak, logo). Export: PNG download, copy link, share sheet. Built-in viral loop.
- [ ] **4. Streak System** — Display "Week streak: X". Psychological retention hook.
- [ ] **5. Session Summary Screen** — Post-workout: total volume, duration, improvements, comparison to last session. Reinforces progress perception.

---

## Subscription States

- `free` — can view program, cannot track
- `trial` — full access, time-limited
- `active` — paying subscriber
- `canceled` — reverts to free

Keep billing logic simple. Avoid edge cases early.

---

## Technical Readiness (Pre-Launch)

- [ ] Authentication persistence
- [ ] Session save reliability
- [ ] Timer reliability
- [ ] Mobile responsiveness
- [ ] Offline fallback

> Priority rule: reliability > features

---

## Performance Optimization (PWA)

- [ ] Preload fonts
- [ ] Cache static assets
- [ ] Minimize bundle size
- [ ] Service worker caching
- [ ] Lazy load charts

Goal: app must feel native.

---

## Conversion Copy

Replace feature language with outcome language.

| Instead of | Use |
|---|---|
| Track your workouts | Get stronger every week with a structured plan |
| Workout tracker | Strength system that tracks itself |

---

## Strategic Positioning

Do not market as software. Market as:

> A strength program that tracks your progress automatically.

People buy results, not tools.

---

## Phase 3 — Growth Multipliers (Later Only)

Build only after revenue exists:

- Additional programs
- Beginner version
- Mobility track
- Theme options
- Leaderboard

---

## Do NOT Build Yet

- Social feeds / friends / messaging
- Wearable integrations / Apple Health sync
- AI coaching
- Custom program builder

These increase complexity without increasing conversions.

---

## Core Principle

You are not launching an app. You are releasing your training system as a product. Maintain this focus to avoid feature bloat and maximize revenue potential.
