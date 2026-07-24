import { BookOpen, Coffee, HeartHandshake, Leaf, LifeBuoy, Trophy, User, UsersRound } from "lucide-react";

// One shared category-to-icon map keeps the forum index, category list, and
// thread header teaching members the same visual language everywhere.
export default function ForumCategoryGlyph({ name, size = 15 }) {
  const normalizedName = name?.toLowerCase() || "";
  if (normalizedName.includes("introduction")) return <User size={size} />;
  if (normalizedName.includes("cannabis")) return <Leaf size={size} />;
  if (normalizedName.includes("success") || normalizedName.includes("milestone")) return <Trophy size={size} />;
  if (normalizedName.includes("question") || normalizedName.includes("support")) return <HeartHandshake size={size} />;
  if (normalizedName.includes("family") || normalizedName.includes("friend")) return <UsersRound size={size} />;
  if (normalizedName.includes("resource")) return <BookOpen size={size} />;
  if (normalizedName.includes("off topic")) return <Coffee size={size} />;
  return <LifeBuoy size={size} />;
}
