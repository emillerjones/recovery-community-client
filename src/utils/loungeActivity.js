// The Lounge describes activity without exposing an exact member count.
// Recent messages make the fire feel warmer; ordinary site browsing does not.
export function getLoungeActivity(status) {
  const messages = Number(status?.messages_last_hour) || 0;

  if (messages >= 8) {
    return {
      level: "bright",
      label: "The fire is bright",
      shortLabel: "Lounge is bright",
      detail: "Conversation is flowing",
    };
  }

  if (messages >= 3) {
    return {
      level: "glowing",
      label: "The fire is glowing",
      shortLabel: "Lounge is glowing",
      detail: "Members are gathering",
    };
  }

  if (messages >= 1) {
    return {
      level: "warm",
      label: "The fire is warm",
      shortLabel: "Lounge is warm",
      detail: "Someone has been by recently",
    };
  }

  return {
    level: "quiet",
    label: "The fire is quiet",
    shortLabel: "Lounge is quiet",
    detail: "Pull up a chair anytime",
  };
}
