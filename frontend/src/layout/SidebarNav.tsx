import { AppShell, NavLink } from "@mantine/core";
import { Link, useLocation } from "react-router";
import { activities, isActivePath } from "../activities";
import { resolveThemed, useColorScheme } from "../assets/themed";

export default function SidebarNav() {
  const { pathname } = useLocation();
  const scheme = useColorScheme();

  return (
    <AppShell.Navbar p="md">
      {activities.map((a) => (
        <NavLink
          key={a.path}
          component={Link}
          to={a.path}
          label={a.label}
          leftSection={<span>{resolveThemed(a.emoji, scheme)}</span>}
          active={isActivePath(pathname, a.path)}
        />
      ))}
    </AppShell.Navbar>
  );
}