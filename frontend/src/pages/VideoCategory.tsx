import { useEffect, useState } from "react";
import { Text, Stack, Loader } from "@mantine/core";
import VideoRecorder from "../components/video/VideoRecorder";
import type { VideoPrompt } from "../components/video/videoPrompts";
import { apiGet, apiPostForm, apiUrl } from "../api";
import { getIdentityToken } from "../identity";
import { sha256Hex } from "../digest";

interface Props {
  prompt: VideoPrompt;
}

interface VideoEntry {
  digest: string;
}

async function fetchExistingVideo(category: string): Promise<Blob | undefined> {
  if (!getIdentityToken()) return undefined;
  const entry = await apiGet<VideoEntry | null>("/videos", { category });
  if (!entry) return undefined;
  const res = await fetch(apiUrl(`/videos/blob/${entry.digest}`));
  return res.blob();
}

export default function VideoCategory({ prompt }: Props) {
  const [initialVideo, setInitialVideo] = useState<Blob | undefined>();
  const [loaded, setLoaded] = useState(false);

  // Each category is its own route/mount, so this runs fresh per prompt.
  useEffect(() => {
    let cancelled = false;
    fetchExistingVideo(prompt.path)
      .then((video) => {
        if (!cancelled) setInitialVideo(video);
      })
      .catch(() => {
        // Couldn't check for an existing video (e.g. backend unreachable) — just start fresh.
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [prompt.path]);

  async function uploadVideo(video: Blob) {
    const digest = await sha256Hex(video);
    const formData = new FormData();
    formData.set("category", prompt.path);
    formData.set("digest", digest);
    formData.set("video", video, "recording.webm");
    await apiPostForm("/videos", formData);
  }

  return (
    <Stack>
      <Text c="dimmed">{prompt.prompt}</Text>
      {loaded ? (
        <VideoRecorder
          maxSeconds={30}
          countdownSeconds={3}
          initialVideo={initialVideo}
          onSubmit={uploadVideo}
        />
      ) : (
        <Loader color="pink" />
      )}
    </Stack>
  );
}
