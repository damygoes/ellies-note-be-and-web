import { BackgroundOrbs } from "./BackgroundOrbs";
import { AppFooter } from "./nav/Footer";
import { AppHeader } from "./nav/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card text-foreground">
      <BackgroundOrbs />
      <AppHeader />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
