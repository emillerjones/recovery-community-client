import { Plus, Trash2, X } from "lucide-react";
import "./ForumPoll.css";

export default function PollComposer({ value, onChange, onRemove, editing = false }) {
  function update(changes) {
    onChange({ ...value, ...changes });
  }

  function updateOption(index, optionText) {
    update({
      options: value.options.map((option, optionIndex) => (
        optionIndex === index ? optionText : option
      )),
    });
  }

  function removeOption(index) {
    if (value.options.length <= 2) return;
    update({ options: value.options.filter((_, optionIndex) => optionIndex !== index) });
  }

  return (
    <section className="poll-composer" aria-label={editing ? "Edit poll" : "Poll settings"}>
      <div className="poll-composer__heading">
        <div>
          <strong>{editing ? "Edit poll" : "Poll"}</strong>
          <small>Ask one clear question with 2–10 choices.</small>
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label="Remove poll">
            <X size={17} />
          </button>
        )}
      </div>

      <label>
        Question
        <input
          required
          maxLength={300}
          value={value.question}
          onChange={(event) => update({ question: event.target.value })}
          placeholder="What would you like the community to choose?"
        />
      </label>

      <div className="poll-composer__options">
        {value.options.map((option, index) => (
          <div key={index}>
            <label htmlFor={`poll-choice-${index}`}>Choice {index + 1}</label>
            <span>
              <input
                id={`poll-choice-${index}`}
                required
                maxLength={200}
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Choice ${index + 1}`}
              />
              {value.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  aria-label={`Remove choice ${index + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </span>
          </div>
        ))}
      </div>

      {value.options.length < 10 && (
        <button
          type="button"
          className="poll-composer__add"
          onClick={() => update({ options: [...value.options, ""] })}
        >
          <Plus size={15} /> Add choice
        </button>
      )}

      <div className="poll-composer__settings">
        <label>
          Choices allowed
          <select
            value={value.allowMultiple ? "multiple" : "single"}
            onChange={(event) => update({ allowMultiple: event.target.value === "multiple" })}
          >
            <option value="single">One choice</option>
            <option value="multiple">Multiple choices</option>
          </select>
        </label>
        <label>
          Poll length
          <select
            value={value.durationHours}
            onChange={(event) => update({ durationHours: event.target.value })}
          >
            {value.durationHours === "existing" && <option value="existing">Keep current deadline</option>}
            <option value="none">No deadline</option>
            <option value="1">1 hour</option>
            <option value="4">4 hours</option>
            <option value="8">8 hours</option>
            <option value="24">24 hours</option>
            <option value="72">3 days</option>
            <option value="168">1 week</option>
          </select>
        </label>
        <label>
          Show results
          <select
            value={value.resultsVisibility}
            onChange={(event) => update({ resultsVisibility: event.target.value })}
          >
            <option value="after_vote">After someone votes</option>
            <option value="always">Always</option>
            <option value="after_close">After the poll closes</option>
          </select>
        </label>
        <label>
          Voter names
          <select
            value={value.voterVisibility}
            onChange={(event) => update({ voterVisibility: event.target.value })}
          >
            <option value="private">Private</option>
            <option value="named">Visible with results</option>
          </select>
        </label>
      </div>
      <p className="poll-composer__privacy">
        {value.voterVisibility === "private"
          ? "Private is the default: the app will not show a list of who chose what."
          : "Members who can see the results can also open each choice's voter list."}
      </p>
    </section>
  );
}
