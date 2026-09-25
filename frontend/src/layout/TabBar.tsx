import { AppShell, Group, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "react-router";
import { activities, isActivePath } from "../activities";
import { resolveThemed, useColorScheme } from "../assets/themed";
import "./TabBar.css";

export default function TabBar() {
  const { pathname } = useLocation();
  const scheme = useColorScheme();

  return (
    <AppShell.Footer className="tab-bar">
      <Group grow h="100%" gap={0}>
        {activities.map((a) => (
          <UnstyledButton
            key={a.path}
            component={Link}
            to={a.path}
            className="tab"
            data-active={isActivePath(pathname, a.path) || undefined}
          >
            <span className="tab-emoji">{resolveThemed(a.emoji, scheme)}</span>
            <span className="tab-label">{a.label}</span>
          </UnstyledButton>
        ))}
      </Group>
    </AppShell.Footer>
  );
}