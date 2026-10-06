import { Button } from "antd";
import { useId } from "react";
import { LuPlay } from "react-icons/lu";
import { DEMO_INPUT_ID } from "@/lib/landing";
import { Container } from "./Container";
import { HeroConsole } from "./HeroConsole";
import { StartButton } from "./StartButton";

function focusDemoInput() {
  document.getElementById(DEMO_INPUT_ID)?.focus({ preventScroll: true });
}

export function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="hero-backdrop overflow-x-clip">
      <Container className="grid items-center gap-12 pt-12 pb-16 sm:pt-16 xl:grid-cols-[32rem_minmax(0,1fr)] xl:gap-16 xl:pt-20">
        <div className="flex flex-col">
          <h1
            id={titleId}
            className="display-stretch text-display font-semibold tracking-tight sm:text-headline xl:text-hero"
          >
            Know it's down <span className="text-muted">before your users do.</span>
          </h1>
          <p className="mt-5 max-w-md text-body text-pretty text-muted sm:text-lead">
            Uptrail checks your sites and APIs every 30 seconds from three regions, pages the right person, and hosts a
            free status page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <StartButton isSignedIn={isSignedIn} />
            <Button size="large" href="#try" icon={<LuPlay />} onClick={focusDemoInput}>
              Run a live check
            </Button>
          </div>
        </div>
        <HeroConsole />
      </Container>
    </section>
  );
}
