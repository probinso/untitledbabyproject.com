import { useEffect, useRef, useState } from "react";
import { Card, Title, Text, Stack, Button, List } from "@mantine/core";
import Form from "@rjsf/mantine";
import validator from "@rjsf/validator-ajv8";
import type { IChangeEvent } from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import { getIdentityToken } from "../identity";
import { apiPost, apiUrl } from "../api";
import { popularNames } from "../components/names/popularNames";
import PopularTakeover from "../components/names/PopularTakeover";
import { presidentialNames } from "../components/names/presidentialNames";
import PresidentialNote from "../components/names/PresidentialNote";
import { containsBlockedWord } from "../components/names/blockedWords";
import { useSubmitOnLeave } from "../useSubmitOnLeave";
import { isComplete, type RjsfFormInstance } from "../rjsf";

interface NameTally {
  name: string;
  count: number;
}

interface NameForm {
  name?: string;
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
  const [formData, setFormData] = useState<NameForm>();
  const [names, setNames] = useState<NameTally[]>([]);
  const [celebrating, setCelebrating] = useState<string | null>(null);
  const [presidential, setPresidential] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const formRef = useRef<RjsfFormInstance>(null);

  // Switching to another activity submits this one first, but only if
  // there's actually a name typed — the form's own submit() still no-ops
  // if it's invalid, this just avoids intercepting navigation for nothing.
  useSubmitOnLeave(isComplete(validator, schema, formData), () => formRef.current?.submit());

  // Subscribes to live tallies: the backend pushes the full list whenever
  // anyone (including us) submits a name, so this stays in sync across tabs.
  useEffect(() => {
    const source = new EventSource(apiUrl("/names/stream"));
    source.onmessage = (event) => setNames(JSON.parse(event.data));
    return () => source.close();
  }, []);

  async function handleSubmit({ formData }: IChangeEvent<NameForm>) {
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
          <Form
            ref={formRef}
            schema={schema}
            validator={validator}
            formData={formData}
            onChange={({ formData }: IChangeEvent<NameForm>) => setFormData(formData)}
            onSubmit={handleSubmit}
          >
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
