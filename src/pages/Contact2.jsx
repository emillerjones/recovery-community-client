import { useState } from "react";
import { flushSync } from "react-dom";
import { useOutletContext } from "react-router-dom";
import "./Contact2.css";

const API = import.meta.env.VITE_API;
const CONTACT_EMAIL = "recoverywiththeexitdrug@gmail.com";

const REASONS = [
  "General questions",
  "Recovery support, not crisis support",
  "Share a success story",
  "Partnership opportunities",
  "Media or speaking inquiries",
  "Website or account help",
];

/**
 * Contact2 uses the View Transitions API: when the form succeeds,
 * it's replaced by a confirmation panel entirely — rather
 * than just a status line — and that swap happens inside
 * `document.startViewTransition()` so the whole card morphs smoothly
 * instead of the content just being replaced instantly.
 */
function withViewTransition(update) {
  if (typeof document !== "undefined" && document.startViewTransition) {
    document.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

export default function Contact2() {
  const { onRegister } = useOutletContext();
  const [form, setForm] = useState({ name: "", email: "", reason: "", message: "", website: "" });
  const [submitState, setSubmitState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitState("sending");

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "We couldn't send your message.");
      }

      withViewTransition(() => setSubmitState("success"));
    } catch (error) {
      setErrorMessage(error.message || "We couldn't send your message.");
      withViewTransition(() => setSubmitState("error"));
    }
  };

  function sendAnother() {
    setForm({ name: "", email: "", reason: "", message: "", website: "" });
    withViewTransition(() => setSubmitState("idle"));
  }

  return (
    <main className="contact2">
      <section className="contact2-hero">
        <p className="contact2-eyebrow">Contact Us</p>
        <h1>Reach out to a real person.</h1>
        <p>Have a question, want to share your story, or need help finding your way into the community? Send us a message.</p>

        <aside className="contact2-note" aria-label="Design technique: View Transitions API">
          <p className="contact2-note__label">Design technique</p>
          <h3>View Transitions API</h3>
          <p>
            Submit the form successfully and the whole card morphs into a
            confirmation panel via <code>document.startViewTransition()</code>
            — applying a native shared-state transition to the form's
            success state.
          </p>
        </aside>
      </section>

      <section className="contact2-primary">
        <div className="contact2-card">
          {submitState === "success" ? (
            <div className="contact2-success">
              <h2>Thank you.</h2>
              <p>Your message was sent to our team — a real person will read it.</p>
              <button type="button" onClick={sendAnother}>Send another message</button>
            </div>
          ) : (
            <form className="contact2-form" onSubmit={handleSubmit}>
              <h2>Send a message</h2>

              <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} maxLength={100} required />
              </label>

              <label>
                Email
                <input type="email" name="email" value={form.email} onChange={handleChange} maxLength={254} required />
              </label>

              <label>
                Reason
                <select name="reason" value={form.reason} onChange={handleChange} required>
                  <option value="">Choose one</option>
                  {REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </label>

              <label>
                Message
                <textarea name="message" rows={6} value={form.message} onChange={handleChange} maxLength={4000} required />
              </label>

              <div className="contact2-website" aria-hidden="true">
                <label htmlFor="contact2-website">Website</label>
                <input id="contact2-website" name="website" value={form.website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
              </div>

              <button type="submit" disabled={submitState === "sending"}>
                {submitState === "sending" ? "Sending…" : "Send Message"}
              </button>

              {submitState === "error" && (
                <p className="contact2-error">
                  {errorMessage} Please try again or email us directly at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
              )}

              <p className="contact2-small">This form is not for emergencies. If you are in immediate danger, contact local emergency services.</p>
            </form>
          )}
        </div>

        <aside className="contact2-side">
          <h2>Looking for support?</h2>
          <p>The best place to connect with others is inside our community. Join to access conversations, stories, resources, and support.</p>
          <button type="button" onClick={onRegister}>Join the Community</button>
        </aside>
      </section>
    </main>
  );
}
