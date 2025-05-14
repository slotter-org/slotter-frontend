import { BarChart2, Box, Users, Settings, Share2, Lock, Package } from 'lucide-react';


export interface NavItem {
  key: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  href?: string
  children?: NavItem[]
  requiredPermission?: string
}

export const mainNav: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <BarChart2 />,
    href: "/dashboard",
  },
  {
    key: "slotting",
    label: "Slotting",
    icon: <Box />,
    href: "/slotting",
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: <Package />,
    href: "/inventory",
  },
  {
    key: "invitations",
    label: "Invitations",
    icon: <Users />,
    href: "/invitations",
    requiredPermission: "manage_invitations",
  },
  {
    key: "roles",
    label: "Roles",
    icon: <Lock />,
    href: "/roles",
    requiredPermission: "manage_roles",
  },
];


