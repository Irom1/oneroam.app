import { HeroSection } from "@/components/landing/hero-section";
import { FeaturedPlans } from "@/components/landing/featured-plans";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedPlans />
      <HowItWorksSection />
    </>
  );
}
