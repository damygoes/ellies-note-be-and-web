import { IOS_APP_STORE_URL, navItems } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="border-t border-border/70 bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-card/70 ring-1 ring-border/60">
                <Image
                  src="/images/logo.png"
                  alt="An owl with a pen and notepad representing the app"
                  fill
                  className="h-6 w-6 text-foreground"
                />
              </div>
              <div>
                <div className="text-sm font-semibold">ElliesNote</div>
                <div className="text-xs text-muted-foreground">
                  Built for calm consistency.
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              A gentle check-in app that turns tiny notes into useful patterns.
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Explore
              </div>
              <div className="mt-3 grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Download
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href={IOS_APP_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  iOS App Store
                </Link>
                <span className="text-sm text-muted-foreground/70">
                  Android (coming later)
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Legal
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-and-conditions"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms
                </Link>
                <Link
                  href="/support"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {new Date().getFullYear()} ElliesNote. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              iOS available
            </span>
            <span className="text-muted-foreground/50">•</span>
            <span>Android planned</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
