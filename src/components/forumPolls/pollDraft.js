export function createPollDraft() {
  return {
    question: "",
    options: ["", ""],
    allowMultiple: false,
    resultsVisibility: "after_vote",
    voterVisibility: "private",
    durationHours: "none",
    existingClosesAt: null,
  };
}

export function pollToDraft(poll) {
  return {
    question: poll.question,
    options: poll.options.map((option) => option.option_text),
    allowMultiple: poll.allow_multiple,
    resultsVisibility: poll.results_visibility,
    voterVisibility: poll.voter_visibility,
    durationHours: poll.closes_at ? "existing" : "none",
    existingClosesAt: poll.closes_at,
  };
}

export function pollDraftToRequest(poll) {
  if (!poll) return null;
  const question = poll.question.trim();
  const options = poll.options.map((option) => option.trim());
  if (!question) throw new Error("Add a question for your poll.");
  if (options.length < 2 || options.some((option) => !option)) {
    throw new Error("Add at least two poll choices.");
  }
  if (new Set(options.map((option) => option.toLocaleLowerCase())).size !== options.length) {
    throw new Error("Each poll choice needs to be different.");
  }

  let closesAt = null;
  if (poll.durationHours === "existing") closesAt = poll.existingClosesAt;
  else if (poll.durationHours !== "none") {
    closesAt = new Date(Date.now() + Number(poll.durationHours) * 60 * 60 * 1000).toISOString();
  }

  return {
    question,
    options,
    allow_multiple: poll.allowMultiple,
    results_visibility: poll.resultsVisibility,
    voter_visibility: poll.voterVisibility,
    closes_at: closesAt,
  };
}
