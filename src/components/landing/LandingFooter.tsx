import type { ReactNode } from "react";
import { Link } from "react-router";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/Logo";
import { StatusDot } from "@/components/ui/StatusDot";
import { FOOTER_COLUMNS, STATUS_EXAMPLES } from "@/lib/landing";
import { paths } from "@/lib/paths";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";
import { Container } from "./Container";

export function LandingFooter({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <footer className="border-t border-line pt-16 pb-10">
      <Container>
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 flex flex-col items-start gap-4 lg:col-span-1">
            <Logo />
            <p className="max-w-xs text-muted">Uptime monitoring, rule-based alerts and free status pages.</p>
            <p className="flex items-center gap-2 text-xs text-subtle">
              <StatusDot className="text-up" />
              All systems operational
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title}>
              {column.links.map((link) => (
                <a key={link.label} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </a>
              ))}
            </FooterColumn>
          ))}
          <FooterColumn title="Examples">
            {STATUS_EXAMPLES.map((slug) => (
              <Link key={slug} to={paths.publicStatus(slug)} className={`font-mono text-xs ${LINK_CLASS}`}>
                /status/{slug}
              </Link>
            ))}
          </FooterColumn>
          <FooterColumn title="Account">
            {isSignedIn ? (
              <Link to={DEFAULT_APP_PATH} className={LINK_CLASS}>
                Open app
              </Link>
            ) : (
              <>
                <Link to="/login" className={LINK_CLASS}>
                  Log in
                </Link>
                <Link to="/signup" className={LINK_CLASS}>
                  Sign up
                </Link>
              </>
            )}
          </FooterColumn>
        </div>
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-6 text-xs text-subtle">
          <span>© {new Date().getFullYear()} Uptrail</span>
          <ThemeToggle />
        </div>
      </Container>
    </footer>
  );
}

const LINK_CLASS = "text-muted transition-colors hover:text-ink";

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-caps font-semibold tracking-widest text-subtle uppercase">{title}</h2>
      {children}
    </div>
  );
}
