import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import "./Contact.css";

const REASONS = [
  "General questions",
  "Recovery support, not crisis support",
  "Share a success story",
  "Partnership opportunities",
  "Media or speaking inquiries",
  "Website or account help",
];

export default function Contact() {
  const { onRegister } = useOutletContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to backend endpoint
    console.log(form);
  };

  return (
    <main className="contact">
      <section className="contact__hero">
        <p className="contact__eyebrow">Contact Us</p>
        <h1>Reach out to a real person.</h1>
        <p>
          Have a question, want to share your story, or need help finding your
          way into the community? Send us a message.
        </p>
      </section>

      <section className="contact__primary">
        <form className="contact__form" onSubmit={handleSubmit}>
          <h2>Send a message</h2>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
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
            <textarea name="message" rows={6} value={form.message} onChange={handleChange} required />
          </label>

          <button type="submit" className="contact__submit">
            Send Message
          </button>

          <p className="contact__small">
            This form is not for emergencies. If you are in immediate danger,
            contact local emergency services.
          </p>
        </form>

        <aside className="contact__side">
          <div className="contact__join-card">
            <h2>Looking for support?</h2>
            <p>
              The best place to connect with others is inside our community.
              Join to access conversations, stories, resources, and support.
            </p>
            <button onClick={onRegister} className="contact__join-btn">
              Join the Community
            </button>
          </div>

          <div className="contact__quick-links">
            <h3>Start here</h3>
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
            <span className="contact__social-icon">f</span>
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
            <span className="contact__social-icon">◎</span>
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