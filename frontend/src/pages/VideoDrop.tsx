import { Title, Text, Stack } from "@mantine/core";
import VideoRecorder from "../components/VideoRecorder";

// Pretend upload until the backend exists.
async function fakeUpload(video: Blob) {
  console.log(`Would upload ${(video.size / 1_000_000).toFixed(1)} MB of ${video.type}`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

export default function VideoDrop() {
  return (
    <Stack>
      <Title>🎥 Video Drop</Title>
      <Text>Record a quick hello for the family!</Text>
      <VideoRecorder maxSeconds={30} countdownSeconds={3} onSubmit={fakeUpload} />
    </Stack>
  );
}
