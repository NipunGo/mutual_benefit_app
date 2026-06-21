import type {
  ChecklistItem,
  FitnessProgram,
  ProgramSection,
  ProgramWeek,
} from '../types'
import { uid } from './storage'

const PROGRAM_KEY = 'mb_program'

function key(userId: string) {
  return `${PROGRAM_KEY}_${userId}`
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// --- Plan content (Plan 1: fat loss + muscle retention, 4 days/week) ---

interface RawExercise {
  name: string
  scheme: string
}

interface RawDay {
  title: string
  subtitle?: string
  exercises: RawExercise[]
  // extra non-weighted checklist items (e.g. cardio walk)
  extras: string[]
}

// Three phases. Same 4-day Upper/Lower split; sets/reps progress each phase.
// scheme key per phase keeps exercise identity stable so weights carry over.
function daysForPhase(phase: 1 | 2 | 3): RawDay[] {
  // reps/sets by phase
  const s = phase === 1 ? '3' : '4' // sets
  const rMain = phase === 1 ? '12' : phase === 2 ? '10' : '8' // main compound reps
  const rAcc = phase === 1 ? '15' : phase === 2 ? '12' : '10' // accessory reps
  const plank = phase === 1 ? '3×45s' : phase === 2 ? '3×60s' : '4×60s'
  const walk =
    phase === 1
      ? 'Incline treadmill walk — 15 min'
      : phase === 2
        ? 'Incline treadmill walk — 18 min'
        : 'Incline treadmill walk — 20 min'

  return [
    {
      title: 'Day 1 — Upper A',
      subtitle: 'Push focus + back',
      exercises: [
        { name: 'Incline Dumbbell Press', scheme: `${s}×${rMain}` },
        { name: 'Lat Pulldown', scheme: `${s}×${rMain}` },
        { name: 'Seated Cable Row', scheme: `${s}×${rMain}` },
        { name: 'Dumbbell Shoulder Press', scheme: `${s}×${rAcc}` },
        { name: 'Bicep Curl', scheme: `${s}×${rAcc}` },
        { name: 'Triceps Rope Pushdown', scheme: `${s}×${rAcc}` },
      ],
      extras: [walk],
    },
    {
      title: 'Day 2 — Lower A',
      subtitle: 'Legs + core',
      exercises: [
        { name: 'Leg Press', scheme: `${s}×${rMain}` },
        { name: 'Romanian Deadlift', scheme: `${s}×${rMain}` },
        { name: 'Lying Leg Curl', scheme: `${s}×${rAcc}` },
        { name: 'Leg Extension', scheme: `${s}×${rAcc}` },
        { name: 'Standing Calf Raise', scheme: `${s}×${rAcc}` },
      ],
      extras: [`Plank — ${plank}`, walk],
    },
    {
      title: 'Day 3 — Upper B',
      subtitle: 'Back focus + shoulders',
      exercises: [
        { name: 'Chest Press Machine', scheme: `${s}×${rMain}` },
        { name: 'Assisted Pull-up', scheme: `${s}×${rMain}` },
        { name: 'One-Arm Dumbbell Row', scheme: `${s}×${rMain}` },
        { name: 'Lateral Raise', scheme: `${s}×${rAcc}` },
        { name: 'Hammer Curl', scheme: `${s}×${rAcc}` },
        { name: 'Overhead Triceps Extension', scheme: `${s}×${rAcc}` },
      ],
      extras: [walk],
    },
    {
      title: 'Day 4 — Lower B',
      subtitle: 'Legs + core',
      exercises: [
        { name: 'Goblet Squat', scheme: `${s}×${rMain}` },
        { name: 'Hip Thrust', scheme: `${s}×${rMain}` },
        { name: 'Walking Lunge', scheme: `${s}×${rAcc}` },
        { name: 'Seated Leg Curl', scheme: `${s}×${rAcc}` },
        { name: 'Seated Calf Raise', scheme: `${s}×${rAcc}` },
      ],
      extras: ['Hanging Knee Raise — 3×12', walk],
    },
  ]
}

function phaseFor(week: number): { phase: 1 | 2 | 3; name: string; focus: string } {
  if (week <= 4)
    return {
      phase: 1,
      name: 'Foundation',
      focus: 'Groove the movements. Moderate weight, perfect form, leave 2 reps in the tank.',
    }
  if (week <= 8)
    return {
      phase: 2,
      name: 'Build',
      focus: 'Add weight or reps over Phase 1. Push the last 2 reps harder.',
    }
  return {
    phase: 3,
    name: 'Push',
    focus: 'Heaviest phase. Shorter rests (45–60s), take sets close to failure.',
  }
}

function gymSection(day: RawDay): ProgramSection {
  const items: ChecklistItem[] = day.exercises.map((ex) => ({
    id: uid(),
    label: ex.name,
    done: false,
    loggable: true,
    exerciseKey: slug(ex.name),
    scheme: ex.scheme,
  }))
  for (const extra of day.extras) {
    items.push({ id: uid(), label: extra, done: false })
  }
  return {
    id: uid(),
    title: day.title,
    subtitle: day.subtitle,
    kind: 'gym',
    items,
  }
}

function weekendSection(week: number): ProgramSection {
  const items: ChecklistItem[] = [
    { id: uid(), label: 'Hit all 4 gym sessions this week', done: false },
    { id: uid(), label: 'Protein ~150g — 5+ of 7 days', done: false },
    { id: uid(), label: 'Steps target — 5+ of 7 days', done: false },
    { id: uid(), label: 'Calories in range (~1,750) — 5+ of 7 days', done: false },
    { id: uid(), label: 'Sleep 7h+ — 5+ of 7 days', done: false },
    { id: uid(), label: 'Measure waist at navel', done: false },
  ]
  if (week === 1) {
    items.unshift({ id: uid(), label: '⚠️ Get TSH blood test done', done: false })
  }
  if (week === 6 || week === 12) {
    items.push({ id: uid(), label: '📋 Re-do Viva body composition scan', done: false })
  }
  return {
    id: uid(),
    title: 'Weekend Review',
    subtitle: 'Log your weight + check the week',
    kind: 'weekend',
    items,
  }
}

function buildWeek(week: number): ProgramWeek {
  const { phase, name, focus } = phaseFor(week)
  const days = daysForPhase(phase)
  return {
    week,
    phase: name,
    focus,
    sections: [...days.map(gymSection), weekendSection(week)],
  }
}

function supplementsSection(): ProgramSection {
  const labels = [
    'Thyroid pill — empty stomach, 30–45 min before food',
    'Whey protein — 1 scoop (~25g)',
    'Creatine monohydrate — 5g (any time, daily)',
    'Omega-3 fish oil — 1–2g',
    'Vitamin D3 — as per blood test',
    'Vitamin B12 — as advised',
  ]
  return {
    id: uid(),
    title: 'Daily Supplements',
    subtitle: 'Confirm Vit D / B12 dosing after blood test. None of these are fat burners.',
    kind: 'gym',
    items: labels.map((label) => ({ id: uid(), label, done: false })),
  }
}

export function buildProgram(userId: string): FitnessProgram {
  const weeks: ProgramWeek[] = []
  for (let w = 1; w <= 12; w++) weeks.push(buildWeek(w))
  return {
    id: uid(),
    userId,
    goal: 'Fat loss + muscle retention — 89kg → ~79kg in 12 weeks (72kg by ~month 5)',
    dailyTargets: [
      'Calories: ~1,750 / day',
      'Protein: 150–160 g / day',
      'Steps: 8,000 → 10,000 / day',
      'Water: 3.5–4 L / day',
      'Sleep: 7+ hrs / night',
      'Post-lift: incline walk (in each gym day)',
    ],
    supplements: supplementsSection(),
    weeks,
    lastWeights: {},
  }
}

// --- Storage ---

export function getProgram(userId: string): FitnessProgram {
  const raw = localStorage.getItem(key(userId))
  if (raw) {
    try {
      return JSON.parse(raw) as FitnessProgram
    } catch {
      // fall through to rebuild
    }
  }
  const fresh = buildProgram(userId)
  saveProgram(fresh)
  return fresh
}

export function saveProgram(program: FitnessProgram) {
  localStorage.setItem(key(program.userId), JSON.stringify(program))
}

export function resetProgram(userId: string): FitnessProgram {
  const fresh = buildProgram(userId)
  saveProgram(fresh)
  return fresh
}
