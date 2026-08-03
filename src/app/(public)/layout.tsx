import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageViewTracker } from "@/components/PageViewTracker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-shine flex min-h-full flex-1 flex-col bg-cream-100 text-ink">
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
