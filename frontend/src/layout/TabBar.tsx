import { AppShell, Group, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "react-router";
import { activities, isActivePath } from "../activities";
import "./TabBar.css";

export default function TabBar() {
  const { pathname } = useLocation();

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
            <span className="tab-emoji">{a.emoji}</span>
            <span className="tab-label">{a.label}</span>
          </UnstyledButton>
        ))}
      </Group>
    </AppShell.Footer>
  );
}