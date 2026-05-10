export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-12 pt-20 sm:pt-28 lg:pt-32">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Travel eSIM
        </h1>
        <p className="mt-5 text-lg text-muted-foreground sm:text-xl max-w-lg mx-auto leading-relaxed">
          Instant data abroad. No signup, no cart — just tap, pay, and go.
        </p>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_30%,#a8d8ea20,transparent_100%)]" />
    </section>
  );
}
