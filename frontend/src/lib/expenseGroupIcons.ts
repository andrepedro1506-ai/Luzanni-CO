import {
  Home,
  Lock,
  Repeat,
  Tags,
  Truck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS_BY_NAME: Record<string, LucideIcon> = {
  fornecedores: Truck,
  "custo fixo": Lock,
  "custo variado": Repeat,
  aluguel: Home,
  "despesas sócios": Users,
  "pró-labore": User,
};

export function expenseGroupIcon(name: string): LucideIcon {
  return ICONS_BY_NAME[name.toLowerCase()] ?? Tags;
}
