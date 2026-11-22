// TSF-002: typed entities for the local-first data model.
// Single source of truth for every shape stored in Dexie. Fields exist
// only when a roadmap bar names them (YAGNI fence — see
// docs/designs/data-model.md).

export type Units = 'kg' | 'lb'

/** The units default: stamped by the v1→v2 migration onto legacy rows
 * and used by the seed fixtures. Single source for both. */
export const DEFAULT_UNITS: Units = 'kg'
export type ExerciseSource = 'builtin' | 'import' | 'custom'
export type FoodSource = 'custom' | 'off'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface Per100g {
  kcal: number
  protein: number
  carb: number
  fat: number
}

export interface Profile {
  id: string // UUID, generated at creation (globally unique — sync-safe, D25)
  name: string
  units: Units
  createdAt: number // epoch ms
  updatedAt: number
}

export interface Exercise {
  id: string
  name: string
  muscleGroups: string[]
  equipment: string | null
  source: ExerciseSource
  createdAt: number
}

export interface Routine {
  id: string
  name: string
  exerciseIds: string[]
  createdAt: number
}

export interface WorkoutSession {
  id: string
  routineId: string | null
  startedAt: number
  endedAt: number | null
  notes: string | null
}

export interface WorkoutSet {
  id: string
  sessionId: string
  exerciseId: string
  order: number
  reps: number
  // ALWAYS stored in kg — the storage layer never converts; the UI
  // converts for display per Profile.units (rule in data-model.md).
  weightKg: number | null
  rpe: number | null
  done: boolean
  doneAt: number | null
}

export interface Food {
  id: string
  name: string
  brand: string | null
  barcode: string | null
  per100g: Per100g
  source: FoodSource
}

export interface DayLogEntry {
  foodId: string
  grams: number
  meal: MealSlot
}

export interface DayLog {
  id: string // 'YYYY-MM-DD' — one document per day, entries embedded
  entries: DayLogEntry[]
  updatedAt: number
}
