import { Card, Title, Text, TextInput, Button, Stack } from "@mantine/core";

export default function BabyNames() {
  return (
    <Card maw={480}>
      <Stack>
        <Title order={2}>🍼dd sssBaby Name Bonanza</Title>
        <Text c="dimmed">Throw a name into the ring!</Text>
        <TextInput label="Baby name" placeholder="e.g. Juniper" />
        <Button>Yeet it in ✨</Button>
      </Stack>
    </Card>
  );
}