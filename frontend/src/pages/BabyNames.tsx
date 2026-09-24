import { useEffect, useState } from "react";
import { Card, Title, Text, Stack, Button, List } from "@mantine/core";
import Form from "@rjsf/mantine";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema } from "@rjsf/utils";
import { getIdentityToken } from "../identity";
import { apiPost, apiUrl } from "../api";
import { popularNames } from "../components/names/PopularityList";
import PopularTakeover from "../components/names/PopularTakeover";
import { presidentialNames } from "../components/names/PresidentialNames";
import PresidentialNote from "../components/names/PresidentialNote";
import { containsBlockedWord } from "../components/names/blockedWords";

interface NameTally {
  name: string;
  count: number;
}

const schema: RJSFSchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", title: "Baby name" },
  },
};

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

export default function BabyNames() {
  const [names, setNames] = useState<NameTally[]>([]);
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const [presidential, setPresidential] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  // Subscribes to live tallies: the backend pushes the full list whenever
  // anyone (including us) submits a name, so this stays in sync across tabs.
  useEffect(() => {
    const source = new EventSource(apiUrl("/names/stream"));
    source.onmessage = (event) => setNames(JSON.parse(event.data));
    return () => source.close();
  }, []);

  async function handleSubmit({ formData }: { formData?: { name?: string } }) {
    const name = formData?.name ? normalize(formData.name) : "";
    if (!name || !getIdentityToken()) return;

    if (containsBlockedWord(name)) {
      setBlocked(true);
      return;
    }
    setBlocked(false);

    // Presidential names are blocked too — the note doubles as the
    // rejection message, so nothing gets submitted.
    if (presidentialNames.has(name)) {
      setPresidential(name);
      return;
    }

    await apiPost("/names", { name });
    if (popularNames.has(name)) setCelebrating(name);
  }

  return (
    <Stack maw={480}>
      <Card>
        <Stack>
          <Title order={2}>Oh NoOOo! We forgot kiddos name!</Title>
          <Text c="dimmed">Help us remember by sharing your favorites!</Text>
          <Form schema={schema} validator={validator} onSubmit={handleSubmit}>
            <Button type="submit">Out with the Bath Water</Button>
          </Form>
          {blocked && <Text c="red">Let's keep it family-friendly — try another name.</Text>}
        </Stack>
      </Card>

      <List>
        {names.map((entry) => (
          <List.Item key={entry.name}>
            {entry.name}
            {entry.count > 1 ? ` (${entry.count})` : ""}
          </List.Item>
        ))}
      </List>

      {presidential && (
        <PresidentialNote name={presidential} onDone={() => setPresidential(null)} />
      )}
      {celebrating && (
        <PopularTakeover name={celebrating} onDone={() => setCelebrating(null)} />
      )}
    </Stack>
  );
}
