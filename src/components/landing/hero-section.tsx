import { ArrowRight, Globe, Zap, Wifi } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-8 sm:pt-16 lg:pt-24">
      {/* Blue gradient background — darker in dark mode */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, #D6E8F0, #A8C8DA)",
        }}
      />
      {/* Dark mode overlay on hero gradient */}
      <div className="absolute inset-0 -z-10 dark:bg-[#1a1a1a]/60" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — text + CTA */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.05] text-[#1a1a1a] dark:text-white">
              Travel data,
              <br />
              <span className="text-[#f84f5a]">instantly.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#4a4a4a] dark:text-[#b0b0b0] max-w-md leading-relaxed">
              Buy an eSIM in seconds with Apple Pay. Half the price of Airalo
              and Holafly — 10–30GB plans in 100+ countries, no signup needed.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <a
                href="#plans"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm bg-[#f84f5a] hover:bg-[#e8454f] transition-colors shadow-lg shadow-[#f84f5a]/25"
              >
                Browse plans
                <ArrowRight className="h-4 w-4" />
              </a>
              <span className="text-xs text-[#4a4a4a] dark:text-[#b0b0b0]">
                100+ countries &middot; from $3.99
              </span>
            </div>
          </div>

          {/* Right — floating UI elements */}
          <div className="relative hidden lg:flex items-center justify-center h-[420px]">
            {/* Main floating card */}
            <div className="absolute top-6 right-4 bg-white dark:bg-[#252525] rounded-3xl shadow-xl p-5 w-56 z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-full bg-[#f84f5a]/10 dark:bg-[#f84f5a]/20 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-[#f84f5a]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1a1a1a] dark:text-white">Global eSIM</p>
                  <p className="text-[10px] text-[#8e8b84] dark:text-[#8e8e93]">Instant activation</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-[#f2efe9] dark:bg-[#333] rounded-full w-full" />
                <div className="h-2 bg-[#f2efe9] dark:bg-[#333] rounded-full w-3/4" />
                <div className="h-2 bg-[#f2efe9] dark:bg-[#333] rounded-full w-1/2" />
              </div>
            </div>

            {/* Secondary floating card — lower left */}
            <div className="absolute bottom-16 left-2 bg-white dark:bg-[#252525] rounded-2xl shadow-lg p-4 w-44 z-20">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#f2d96b]/30 dark:bg-[#f2d96b]/20 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-[#e8c84a]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1a1a1a] dark:text-white">4.9 ★</p>
                  <p className="text-[10px] text-[#8e8b84] dark:text-[#8e8e93]">App Store</p>
                </div>
              </div>
            </div>

            {/* Third small card */}
            <div className="absolute top-32 left-0 bg-white dark:bg-[#252525] rounded-2xl shadow-lg p-3 w-36 z-20">
              <div className="flex items-center gap-2">
                <Wifi className="h-3.5 w-3.5 text-[#7ecb8a]" />
                <span className="text-[11px] font-medium text-[#1a1a1a] dark:text-white">Connected</span>
              </div>
              <p className="text-[10px] text-[#8e8b84] dark:text-[#8e8e93] mt-1">5G / LTE speeds</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
