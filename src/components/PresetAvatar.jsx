import * as PhosphorIcons from "@phosphor-icons/react/ssr";
import { avatarColor, parsePresetAvatar } from "./avatarOptions";

export default function PresetAvatar({ value, size = 82, fallback = "?", className = "" }) {
  const preset = parsePresetAvatar(value);
  const Icon = preset ? PhosphorIcons[preset.icon] : null;
  const color = avatarColor(preset?.color);

  return (
    <span
      className={`preset-avatar ${className}`.trim()}
      style={{ width: size, height: size, background: color.background, color: color.foreground }}
      aria-hidden="true"
    >
      {Icon ? <Icon size={size * 0.54} weight="duotone" /> : fallback}
    </span>
  );
}
