import { useEffect, useRef, useState } from "react";
import { Title, Stack, Card, Button } from "@mantine/core";
import Form from "@rjsf/mantine";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { getIdentityToken } from "../identity";
import { apiGet, apiPost } from "../api";
import { readStorage, writeStorage } from "../storage";
import { useSubmitOnLeave } from "../useSubmitOnLeave";
import { isComplete } from "../rjsfComplete";

const STORAGE_KEY = "guestbook-draft";

interface GuestbookEntry {
  name: string;
  message: string;
}

interface StoredGuestbookEntry extends GuestbookEntry {
  token: string;
}

const schema: RJSFSchema = {
  type: "object",
  required: ["name", "message"],
  properties: {
    name: { type: "string", title: "Name" },
    message: { type: "string", title: "Message" },
  },
};

const uiSchema: UiSchema = {
  message: { "ui:widget": "textarea" },
};

function loadDraft(): GuestbookEntry | undefined {
  return readStorage<GuestbookEntry>(STORAGE_KEY);
}

function fetchEntry(token: string): Promise<StoredGuestbookEntry | null> {
  return apiGet<StoredGuestbookEntry | null>("/guestbook", { token });
}

export default function Guestbook() {
  const [formData, setFormData] = useState<GuestbookEntry | undefined>(loadDraft);
  // Typed as `any`: we only ever call .submit(), and @rjsf/mantine's Form
  // export doesn't cleanly expose its underlying @rjsf/core class type for
  // TypeScript to match a ref against.
  const formRef = useRef<any>(null);

  // Switching to another activity submits this one first, but only if it's
  // actually complete — the form's own submit() still skips onSubmit
  // otherwise, this just avoids intercepting navigation for nothing.
  useSubmitOnLeave(isComplete(schema, formData), () => formRef.current?.submit());

  // Pull in whatever was last submitted under this identity, in case it
  // came from another browser/device. AppLayout guarantees we're logged in.
  useEffect(() => {
    const token = getIdentityToken();
    if (!token) return;
    fetchEntry(token).then((entry) => {
      if (entry) setFormData({ name: entry.name, message: entry.message });
    });
  }, []);

  function handleChange({ formData }: { formData?: GuestbookEntry }) {
    setFormData(formData);
    writeStorage(STORAGE_KEY, formData);
  }

  async function handleSubmit({ formData }: { formData?: GuestbookEntry }) {
    if (!formData || !getIdentityToken()) return;
    await apiPost("/guestbook", formData);
  }

  return (
    <Stack>
      <Title>📝 Guestbook</Title>

      <Card maw={480}>
        <Form
          ref={formRef}
          schema={schema}
          uiSchema={uiSchema}
          validator={validator}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
        >
          <Button type="submit">Sign it 🖊️</Button>
        </Form>
      </Card>
    </Stack>
  );
}
