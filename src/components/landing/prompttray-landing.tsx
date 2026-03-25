import { CTA } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { UseCases } from "@/components/landing/use-cases";

export default function PromptTrayLanding() {
  return (
    <main className="landing-page min-h-screen bg-background">
      <Header />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <UseCases />
      <CTA />
      <Footer />
    </main>
  );
}
