import { useEffect, useState } from "react";

// Any bottom action bar can opt in with data-mobile-action-bar. The Lounge
// launcher uses this shared policy; individual pages never reposition it.
export default function useVisibleActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const selector = "[data-mobile-action-bar]";
    const bars = new Map();
    let disposed = false;
    function refresh() {
      if (disposed) return;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0;
      const bottom = top + (viewport?.height || window.innerHeight);
      setVisible([...bars].some(([element, intersects]) => {
        if (!element.isConnected) return false;
        const style = getComputedStyle(element);
        if (!["sticky", "fixed"].includes(style.position) || style.visibility === "hidden") return false;
        const rect = element.getBoundingClientRect();
        if (rect.height <= 0 || rect.width <= 0) return false;
        // Mobile keyboard transitions can temporarily put a focused composer
        // outside the measured viewport. Keep chat launchers out of its way.
        if (element.contains(document.activeElement)) return true;
        if (!intersects) return false;
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
    function refreshAfterFocus() {
      // On focusout, activeElement may not yet be the newly focused control.
      queueMicrotask(refresh);
    }
    document.addEventListener("focusin", refreshAfterFocus);
    document.addEventListener("focusout", refreshAfterFocus);
    window.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("resize", refresh);
    window.visualViewport?.addEventListener("scroll", refresh);
    return () => {
      disposed = true;
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener("focusin", refreshAfterFocus);
      document.removeEventListener("focusout", refreshAfterFocus);
      window.removeEventListener("resize", refresh);
      window.visualViewport?.removeEventListener("resize", refresh);
      window.visualViewport?.removeEventListener("scroll", refresh);
    };
  }, []);

  return visible;
}
