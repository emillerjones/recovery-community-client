import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Recovery With The Exit Drug";
const SITE_URL = "https://www.recoverywiththeexitdrug.org";
const DEFAULT_DESCRIPTION = "A cannabis-inclusive recovery community for people who are California sober or using cannabis as an exit drug from alcohol, opioids, and other substances. Peer support, resources, and real recovery stories.";

// Public pages: Google may index these, and each gets its own description.
// Keep this list in sync with public/sitemap.xml.
const PUBLIC_PAGES = {
  "/": {
    title: "Cannabis-Inclusive Recovery Support",
    description: DEFAULT_DESCRIPTION,
  },
  "/ourstory": {
    title: "Our Story",
    description: "How Recovery With The Exit Drug began, and more than a decade of pioneering cannabis-inclusive recovery support since 2013.",
  },
  "/community": {
    title: "Inside the Community",
    description: "See what membership includes: a private, moderated forum for cannabis-friendly recovery, direct messages, and peer support from people who understand California sober living.",
  },
  "/stories": {
    title: "Recovery Stories",
    description: "Real recovery stories from people who used cannabis as an exit drug, shared in their own words. Experiences of Cali sober living, harm reduction, and survival.",
  },
  "/guidelines": {
    title: "Community Guidelines",
    description: "The shared values and guidelines that keep our cannabis-inclusive recovery community safe, respectful, and supportive for every member.",
  },
  "/resources": {
    title: "Recovery Resources",
    description: "Cannabis-friendly recovery resources: cannabis substitution and harm reduction, alcohol- and opioid-specific information, personal accounts, and research on safety.",
  },
  "/faq": {
    title: "Frequently Asked Questions",
    description: "Who our cannabis-inclusive recovery community is for, how it fits alongside AA and NA, whether cannabis substitution is legal, privacy, and how to join.",
  },
  "/discountlinks": {
    title: "Discount Links",
    description: "Discount codes from community partners that support Recovery With The Exit Drug and cannabis-friendly recovery.",
  },
  "/donate": {
    title: "Support the Community",
    description: "Help keep Recovery With The Exit Drug free for members. Support our cannabis-inclusive recovery community with a monetary gift.",
  },
  "/contact": {
    title: "Contact Us",
    description: "Get in touch with the Recovery With The Exit Drug team with questions about the community, partnerships, or cannabis-inclusive recovery support.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description: "How Recovery With The Exit Drug collects, uses, and protects member information.",
  },
};

// Private pages keep a tab title but are marked noindex.
const PRIVATE_TITLES = {
  "/login": "Log In",
  "/register": "Join the Community",
  "/verify-email": "Verify Your Email",
  "/reset-password": "Reset Your Password",
  "/welcome": "Welcome",
  "/today": "Today",
  "/forum": "Community Forum",
  "/messages": "Messages",
  "/profile": "Your Profile",
  "/admin/discount-editor": "Edit Discount Links",
  "/admin/guidelines-editor": "Edit Guidelines",
  "/admin/ourstory-editor": "Edit Our Story",
  "/admin/home-editor": "Edit Home",
  "/admin/resources-editor": "Edit Resources",
  "/admin/faq-editor": "Edit FAQ",
  "/admin/stats": "Community Stats",
  "/admin/membership": "Admissions",
  "/admin/users": "Manage Users",
  "/admin/forum-flags": "Flagged Content",
};

function setHeadTag(selector, create, attribute, value) {
  let tag = document.head.querySelector(selector);
  if (value == null) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = create();
    document.head.appendChild(tag);
  }
  tag.setAttribute(attribute, value);
}

function setMeta(key, value, keyAttribute = "name") {
  setHeadTag(`meta[${keyAttribute}="${key}"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute(keyAttribute, key);
    return meta;
  }, "content", value);
}

function setCanonical(href) {
  setHeadTag('link[rel="canonical"]', () => {
    const link = document.createElement("link");
    link.rel = "canonical";
    return link;
  }, "href", href);
}

export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, "") || "/";
    const publicPage = PUBLIC_PAGES[path];
    // Private titles never include post text, names, or message contents.
    const page = publicPage?.title
      || PRIVATE_TITLES[path]
      || (/^\/forum\/[^/]+$/.test(path) ? "Community Forum" : null)
      || (/^\/messages\/[^/]+$/.test(path) ? "Messages" : null);
    const title = page ? `${page} | ${SITE_NAME}` : SITE_NAME;
    const description = publicPage?.description || DEFAULT_DESCRIPTION;
    const url = publicPage ? SITE_URL + (path === "/" ? "/" : path) : null;

    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", url || SITE_URL + "/", "property");
    setCanonical(url);
    // Anything not listed as public (members area, admin, auth, unknown URLs)
    // stays out of search results.
    setMeta("robots", publicPage ? null : "noindex, nofollow");
  }, [pathname]);

  return null;
}
