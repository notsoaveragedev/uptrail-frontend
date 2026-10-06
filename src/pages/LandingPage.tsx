import { useRef, useState } from "react";
import { AlertPipeline } from "@/components/landing/AlertPipeline";
import { DemoCheck } from "@/components/landing/DemoCheck";
import { DeveloperSection } from "@/components/landing/DeveloperSection";
import { FactsBand } from "@/components/landing/FactsBand";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { ProductBento } from "@/components/landing/ProductBento";
import { StatusPageShowcase } from "@/components/landing/StatusPageShowcase";
import { useInView } from "@/hooks/useInView";
import { hasActiveSession } from "@/lib/session";

export function LandingPage() {
  const [isSignedIn] = useState(hasActiveSession);
  const topRef = useRef<HTMLDivElement>(null);
  const isAtTop = useInView(topRef, { once: false, rootMargin: "0px" });

  return (
    <div data-page="landing" className="min-h-dvh bg-canvas">
      <title>Uptrail · Uptime monitoring and free status pages</title>
      <meta
        name="description"
        content="Uptrail monitors your websites and APIs from three regions, alerts the right people with rule-based alerts, and gives every project a free public status page."
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-20 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div ref={topRef} aria-hidden className="absolute top-0 h-px w-px" />
      <LandingHeader isSignedIn={isSignedIn} isScrolled={!isAtTop} />

      <main id="main">
        <Hero isSignedIn={isSignedIn} />
        <DemoCheck />
        <FactsBand />
        <ProductBento />
        <AlertPipeline />
        <StatusPageShowcase />
        <DeveloperSection />
        <PricingPlans isSignedIn={isSignedIn} />
        <FinalCta isSignedIn={isSignedIn} />
      </main>

      <LandingFooter isSignedIn={isSignedIn} />
    </div>
  );
}
