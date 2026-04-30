import { Star, Sparkles, ExternalLink, Copy, CreditCard, Users, Briefcase, Zap } from "lucide-react";

const iconMap = {
  star: Star,
  sparkles: Sparkles,
  "external-link": ExternalLink,
  copy: Copy,
  "credit-card": CreditCard,
  users: Users,
  briefcase: Briefcase,
  zap: Zap,
};

export default function ProductIcon({ name, className = "h-3.5 w-3.5" }) {
  const Icon = iconMap[name] || Zap;
  return <Icon className={className} />;
}
