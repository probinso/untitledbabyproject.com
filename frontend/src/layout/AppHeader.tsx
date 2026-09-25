import { AppShell, Group, Title, Text, Button, ActionIcon, Menu } from "@mantine/core";
import { Link } from "react-router";
import { getIdentityRaw } from "../identity";
import { icons } from "../assets/icons";
import { resolveThemed, useThemed, useTheme, useSetTheme, THEME_OPTIONS, type Theme } from "../assets/themed";

function themeLabel(theme: Theme): string {
  return theme ? theme[0].toUpperCase() + theme.slice(1) : "Default";
}

export default function AppHeader() {
  const identity = getIdentityRaw();
  const theme = useTheme();
  const setTheme = useSetTheme();
  const logo = useThemed(icons.logo);

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Title order={3} style={{ flexShrink: 0 }}>
          {logo} Untitled Baby Project
        </Title>
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          {identity && (
            <>
              <Text size="sm" c="dimmed" truncate="end">
                {identity}
              </Text>
              <Button component={Link} to="/login" variant="subtle" size="xs" style={{ flexShrink: 0 }}>
                Change
              </Button>
            </>
          )}
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg" aria-label="Change theme" style={{ flexShrink: 0 }}>
                🎨
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {THEME_OPTIONS.map((option) => (
                <Menu.Item
                  key={option ?? "default"}
                  onClick={() => setTheme(option)}
                  fw={theme === option ? 700 : 400}
                >
                  {resolveThemed(icons.logo, option)} {themeLabel(option)}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
