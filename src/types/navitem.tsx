import { BarChart2, Box, Users, Settings, Share2, Lock, Package, Ticket,  } from 'lucide-react';


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
    key: "roles",
    label: "Roles",
    icon: <Lock />,
    href: "/roles",
    requiredPermission: "manage_roles",
  },
  {
    key: "invitations",
    label: "Invitations",
    icon: <Ticket />,
    href: "/invitations",
    requiredPermission: "manage_invitations",
  }
];


