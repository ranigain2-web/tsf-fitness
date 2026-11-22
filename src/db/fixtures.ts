// TSF-002: deterministic seed fixtures. Fixed UUIDs and epoch times so
// tests and the seed script are byte-reproducible. Not an import path
// for production data — D3's dataset import and real user data replace
// these; they exist so every table has a round-tripped example and the
// app can be demoed with plausible content.

import type {
  DayLog,
  Exercise,
  Food,
  Profile,
  Routine,
  WorkoutSession,
  WorkoutSet,
} from './types'

const T = (h: number, m = 0) => Date.UTC(2026, 10, 22, h, m) // 2026-11-22, fixed

export const PROFILE: Profile = {
  id: '0a000000-0000-4000-8000-000000000001',
  name: 'Alex',
  units: 'kg',
  createdAt: T(3),
  updatedAt: T(3),
}

export const EXERCISES: Exercise[] = [
  {
    id: '0a000000-0000-4000-8000-000000000101',
    name: 'Back Squat',
    muscleGroups: ['quads', 'glutes'],
    equipment: 'barbell',
    source: 'builtin',
    createdAt: T(3),
  },
  {
    id: '0a000000-0000-4000-8000-000000000102',
    name: 'Bench Press',
    muscleGroups: ['chest', 'triceps'],
    equipment: 'barbell',
    source: 'builtin',
    createdAt: T(3),
  },
  {
    id: '0a000000-0000-4000-8000-000000000103',
    name: 'Deadlift',
    muscleGroups: ['hamstrings', 'back'],
    equipment: 'barbell',
    source: 'builtin',
    createdAt: T(3),
  },
  {
    id: '0a000000-0000-4000-8000-000000000104',
    name: 'Pull-Up',
    muscleGroups: ['back', 'biceps'],
    equipment: null,
    source: 'builtin',
    createdAt: T(3),
  },
  {
    id: '0a000000-0000-4000-8000-000000000105',
    name: 'Forward Lunge',
    muscleGroups: ['quads', 'glutes'],
    equipment: null,
    source: 'builtin',
    createdAt: T(3),
  },
  {
    id: '0a000000-0000-4000-8000-000000000106',
    name: 'Plank',
    muscleGroups: ['core'],
    equipment: null,
    source: 'builtin',
    createdAt: T(3),
  },
]

export const ROUTINES: Routine[] = [
  {
    id: '0a000000-0000-4000-8000-000000000201',
    name: 'Full Body A',
    exerciseIds: [
      '0a000000-0000-4000-8000-000000000101',
      '0a000000-0000-4000-8000-000000000102',
      '0a000000-0000-4000-8000-000000000104',
    ],
    createdAt: T(3, 30),
  },
]

export const SESSIONS: WorkoutSession[] = [
  {
    id: '0a000000-0000-4000-8000-000000000301',
    routineId: '0a000000-0000-4000-8000-000000000201',
    startedAt: T(10),
    endedAt: T(11),
    notes: 'Felt strong; squat depth good.',
  },
]

export const SETS: WorkoutSet[] = [
  {
    id: '0a000000-0000-4000-8000-000000000401',
    sessionId: '0a000000-0000-4000-8000-000000000301',
    exerciseId: '0a000000-0000-4000-8000-000000000101',
    order: 1,
    reps: 8,
    weightKg: 80,
    rpe: 7,
    done: true,
    doneAt: T(10, 8),
  },
  {
    id: '0a000000-0000-4000-8000-000000000402',
    sessionId: '0a000000-0000-4000-8000-000000000301',
    exerciseId: '0a000000-0000-4000-8000-000000000101',
    order: 2,
    reps: 8,
    weightKg: 80,
    rpe: 8,
    done: true,
    doneAt: T(10, 14),
  },
  {
    id: '0a000000-0000-4000-8000-000000000403',
    sessionId: '0a000000-0000-4000-8000-000000000301',
    exerciseId: '0a000000-0000-4000-8000-000000000102',
    order: 1,
    reps: 10,
    weightKg: 60,
    rpe: 7,
    done: true,
    doneAt: T(10, 25),
  },
  {
    id: '0a000000-0000-4000-8000-000000000404',
    sessionId: '0a000000-0000-4000-8000-000000000301',
    exerciseId: '0a000000-0000-4000-8000-000000000102',
    order: 2,
    reps: 9,
    weightKg: 60,
    rpe: null,
    done: false,
    doneAt: null,
  },
]

export const FOODS: Food[] = [
  {
    id: '0a000000-0000-4000-8000-000000000501',
    name: 'Rolled Oats',
    brand: null,
    barcode: '5060335635001',
    per100g: { kcal: 379, protein: 13.2, carb: 67.5, fat: 6.5 },
    source: 'custom',
  },
  {
    id: '0a000000-0000-4000-8000-000000000502',
    name: 'Chicken Breast, raw',
    brand: null,
    barcode: null,
    per100g: { kcal: 120, protein: 22.5, carb: 0, fat: 2.6 },
    source: 'custom',
  },
  {
    id: '0a000000-0000-4000-8000-000000000503',
    name: 'Banana',
    brand: null,
    barcode: null,
    per100g: { kcal: 89, protein: 1.1, carb: 22.8, fat: 0.3 },
    source: 'custom',
  },
]

export const DAY_LOGS: DayLog[] = [
  {
    id: '2026-11-22',
    entries: [
      {
        foodId: '0a000000-0000-4000-8000-000000000501',
        grams: 80,
        meal: 'breakfast',
      },
      {
        foodId: '0a000000-0000-4000-8000-000000000503',
        grams: 120,
        meal: 'snack',
      },
    ],
    updatedAt: T(9),
  },
]

// Every table's seed rows in one map: the round-trip tests iterate it
// and the seed script writes it. Key order = table names in db.ts.
export const FIXTURES = {
  profiles: [PROFILE],
  exercises: EXERCISES,
  routines: ROUTINES,
  sessions: SESSIONS,
  sets: SETS,
  foods: FOODS,
  dayLogs: DAY_LOGS,
} as const
