import { AppShell, Group, Title } from "@mantine/core";

export default function AppHeader() {
  return (
    <AppShell.Header>
      <Group h="100%" px="md">
        <Title order={3}>🐣 Untitled Baby Project</Title>
      </Group>
    </AppShell.Header>
  );
}