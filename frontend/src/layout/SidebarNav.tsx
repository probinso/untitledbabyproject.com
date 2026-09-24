import { AppShell, NavLink } from "@mantine/core";
import { Link, useLocation } from "react-router";
import { activities, isActivePath } from "../activities";

export default function SidebarNav() {
  const { pathname } = useLocation();

  return (
    <AppShell.Navbar p="md">
      {activities.map((a) => (
        <NavLink
          key={a.path}
          component={Link}
          to={a.path}
          label={a.label}
          leftSection={<span>{a.emoji}</span>}
          active={isActivePath(pathname, a.path)}
        />
      ))}
    </AppShell.Navbar>
  );
}