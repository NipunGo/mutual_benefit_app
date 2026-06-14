# PRD: Couple Fitness Tracker (Pilot v1.0)

## 1. Goal
Validate a simple, no-friction logging loop for two users — gym workouts (Nipun) and running (partner) — for 2-4 weeks. If the habit sticks and the shared-progress hook feels good, consider building toward a "couples fitness" niche product later.

## 2. Users
- **Lifter (Nipun)**: follows a structured workout plan (exercises, sets, reps, weight), logs each set as completed.
- **Runner (Partner)**: logs runs (date, distance, duration, notes), tracks a running streak.
- Both can see each other's progress (shared view).

## 3. MVP Features

### A. Workout Plans
- Editable in-app: create/edit plans organized by day (e.g. "Push Day", "Pull Day", "Leg Day").
- Each plan = list of exercises, each with target sets × reps (+ optional target weight).

### B. Workout Logging
- Pick today's workout from the plan.
- Per exercise, log actual reps/weight per set as completed (tap "log set 1", "set 2", ...).
- Mark workout complete → saved to history.

### C. Running Log
- Manual entry: date, distance (km), duration (optional), notes.
- Unlimited entries per day.

### D. Streaks (user-driven)
- Each user sets their own target frequency (e.g. "4x/week gym", "3x/week running").
- Streak = consecutive periods where the user hit their own target, not a rigid daily streak.
- Current streak + longest streak shown per user.

### E. Shared Dashboard / History
- Both users visible on one shared screen: each person's current streak, recent activity, weekly progress toward their own target.
- History view: calendar/list of past workouts and runs per user.
- Basic stats: this week's sessions/distance, current + longest streak.

## 4. Out of Scope (v1)
- GPS / live run tracking
- Notifications/reminders
- Social features beyond the two of you
- Multi-user scaling / public accounts
- Wearable integrations

## 5. Tech Approach
- **PWA**: React + Vite + Tailwind, manifest + service worker → installable on Android home screen, works offline-tolerant for logging (syncs to Supabase when online).
- **Backend**: Supabase (free tier) — Postgres DB + auth (lightweight, e.g. profile picker + PIN rather than full email/password) + realtime for shared dashboard updates.
- **Auth**: Profile picker (Nipun / Partner) with optional PIN — no email/password flow needed for 2 users.

## 6. Data Model (sketch)
- `users`: id, name, role (lifter/runner), target_frequency (e.g. "4/week")
- `workout_plans`: id, user_id, name (e.g. "Push Day")
- `plan_exercises`: id, plan_id, exercise_name, target_sets, target_reps, target_weight, order
- `workout_sessions`: id, user_id, plan_id, date, status (in_progress/completed)
- `set_logs`: id, session_id, plan_exercise_id, set_number, reps, weight, timestamp
- `runs`: id, user_id, date, distance_km, duration_min, notes, timestamp
- `streaks` (derived/view): user_id, current_streak, longest_streak, last_period_hit

## 7. Success Criteria for Pilot (2-4 weeks)
- Both users log activity ≥ their own target frequency without it feeling like a chore.
- Shared dashboard is checked regularly by both (signal that the "see each other's progress" hook works).
- Decision point at end of pilot: continue as personal tool, expand toward GPS/native for wider audience, or shelve.

## 8. Open Items for Implementation Phase
- Supabase project setup (account, project URL, anon key)
- Initial workout plan content (Nipun to define exercises/sets/reps for first plan)
- Each user's target frequency for streaks
