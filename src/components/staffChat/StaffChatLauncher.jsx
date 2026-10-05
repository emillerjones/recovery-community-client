import { ShieldCheck } from "lucide-react";
import { useStaffChat } from "../../contexts/StaffChatContext";
import { useLounge } from "../../contexts/LoungeContext";
import "./StaffChat.css";

export default function StaffChatLauncher({ hideMobileLauncher = false }) {
  const { canAccess, openStaffChat } = useStaffChat();
  const { isOpen } = useLounge();
  if (!canAccess || isOpen) return null;
  return <button type="button" className={`staff-chat-launcher ${hideMobileLauncher ? "staff-chat-launcher--hide-mobile" : ""}`} onClick={openStaffChat}>
    <ShieldCheck size={18} aria-hidden="true" /> Staff Chat
  </button>;
}
