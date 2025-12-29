
// --------------------------------------------------------------------------
// THIS CODE IS FOR YOUR FIREBASE CLOUD FUNCTIONS BACKEND (functions/src/index.ts)
// IT DOES NOT RUN IN THE BROWSER.
// --------------------------------------------------------------------------

/*
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

// Only init once
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const IG_OEMBED_TOKEN = functions.config().wizup.ig_oembed_token;
const IG_SESSION_COOKIE = functions.config().wizup.ig_session_cookie;

// ---------- UTILITIES ---------- //

function normalizeFollowerCount(raw: string | number): number | null {
  if (typeof raw === "number") return raw;

  const trimmed = raw.trim().toLowerCase();

  // 12.5k, 1.2m, etc.
  const suffixMatch = trimmed.match(/^([\d.,]+)\s*([km])$/);
  if (suffixMatch) {
    const value = parseFloat(suffixMatch[1].replace(",", ""));
    const suffix = suffixMatch[2];
    if (suffix === "k") return Math.round(value * 1_000);
    if (suffix === "m") return Math.round(value * 1_000_000);
  }

  // 12,500 or 12500
  const numeric = trimmed.replace(/,/g, "");
  const n = Number(numeric);
  return Number.isFinite(n) ? n : null;
}

function extractUsernameFromUrl(url: string): string {
  // https://www.instagram.com/facelessavatars/
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[0] || "";
  } catch {
    return "";
  }
}

// ---------- LAYER 1: OEMBED VALIDATION ---------- //

async function fetchOEmbedProfile(instagramUrl: string) {
  if (!IG_OEMBED_TOKEN) return null;

  const endpoint = "https://graph.facebook.com/v17.0/instagram_oembed";
  try {
    const res = await axios.get(endpoint, {
      params: {
        url: instagramUrl,
        access_token: IG_OEMBED_TOKEN,
      },
      timeout: 8000,
    });

    // Does NOT include followers, just basic sanity check.
    return {
      authorName: res.data.author_name as string,
      thumbnailUrl: res.data.thumbnail_url as string | undefined,
    };
  } catch (err) {
    console.warn("oEmbed failed:", (err as any).message);
    return null;
  }
}

// ---------- LAYER 2 + 3: HTML SCRAPING ---------- //

const IG_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchInstagramHtml(instagramUrl: string, useSessionCookie: boolean) {
  const headers: Record<string, string> = {
    "User-Agent": IG_USER_AGENT,
    "Accept-Language": "en-US,en;q=0.9",
  };
  if (useSessionCookie && IG_SESSION_COOKIE) {
    headers["Cookie"] = IG_SESSION_COOKIE;
  }

  const res = await axios.get(instagramUrl, {
    headers,
    timeout: 10000,
  });

  return res.data as string;
}

function extractFollowersFromHtml(html: string): number | null {
  // Pattern A: <meta name="description" content="52 Followers, 28 Posts ...">
  const metaMatch = html.match(/"([\d.,]+)\s+Followers"/i);
  if (metaMatch?.[1]) {
    const followers = normalizeFollowerCount(metaMatch[1]);
    if (followers) return followers;
  }

  // Pattern B: {"edge_followed_by":{"count":52}}
  const jsonMatch = html.match(/"edge_followed_by":\{"count":(\d+)\}/);
  if (jsonMatch?.[1]) {
    const followers = normalizeFollowerCount(jsonMatch[1]);
    if (followers) return followers;
  }

  // Pattern C: "followed_by":52
  const simpleMatch = html.match(/"followed_by":\s*(\d+)/);
  if (simpleMatch?.[1]) {
    const followers = normalizeFollowerCount(simpleMatch[1]);
    if (followers) return followers;
  }

  return null;
}

// ---------- LAYER 4: PLAYWRIGHT (DOM SCRAPE) ---------- //
// NOTE: Only works if you install Playwright and configure it.
// You can deploy this function to Cloud Run if Functions env is too tight.

let playwright: any;

async function scrapeFollowersWithPlaywright(instagramUrl: string): Promise<number | null> {
  if (!playwright) {
    try {
      // Lazy load to avoid cold start penalty when not used.
      playwright = require("playwright");
    } catch (e) {
      console.warn("Playwright not installed, skipping DOM scrape.");
      return null;
    }
  }

  const browser = await playwright.chromium.launch({
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.goto(instagramUrl, { waitUntil: "networkidle", timeout: 20000 });

    // First try meta description
    const metaContent = await page.$eval(
      'meta[name="description"]',
      (el: HTMLMetaElement) => el.content
    );
    const metaMatch = metaContent.match(/([\d.,kKmM]+)\s+Followers/i);
    if (metaMatch?.[1]) {
      const followers = normalizeFollowerCount(metaMatch[1]);
      if (followers) return followers;
    }

    // Fallback: search hydrated JSON in page content
    const pageContent = await page.content();
    const altFollowers = extractFollowersFromHtml(pageContent);
    return altFollowers;
  } catch (err) {
    console.warn("Playwright scrape failed:", (err as any).message);
    return null;
  } finally {
    await browser.close();
  }
}

// ---------- MAIN FUNCTION ---------- //

export const verifyInstagramIdentity = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    const { instagramUrl } = data as { instagramUrl: string };

    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }
    if (!instagramUrl) {
      throw new functions.https.HttpsError("invalid-argument", "instagramUrl is required.");
    }

    const uid = context.auth.uid;
    const username = extractUsernameFromUrl(instagramUrl);
    if (!username) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid Instagram URL.");
    }

    let followers: number | null = null;
    let verifiedVia: "oembed" | "html" | "html+cookie" | "playwright" | "manual" | null = null;

    // ---- Layer 1: sanity check with oEmbed ---- //
    const oembedInfo = await fetchOEmbedProfile(instagramUrl);
    if (!oembedInfo) {
      console.warn("oEmbed did not confirm profile, continuing anyway.");
    }

    // ---- Layer 2: Basic HTML scrape ---- //
    try {
      const html = await fetchInstagramHtml(instagramUrl, false);
      followers = extractFollowersFromHtml(html);
      if (followers) {
        verifiedVia = "html";
      }
    } catch (err) {
      console.warn("Basic HTML scrape failed:", (err as any).message);
    }

    // ---- Layer 3: Cookie-based HTML scrape ---- //
    if (!followers) {
      try {
        const htmlWithCookie = await fetchInstagramHtml(instagramUrl, true);
        followers = extractFollowersFromHtml(htmlWithCookie);
        if (followers) {
          verifiedVia = "html+cookie";
        }
      } catch (err) {
        console.warn("Cookie HTML scrape failed:", (err as any).message);
      }
    }

    // ---- Layer 4: Playwright DOM scrape ---- //
    if (!followers) {
      followers = await scrapeFollowersWithPlaywright(instagramUrl);
      if (followers) {
        verifiedVia = "playwright";
      }
    }

    // ---- Layer 5: Manual confirmation needed ---- //
    if (!followers) {
      // Tell frontend: we couldn't auto-detect, ask user to confirm followers.
      return {
        status: "manual_required",
        instagramUrl,
        instagramUsername: username,
        suggestedFollowers: null,
      };
    }

    // Guardrails: follower threshold
    if (followers < 1000) {
      // Still let them continue, but mark as ineligible
      return {
        status: "below_threshold",
        instagramUrl,
        instagramUsername: username,
        followers,
        minRequired: 1000,
      };
    }

    // ---- Persist to Firestore ---- //
    const docRef = db.collection("influencers").doc(uid);
    await docRef.set(
      {
        uid,
        platform: "instagram",
        instagramUrl,
        instagramUsername: username,
        followers,
        verifiedVia,
        lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      status: "ok",
      instagramUrl,
      instagramUsername: username,
      followers,
      verifiedVia,
    };
  });

export const confirmInstagramFollowers = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    const { instagramUrl, followers } = data as {
      instagramUrl: string;
      followers: number;
    };

    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required.");
    }

    if (!followers || followers < 0) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid follower count.");
    }

    const uid = context.auth.uid;
    const username = extractUsernameFromUrl(instagramUrl);

    const docRef = db.collection("influencers").doc(uid);
    await docRef.set(
      {
        uid,
        platform: "instagram",
        instagramUrl,
        instagramUsername: username,
        followers,
        verifiedVia: "manual",
        lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      status: "ok",
      followers,
      verifiedVia: "manual",
    };
  });
*/
