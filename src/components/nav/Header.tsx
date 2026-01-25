"use client";

import { IOS_APP_STORE_URL, navItems } from "@/lib/constants";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OwlMark } from "../icons";

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={[
        "sticky top-0 z-50 border-b",
        scrolled
          ? "border-border/70 bg-background/70 backdrop-blur"
          : "border-transparent bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-card/70 ring-1 ring-border/60">
            <OwlMark className="h-6 w-6 text-foreground" />
            <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-2 ring-ring/30 transition group-hover:opacity-100" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              ElliesNote
            </div>
            <div className="text-xs text-muted-foreground">
              Gentle check-ins. Clear patterns.
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={IOS_APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-foreground/10 transition hover:bg-primary/90"
          >
            Download now
          </Link>
        </div>
      </div>
    </div>
  );
}
