import { AppShell, Group, Title, Text, Button, ActionIcon, useMantineColorScheme } from "@mantine/core";
import { Link } from "react-router";
import { getIdentityRaw } from "../identity";
import { icons } from "../assets/icons";
import { useThemed } from "../assets/themed";

export default function AppHeader() {
  const identity = getIdentityRaw();
  const { toggleColorScheme } = useMantineColorScheme();
  const logo = useThemed(icons.logo);
  const themeToggleIcon = useThemed(icons.themeToggle);

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
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={toggleColorScheme}
            aria-label="Toggle dark mode"
            style={{ flexShrink: 0 }}
          >
            {themeToggleIcon}
          </ActionIcon>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
