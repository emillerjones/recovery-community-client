import { useEffect, useState } from "react";

// Any bottom action bar can opt in with data-mobile-action-bar. Both chat
// launchers use this one policy; individual pages never reposition them.
export default function useVisibleActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const selector = "[data-mobile-action-bar]";
    const bars = new Map();
    function refresh() {
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0;
      const bottom = top + (viewport?.height || window.innerHeight);
      setVisible([...bars].some(([element, intersects]) => {
        if (!intersects || !element.isConnected) return false;
        const style = getComputedStyle(element);
        if (!["sticky", "fixed"].includes(style.position) || style.visibility === "hidden") return false;
        const rect = element.getBoundingClientRect();
        return rect.height > 0 && rect.width > 0 && rect.bottom > top && rect.top < bottom;
      }));
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (bars.has(entry.target)) bars.set(entry.target, entry.isIntersecting);
      });
      refresh();
    });
    function syncBars() {
      bars.forEach((_, element) => {
        if (!element.isConnected || !element.matches(selector)) {
          observer.unobserve(element);
          bars.delete(element);
        }
      });
      document.querySelectorAll(selector).forEach(element => {
        if (!bars.has(element)) {
          bars.set(element, false);
          observer.observe(element);
        }
      });
    }
    syncBars();
    const mutations = new MutationObserver(records => {
      const affectsBars = records.some(record => [...record.addedNodes, ...record.removedNodes].some(node =>
        node.nodeType === Node.ELEMENT_NODE && (node.matches(selector) || node.querySelector(selector))
      ));
      if (affectsBars) { syncBars(); refresh(); }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("scroll", refresh);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", refresh);
      window.visualViewport?.removeEventListener("resize", refresh);
      window.visualViewport?.removeEventListener("scroll", refresh);
    };
  }, []);

  return visible;
}
