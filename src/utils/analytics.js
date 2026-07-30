const SESSION_KEY = "recovery-analytics-session-id";
let fallbackSessionId;

export function getAnalyticsSessionId() {
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch {
    fallbackSessionId ||= crypto.randomUUID();
    return fallbackSessionId;
  }
}
