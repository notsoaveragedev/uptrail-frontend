import { Button, Drawer } from "antd";
import { useState } from "react";
import { LuMenu } from "react-icons/lu";
import { Link } from "react-router";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/ui/LinkButton";
import { NAV_LINKS } from "@/lib/landing";
import { Container } from "./Container";
import { StartButton } from "./StartButton";

type LandingHeaderProps = {
  isSignedIn: boolean;
  isScrolled: boolean;
};

export function LandingHeader({ isSignedIn, isScrolled }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-10 border-b bg-canvas/80 backdrop-blur-md transition-colors ${isScrolled ? "border-line" : "border-transparent"}`}
    >
      <Container className="flex h-14 items-center gap-8">
        <Link to="/" aria-label="Uptrail home" className="rounded-md">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-muted transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {!isSignedIn && (
            <LinkButton type="text" to="/login" className="hidden sm:inline-flex">
              Log in
            </LinkButton>
          )}
          <StartButton isSignedIn={isSignedIn} isCompact />
          <Button
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            icon={<LuMenu className="size-4" />}
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden"
          />
        </div>
      </Container>
      <Drawer
        title="Menu"
        placement="top"
        size="auto"
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        classNames={{ body: "p-0" }}
      >
        <nav aria-label="Mobile" className="flex flex-col divide-y divide-line px-4">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="py-3 text-md text-ink">
              {link.label}
            </a>
          ))}
          {!isSignedIn && (
            <Link to="/login" className="py-3 text-md text-ink">
              Log in
            </Link>
          )}
        </nav>
      </Drawer>
    </header>
  );
}
