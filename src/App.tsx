// TSF Fitness walking skeleton (TSF-001, Day 1).
// This shell states honestly what exists today; screens arrive with their
// own backlog items and none of this text promises a feature not built.
export default function App() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-200">
      <div className="max-w-xl px-8 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">TSF Fitness</h1>
        <p className="mt-2 text-lg font-medium tracking-widest uppercase text-slate-600 dark:text-slate-400">
          Train. Snap. Fuel.
        </p>
        <p className="mt-6 leading-relaxed text-slate-700 dark:text-slate-300" data-testid="build-status">
          Day 1 build: walking skeleton — installable, offline-capable shell.
          Camera coach, food log, and coach engines land over the next weeks.
        </p>
      </div>
    </main>
  )
}
