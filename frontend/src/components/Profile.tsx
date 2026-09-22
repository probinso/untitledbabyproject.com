import { useEffect, useRef } from "react";
import { Alert, Button, Group, Loader, Progress, Stack, Text, Title } from "@mantine/core";
import { useVideoRecorder } from "../hooks/useVideoRecorder";
import "./VideoRecorder.css";

interface VideoRecorderProps {
  maxSeconds?: number;
  countdownSeconds?: number;
  onSubmit: (video: Blob) => Promise<void>;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ProfileForm({
  maxSeconds = 30,
  countdownSeconds = 3,
  onSubmit,
}: VideoRecorderProps) {
  const rec = useVideoRecorder({ maxSeconds, countdownSeconds });
  const liveRef = useRef<HTMLVideoElement>(null);

  const isLive = ["preview", "countdown", "recording"].includes(rec.status);
  const isReview = rec.status === "review" || rec.status === "submitting";
}