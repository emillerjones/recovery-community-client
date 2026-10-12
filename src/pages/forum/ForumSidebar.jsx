import { Link } from "react-router-dom";
import {
  Bell,
  Hash,
  HeartHandshake,
  Settings2,
  ShieldCheck,
} from "lucide-react";

export default function ForumSidebar({ tags, isStaff, onSelectTag, onManageTags, staffOnly = false }) {
  return (
    <aside className="forum-feed-side">
      <section className="forum-feed-side__welcome">
        <HeartHandshake size={22} />
        <h2>{staffOnly ? "Your team's reference space." : "You belong here."}</h2>
        <p>{staffOnly ? "Keep guidelines and important updates here. Use Staff Chat for quick conversations." : "You don’t need perfect words. Share only what feels comfortable."}</p>
      </section>
      <section>
        <h2><Hash size={15} /> Browse tags</h2>
        <div className="forum-feed-topic-list">
          {tags.filter((tag) => tag.active).slice(0, 8).map((tag) => (
            <button key={tag.tag_id} onClick={() => onSelectTag(tag.slug)}>
              <span>#{tag.slug}</span>
              {!staffOnly && <small>{tag.post_count || 0}</small>}
            </button>
          ))}
        </div>
        {isStaff && (
          <button className="forum-feed-manage" onClick={onManageTags}>
            <Settings2 size={14} /> Manage staff tags
          </button>
        )}
      </section>
      <section>
        <h2><Bell size={15} /> Stay connected</h2>
        <p>
          {staffOnly ? "No alerts are sent for staff announcements. Check this section for updates and use Got it to acknowledge a post." : "New conversations appear in your notification list so early posts don’t go unanswered."}
        </p>
      </section>
      <section>
        <h2><ShieldCheck size={15} /> Community care</h2>
        <p>Be kind, protect privacy, and share from your own experience.</p>
        <Link to="/guidelines">Read our guidelines →</Link>
      </section>
    </aside>
  );
}
