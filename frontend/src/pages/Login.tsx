import { Center, Card, Stack, Title, Button } from "@mantine/core";
import { useNavigate } from "react-router";
import Form from "@rjsf/mantine";
import validator from "@rjsf/validator-ajv8";
import type { IChangeEvent } from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import { getIdentityRaw, setIdentity } from "../identity";
import { icons } from "../assets/icons";
import { useThemed } from "../assets/themed";

interface LoginForm {
  identity?: string;
}

const schema: RJSFSchema = {
  type: "object",
  required: ["identity"],
  properties: {
    identity: {
      type: "string",
      title: "Email (or a memorable phrase)",
      description:
        "We don't save this text itself — it's only used to recognize you again next time, even on a different device.",
    },
  },
};

export default function Login() {
  const navigate = useNavigate();
  const identity = getIdentityRaw();
  const logo = useThemed(icons.logo);

  function handleSubmit({ formData }: IChangeEvent<LoginForm>) {
    if (!formData?.identity) return;
    setIdentity(formData.identity);
    navigate("/");
  }

  return (
    <Center h="100vh">
      <Card maw={420} w="100%">
        <Stack>
          <Title order={2}>{logo} Untitled Baby Project</Title>
          <Form
            schema={schema}
            validator={validator}
            formData={identity ? { identity } : undefined}
            onSubmit={handleSubmit}
          >
            <Button type="submit" fullWidth>
              Continue
            </Button>
          </Form>
        </Stack>
      </Card>
    </Center>
  );
}
