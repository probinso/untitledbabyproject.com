import { Title, Text, Stack, Select } from "@mantine/core";
import { Outlet, useLocation, useNavigate } from "react-router";
import { videoPrompts, videoPromptHref } from "./videoPrompts";
import { icons } from "../../assets/icons";
import { useThemed } from "../../assets/themed";

export default function VideoLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const video = useThemed(icons.video);

  const current = videoPrompts.find((p) => pathname === videoPromptHref(p.path))?.path ?? null;

  return (
    <Stack>
      <Title>{video} Video Drop</Title>
      <Text>Pick a prompt and record a quick video for the family!</Text>

      <Select
        maw={320}
        placeholder="Choose a prompt"
        data={videoPrompts.map((p) => ({ value: p.path, label: p.label }))}
        value={current}
        onChange={(value) => value && navigate(videoPromptHref(value))}
      />

      <Outlet />
    </Stack>
  );
}
