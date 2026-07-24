import { useEffect, useState } from "react";
import {
  Confetti,
  HandHeart,
  Handshake,
  Heart,
  Lightbulb,
  Plant,
  Sparkle,
  Smiley,
  ThumbsUp,
  X,
} from "@phosphor-icons/react";
import "./ReactionBar.css";

const REACTIONS = [
  { type: "support", Icon: Heart, label: "Support", color: "#b85d6c" },
  { type: "agree", Icon: ThumbsUp, label: "Agree", color: "#537ca6" },
  { type: "relate", Icon: Handshake, label: "I Relate", color: "#9b753e" },
  { type: "encouragement", Icon: Plant, label: "Encouragement", color: "#56805d" },
  { type: "helpful", Icon: Lightbulb, label: "Helpful", color: "#a7792c" },
  { type: "celebrate", Icon: Confetti, label: "Celebrate", color: "#8462a3" },
  { type: "inspiring", Icon: Sparkle, label: "Inspiring", color: "#397f80" },
  { type: "care", Icon: HandHeart, label: "Care", color: "#a65773" },
];

// `onReact` is NOT something imported from React. It is our own prop name.
// ForumThread.jsx passes a real function into that prop when it renders this
// component. For the main post, `onReact` will point to togglePostReaction().
// For a reply, it will point to a wrapper that calls toggleCommentReaction().
export default function ReactionBar({ reactions = {}, myReaction, onReact, disabled = false }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const activeReactions = REACTIONS.filter((reaction) => Number(reactions[reaction.type] || 0) > 0);

  useEffect(() => {
    if (!pickerOpen) return;
    function closeOnEscape(event) { if (event.key === "Escape") setPickerOpen(false); }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [pickerOpen]);

  function chooseReaction(reactionType) {
    // Mobile and desktop still call the exact same onReact function. The sheet
    // changes only how someone chooses a type, never the API/database flow.
    onReact(reactionType);
    setPickerOpen(false);
  }

  return (
    <div className="reaction-bar" aria-label="Reactions">
      <div className="reaction-desktop">
      {REACTIONS.map((reaction) => {
        const Icon = reaction.Icon;
        const count = Number(reactions[reaction.type] || 0);
        const selected = myReaction === reaction.type;
        return (
          // REACTION TRACE STEP 1: This is one visible reaction button.
          //
          // Read the onClick line below as:
          // "When clicked, call onReact and give it this button's type."
          //
          // For the Support button, reaction.type is "support", so the click
          // effectively becomes: onReact("support"). Because ForumThread.jsx
          // passed togglePostReaction into onReact, that ultimately becomes:
          // togglePostReaction("support").
          //
          // The `() =>` wrapper is important. It tells React to WAIT for the
          // click. Writing onClick={onReact(reaction.type)} would run it right
          // away while the page is rendering instead of waiting for a click.
          <button
            type="button"
            key={reaction.type}
            className={`reaction-button ${selected ? "is-selected" : ""}`}
            style={{ "--reaction-color": reaction.color }}
            onClick={() => onReact(reaction.type)}
            disabled={disabled}
            aria-pressed={selected}
            aria-label={`${reaction.label}${count ? `, ${count}` : ""}`}
            title={reaction.label}
          >
            <Icon size={17} weight={selected ? "fill" : "duotone"} aria-hidden="true" />
            <span>{reaction.label}</span>
            {count > 0 && <strong>{count}</strong>}
          </button>
        );
      })}
      </div>

      {/* MOBILE REACTIONS: counts stay visible in this compact summary. The
          single React button opens every available choice in the sheet below. */}
      <div className="reaction-mobile">
        <div className="reaction-mobile__summary" aria-label="Current reactions">
          {activeReactions.length ? activeReactions.map((reaction) => {
            const Icon = reaction.Icon;
            const selected = myReaction === reaction.type;
            return <button type="button" key={reaction.type} className={selected ? "is-selected" : ""} style={{ "--reaction-color": reaction.color }} onClick={() => onReact(reaction.type)} disabled={disabled} aria-pressed={selected} aria-label={`${reaction.label}, ${reactions[reaction.type]}`} title={reaction.label}><Icon size={17} weight={selected ? "fill" : "duotone"} /><strong>{reactions[reaction.type]}</strong></button>;
          }) : <span>No reactions yet</span>}
        </div>
        <button type="button" className={`reaction-mobile__open ${myReaction ? "has-reaction" : ""}`} onClick={() => setPickerOpen(true)} disabled={disabled}><Smiley size={18} weight={myReaction ? "fill" : "duotone"} /> React</button>
      </div>

      {pickerOpen && (
        <div className="reaction-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPickerOpen(false); }}>
          <section className="reaction-sheet" role="dialog" aria-modal="true" aria-label="Choose a reaction">
            <header><div><span>Community reaction</span><h3>How would you like to respond?</h3></div><button type="button" onClick={() => setPickerOpen(false)} aria-label="Close reaction choices"><X size={21} /></button></header>
            <div className="reaction-sheet__grid">
              {REACTIONS.map((reaction) => {
                const Icon = reaction.Icon;
                const selected = myReaction === reaction.type;
                const count = Number(reactions[reaction.type] || 0);
                return <button type="button" key={reaction.type} className={selected ? "is-selected" : ""} style={{ "--reaction-color": reaction.color }} onClick={() => chooseReaction(reaction.type)} disabled={disabled} aria-pressed={selected}><Icon size={25} weight={selected ? "fill" : "duotone"} /><span>{reaction.label}</span>{count > 0 && <strong>{count}</strong>}</button>;
              })}
            </div>
            {myReaction && <p>Tap your selected reaction again to remove it, or choose another to change it.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
