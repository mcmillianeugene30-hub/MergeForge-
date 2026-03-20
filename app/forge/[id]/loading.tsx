export default function LoadingForgePage() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-96 rounded-2xl bg-muted lg:col-span-2" />
          <div className="h-96 rounded-2xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
