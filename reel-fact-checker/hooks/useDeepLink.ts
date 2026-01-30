import * as Linking from "expo-linking";
import { useEffect, useState } from "react";

type UrlHandler = (url: string) => void;

export function useDeepLink(onUrlReceived: UrlHandler) {
  const [initialUrl, setInitialUrl] = useState<string | null>(null);

  useEffect(() => {
    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        setInitialUrl(url);
        onUrlReceived(url);
      }
    });

    // Listen for new URLs
    const subscription = Linking.addEventListener("url", ({ url }) => {
      onUrlReceived(url);
    });

    return () => subscription.remove();
  }, [onUrlReceived]);

  return { initialUrl };
}

/**
 * Parse URL from deep link or shared intent
 */
export function parseDeepLinkUrl(url: string): { text?: string; type: "share" | "view" } {
  // Check if it's a share intent (reelfactchecker://shared?text=...)
  if (url.includes("shared")) {
    const parsed = Linking.parse(url);
    const text = parsed.queryParams?.text as string | undefined;
    return { text, type: "share" };
  }

  // Check if it's a direct Instagram link
  if (url.includes("instagram.com")) {
    return { text: url, type: "view" };
  }

  return { text: url, type: "share" };
}
