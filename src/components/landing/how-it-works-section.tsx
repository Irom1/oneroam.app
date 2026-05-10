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
      "Pay securely with card. No account needed — just your email to receive the activation details.",
  },
  {
    icon: QrCode,
    title: "Activate Your eSIM",
    description:
      "Scan the QR code we send you, and you are online. Works on any eSIM-compatible phone.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold tracking-tight text-center">
          How it works
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
