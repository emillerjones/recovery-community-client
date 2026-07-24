import {
  Confetti,
  HandHeart,
  Handshake,
  Heart,
  Lightbulb,
  Plant,
  Sparkle,
  ThumbsUp,
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
  return (
    <div className="reaction-bar" aria-label="Reactions">
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
  );
}
