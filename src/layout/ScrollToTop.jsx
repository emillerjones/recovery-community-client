import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return undefined;
      }
      // Page content (e.g. story sections) may not have mounted yet on first paint.
      const timeout = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => clearTimeout(timeout);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    return undefined;
  }, [pathname, hash]);

  return null;
}