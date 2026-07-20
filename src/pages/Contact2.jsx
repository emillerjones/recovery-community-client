import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FiCompass, FiSend, FiUsers } from "react-icons/fi";
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

export default function Contact2() {
  const { onRegister } = useOutletContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
    website: "",
  });
  const [submitState, setSubmitState] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (submitState !== "idle") {
      setSubmitState("idle");
      setSubmitMessage("");
    }
    if (e.target.name === "email" && emailError) {
      setEmailError("");
    }
  };

  const handleEmailBlur = (e) => {
    const value = e.target.value.trim();
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setSubmitState("sending");
    setSubmitMessage("");

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

      setForm({ name: "", email: "", reason: "", message: "", website: "" });
      setSubmitState("success");
      setSubmitMessage("Thank you — your message was sent to our team.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error.message || "We couldn't send your message.");
    }
  };

  return (
    <main className="contact contact2-study">
      <section className="contact__hero">
        <svg className="contact__hero-art" viewBox="0 0 560 390" aria-hidden="true">
          <path className="contact__hero-orbit" d="M42 196C42 91 137 28 284 28c148 0 234 65 234 169 0 106-92 166-238 166S42 301 42 196Z" />
          <path className="contact__hero-bubble contact__hero-bubble--back" d="M244 93h198c27 0 48 21 48 48v71c0 27-21 48-48 48h-72l-45 42 9-42h-90c-27 0-48-21-48-48v-71c0-27 21-48 48-48Z" />
          <path className="contact__hero-bubble" d="M107 139h205c30 0 54 24 54 54v76c0 30-24 54-54 54h-96l-55 43 15-43h-69c-30 0-54-24-54-54v-76c0-30 24-54 54-54Z" />
          <path className="contact__hero-line" d="M113 207h192M113 241h145" />
          <circle className="contact__hero-dot" cx="116" cy="279" r="6" />
          <circle className="contact__hero-dot" cx="140" cy="279" r="6" />
          <circle className="contact__hero-dot" cx="164" cy="279" r="6" />
        </svg>
        <p className="contact__eyebrow">Contact Us</p>
        <h1>Reach out to a real person.</h1>
        <p>
          Have a question, want to share your story, or need help finding your
          way into the community? Send us a message.
        </p>
      </section>

      <div className="contact2-message-path" aria-label="How the contact form works">
        <div className={submitState === "idle" || submitState === "error" ? "is-current" : "is-done"}>
          <span>01</span><p>Write your message</p>
        </div>
        <i aria-hidden="true" className={submitState !== "idle" && submitState !== "error" ? "is-done" : undefined} />
        <div className={submitState === "sending" ? "is-current" : submitState === "success" ? "is-done" : undefined}>
          <span>02</span><p>It reaches the team inbox</p>
        </div>
        <i aria-hidden="true" className={submitState === "success" ? "is-done" : undefined} />
        <div className={submitState === "success" ? "is-current" : undefined}>
          <span>03</span><p>A real person replies</p>
        </div>
      </div>

      <section className="contact__primary">
        <form className="contact__form" onSubmit={handleSubmit}>
          <h2><span className="contact__heading-icon"><FiSend /></span>Send a message</h2>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} maxLength={100} required />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              maxLength={254}
              aria-invalid={emailError ? "true" : undefined}
              aria-describedby={emailError ? "contact2-email-error" : undefined}
              required
            />
            {emailError && (
              <span className="contact2-field-error" id="contact2-email-error" role="alert">
                {emailError}
              </span>
            )}
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
            <span className={`contact2-counter ${form.message.length > 3600 ? "is-near-limit" : ""}`}>
              {form.message.length} / 4000
            </span>
          </label>

          <div className="contact__website" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              value={form.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button type="submit" className="contact__submit" disabled={submitState === "sending"}>
            {submitState === "sending" ? "Sending…" : "Send Message"}
          </button>

          <div className="contact__form-status" aria-live="polite">
            {submitState === "success" && <p className="contact__success">{submitMessage}</p>}
            {submitState === "error" && (
              <p className="contact__error">
                {submitMessage} Please try again or email us directly at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            )}
          </div>

          <p className="contact__privacy">
            Your message will be emailed directly to our team. Please don't include sensitive medical or emergency information.
          </p>

          <p className="contact__small">
            This form is not for emergencies. If you are in immediate danger,
            contact local emergency services.
          </p>
        </form>

        <aside className="contact__side">
          <div className="contact__join-card">
            <h2><span className="contact__heading-icon"><FiUsers /></span>Looking for support?</h2>
            <p>
              The best place to connect with others is inside our community.
              Join to access conversations, stories, resources, and support.
            </p>
            <button onClick={onRegister} className="contact__join-btn">
              Join the Community
            </button>
          </div>

          <div className="contact__quick-links">
            <h3><span className="contact__heading-icon"><FiCompass /></span>Start here</h3>
            <Link to="/stories">Read Success Stories</Link>
            <Link to="/resources">Explore Resources</Link>
            <Link to="/guidelines">View Community Guidelines</Link>
          </div>
        </aside>
      </section>

      <section className="contact__social">
        <div className="contact__section-head">
          <p className="contact__eyebrow">Social Media</p>
          <h2>Follow the public community.</h2>
          <p>
            Facebook and Instagram are great places to see updates, quotes,
            public posts, and recovery encouragement.
          </p>
        </div>

        <div className="contact__social-grid">
          <a
            className="contact__social-card contact__social-card--facebook"
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="contact__social-icon" aria-hidden="true"><FaFacebookF /></span>
            <div>
              <h3>Facebook</h3>
              <p>Public updates, community posts, and recovery encouragement.</p>
              <strong>Visit Facebook →</strong>
            </div>
          </a>

          <a
            className="contact__social-card contact__social-card--instagram"
            href="https://www.instagram.com/recoverywiththeexitdrug"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="contact__social-icon" aria-hidden="true"><FaInstagram /></span>
            <div>
              <h3>Instagram</h3>
              <p>Quotes, stories, educational posts, and visual inspiration.</p>
              <strong>Visit Instagram →</strong>
            </div>
          </a>
        </div>
      </section>

      <section className="contact__closing">
        <h2>Every message is read by a real person.</h2>
        <p>
          For private support and deeper connection, we recommend joining the
          community rather than relying only on social media.
        </p>
      </section>
    </main>
  );
}
