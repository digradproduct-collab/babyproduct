"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  readAttributionFromUrl,
  readAttributionCookieClient,
  storeAttributionCookie,
} from "@/lib/attribution";

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fromUrl = readAttributionFromUrl(searchParams);
    if (fromUrl) storeAttributionCookie(fromUrl);

    const attribution = fromUrl ?? readAttributionCookieClient();

    fetch("/api/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, ...attribution }),
      keepalive: true,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
