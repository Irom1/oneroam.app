import { Smartphone, CreditCard, QrCode } from "lucide-react";

const STEPS = [
  {
    icon: Smartphone,
    title: "Choose a Plan",
    description:
      "Browse eSIM plans by country or region. Pick the data amount and validity that fits your trip.",
  },
  {
    icon: CreditCard,
    title: "Purchase Instantly",
    description:
      "Pay with Apple Pay or card. No account needed — just your email to receive activation details.",
  },
  {
    icon: QrCode,
    title: "Activate Your eSIM",
    description:
      "Scan the QR code we send, and you're online. Works on any eSIM-compatible phone.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center text-foreground">
          How it works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-md mx-auto">
          Get connected in under a minute
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="text-center bg-card rounded-3xl p-6 sm:p-8 shadow-sm border border-border/60 card-hover"
            >
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#f84f5a]/10 dark:bg-[#f84f5a]/20">
                <step.icon className="h-7 w-7 text-[#f84f5a]" />
              </div>
              <h3 className="mt-5 font-semibold text-foreground text-lg">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
