# Dungym

A kettlebell workout program by Taylor Prince. Built with Next.js 16, Tailwind 4, Supabase, and Stripe.

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in your keys.

## Supabase Setup

Run this SQL in the Supabase SQL Editor to create the subscriptions table:

```sql
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'free',
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
```

## Dev Console Commands

Reset the splash screen (shows on next refresh):

```js
localStorage.removeItem("dungym-splash-dismissed")
```

Clear all local workout data:

```js
localStorage.removeItem("dungym-draft")
localStorage.removeItem("dungym-sessions")
```

Sign out the anonymous session (useful for testing auth):

```js
localStorage.removeItem("sb-azvlkwsgqfwukbtdzoez-auth-token")
```

## Stripe Webhook

The webhook endpoint is at `/api/webhooks/stripe`. Configure this URL in the Stripe dashboard:

```
https://dungym.app/api/webhooks/stripe
```

Events to listen for:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
