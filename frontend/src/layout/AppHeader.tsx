import { AppShell, Group, Title, Text, Button } from "@mantine/core";
import { Link } from "react-router";
import { getIdentityRaw } from "../identity";

export default function AppHeader() {
  const identity = getIdentityRaw();

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Title order={3} style={{ flexShrink: 0 }}>
          🐣 Untitled Baby Project
        </Title>
        {identity && (
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text size="sm" c="dimmed" truncate="end">
              {identity}
            </Text>
            <Button component={Link} to="/login" variant="subtle" size="xs" style={{ flexShrink: 0 }}>
              Change
            </Button>
          </Group>
        )}
      </Group>
    </AppShell.Header>
  );
}
