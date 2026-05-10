export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-8 pt-12 sm:pt-24 lg:pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Travel eSIM
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg max-w-md mx-auto leading-relaxed">
          Instant travel data. Half the cost of Airalo, Holafly, and Saily — fair prices, no markup games.
        </p>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_40%_at_50%_30%,#a8d8ea20,transparent_100%)]" />
    </section>
  );
}
