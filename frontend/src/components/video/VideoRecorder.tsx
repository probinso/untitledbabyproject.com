import { useEffect, useRef } from "react";
import { Alert, Button, Group, Loader, Progress, Stack, Text, Title } from "@mantine/core";
import { useVideoRecorder } from "./useVideoRecorder";
import { useSubmitOnLeave } from "../../useSubmitOnLeave";
import { icons } from "../../assets/icons";
import { resolveThemed, useColorScheme } from "../../assets/themed";
import "./VideoRecorder.css";

interface VideoRecorderProps {
  maxSeconds?: number;
  countdownSeconds?: number;
  initialVideo?: Blob;
  onSubmit: (video: Blob) => Promise<void>;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoRecorder({
  maxSeconds = 30,
  countdownSeconds = 3,
  initialVideo,
  onSubmit,
}: VideoRecorderProps) {
  const rec = useVideoRecorder({ maxSeconds, countdownSeconds });
  const liveRef = useRef<HTMLVideoElement>(null);
  const scheme = useColorScheme();
  const icon = (name: keyof typeof icons) => resolveThemed(icons[name], scheme);

  const isLive = ["preview", "countdown", "recording"].includes(rec.status);
  const isReview = rec.status === "review" || rec.status === "submitting";

  // Switching to another activity/category sends a finished-but-unsent
  // recording first, so a completed take is never silently lost.
  useSubmitOnLeave(rec.status === "review", () => rec.submit(onSubmit));

  // Show whatever was already recorded for this prompt, if anything.
  useEffect(() => {
    if (initialVideo) rec.loadVideo(initialVideo);
  }, [initialVideo]);

  // Connect the camera stream to the live preview.
  useEffect(() => {
    const el = liveRef.current;
    if (el && el.srcObject !== rec.stream) el.srcObject = rec.stream;
  }, [rec.stream, isLive]);

  return (
    <Stack maw={640} gap="md">
      <div className="vr-frame">
        {rec.status === "idle" && (
          <div className="vr-placeholder">
            <span className="vr-placeholder-emoji">{icon("clapperboard")}</span>
            <Button size="lg" onClick={() => rec.startCamera()}>
              Start camera
            </Button>
          </div>
        )}

        {rec.status === "requesting" && (
          <div className="vr-placeholder">
            <Loader color="pink" />
            <Text c="white">Waiting for camera permission…</Text>
          </div>
        )}

        {isLive && (
          <video
            ref={liveRef}
            className={`vr-video ${rec.facingMode === "user" ? "vr-mirror" : ""}`}
            autoPlay
            muted // avoid hearing yourself echo
            playsInline // stops iPhones from going fullscreen
          />
        )}

        {rec.status === "countdown" && (
          <div className="vr-countdown" key={rec.countdown}>
            {rec.countdown}
          </div>
        )}

        {rec.status === "recording" && (
          <div className="vr-rec-badge">● {formatTime(rec.secondsLeft)}</div>
        )}

        {isReview && rec.videoUrl && (
          <video className="vr-video" src={rec.videoUrl} controls playsInline />
        )}

        {rec.status === "done" && (
          <div className="vr-placeholder">
            <span className="vr-placeholder-emoji vr-bounce">{icon("confetti")}</span>
            <Title order={3} c="white">
              Video sent!
            </Title>
          </div>
        )}

        {rec.status === "error" && (
          <div className="vr-placeholder">
            <span className="vr-placeholder-emoji">{icon("peekaboo")}</span>
          </div>
        )}
      </div>

      {rec.status === "recording" && (
        <Progress
          value={(rec.secondsLeft / maxSeconds) * 100}
          color="red"
          size="lg"
          radius="xl"
          transitionDuration={250}
        />
      )}

      {rec.status === "error" && rec.error && (
        <Alert color="red" radius="lg" title="Camera problem">
          {rec.error}
        </Alert>
      )}

      {rec.submitError && (
        <Alert color="red" radius="lg" title="Not sent">
          {rec.submitError}
        </Alert>
      )}

      <Group justify="center">
        {rec.status === "preview" && (
          <>
            <Button color="red" size="lg" onClick={rec.startRecording}>
              {icon("record")} Record
            </Button>
            {rec.canFlip && (
              <Button variant="light" size="lg" onClick={rec.flipCamera}>
                {icon("flip")} Flip
              </Button>
            )}
            <Button variant="subtle" color="gray" size="lg" onClick={rec.cancel}>
              Turn off camera
            </Button>
          </>
        )}

        {rec.status === "recording" && (
          <Button color="dark" size="lg" onClick={rec.stopRecording}>
            {icon("stop")} Stop
          </Button>
        )}

        {isReview && (
          <>
            <Button
              variant="light"
              size="lg"
              onClick={rec.retake}
              disabled={rec.status === "submitting"}
            >
              {icon("retake")} Retake
            </Button>
            <Button
              size="lg"
              onClick={() => rec.submit(onSubmit)}
              loading={rec.status === "submitting"}
            >
              {icon("rocket")} Send video
            </Button>
          </>
        )}

        {rec.status === "done" && (
          <Button size="lg" onClick={rec.reset}>
            {icon("clapperboard")} Record another
          </Button>
        )}

        {rec.status === "error" && (
          <Button size="lg" onClick={() => rec.startCamera()}>
            Try again
          </Button>
        )}
      </Group>

      {rec.status === "preview" && (
        <Text size="sm" c="dimmed" ta="center">
          Up to {maxSeconds} seconds.
          {countdownSeconds > 0 && ` Recording starts after a ${countdownSeconds}-second countdown.`}
        </Text>
      )}
    </Stack>
  );
}
