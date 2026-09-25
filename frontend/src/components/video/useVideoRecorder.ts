import { useEffect, useRef, useState } from "react";
import { useInterval } from "@mantine/hooks";

export type RecorderStatus =
  | "idle" // camera off, waiting to start
  | "requesting" // browser is asking for camera permission
  | "preview" // live camera, not recording yet
  | "countdown" // 3-2-1 before recording
  | "recording"
  | "review" // watching the recording back
  | "submitting"
  | "done" // sent; video discarded
  | "error"; // camera couldn't start

type FacingMode = "user" | "environment";

interface Options {
  maxSeconds: number;
  countdownSeconds: number;
  videoBitsPerSecond?: number;
}

// Formats to try, best first. Safari records MP4; Chrome and Firefox usually WebM.
const MIME_CANDIDATES = [
  "video/mp4;codecs=avc1,mp4a",
  "video/mp4",
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

function pickMimeType(): string | undefined {
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

function describeCameraError(err: unknown): string {
  const name = err instanceof DOMException ? err.name : "";
  switch (name) {
    case "NotAllowedError":
      return "Camera access was blocked. Allow the camera in your browser's site settings, then try again.";
    case "NotFoundError":
      return "No camera was found on this device.";
    case "NotReadableError":
      return "Your camera is being used by another app. Close that app, then try again.";
    default:
      return "The camera couldn't start. Try again, or try a different browser.";
  }
}

export function useVideoRecorder({
  maxSeconds,
  countdownSeconds,
  videoBitsPerSecond = 2_500_000,
}: Options) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(maxSeconds);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [canFlip, setCanFlip] = useState(false);

  // Refs hold things that change without needing a re-render.
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<Blob | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const recordingStartedAtRef = useRef(0);

  // The 3-2-1 before recording, and the elapsed-time tracker while
  // recording, are two distinct timers — each gets its own interval rather
  // than sharing one hand-managed window.setInterval handle.
  const countdownTimer = useInterval(() => {
    // Reads `countdown` from the closure rather than a setState updater —
    // beginRecording() has side effects (starts another timer, calls other
    // setters), and those don't belong inside a state updater function.
    if (countdown <= 1) {
      countdownTimer.stop();
      beginRecording();
    } else {
      setCountdown(countdown - 1);
    }
  }, 1000);

  const recordingTimer = useInterval(() => {
    const elapsed = (Date.now() - recordingStartedAtRef.current) / 1000;
    setSecondsLeft(Math.max(0, Math.ceil(maxSeconds - elapsed)));
    if (elapsed >= maxSeconds) stopRecording();
  }, 250);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }

  function discardVideo() {
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = null;
    videoRef.current = null;
    setVideoUrl(null);
  }

  // Drops a previously-recorded video straight into review, bypassing the camera.
  function loadVideo(blob: Blob) {
    discardVideo();
    videoRef.current = blob;
    const url = URL.createObjectURL(blob);
    videoUrlRef.current = url;
    setVideoUrl(url);
    setStatus("review");
  }

  async function startCamera(facing: FacingMode = facingMode) {
    setError(null);

    // mediaDevices is missing on insecure (plain http) pages other than localhost.
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Recording needs a secure (https) connection and a modern browser.");
      setStatus("error");
      return;
    }

    setStatus("requesting");
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      stopCamera();
      streamRef.current = newStream;
      setStream(newStream);

      // Device labels and counts are only reliable after permission is granted.
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCanFlip(devices.filter((d) => d.kind === "videoinput").length > 1);

      setStatus("preview");
    } catch (err) {
      stopCamera();
      setError(describeCameraError(err));
      setStatus("error");
    }
  }

  function flipCamera() {
    const next: FacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    void startCamera(next);
  }

  function beginRecording() {
    const currentStream = streamRef.current;
    if (!currentStream) return;

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(currentStream, { mimeType, videoBitsPerSecond });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const type = recorder.mimeType || mimeType || "video/webm";
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];
      videoRef.current = blob;
      const url = URL.createObjectURL(blob);
      videoUrlRef.current = url;
      setVideoUrl(url);
      stopCamera(); // camera light off while they watch it back
      setStatus("review");
    };

    recorder.start(1000); // hand over data every second
    setStatus("recording");
    setSecondsLeft(maxSeconds);
    recordingStartedAtRef.current = Date.now();
    recordingTimer.start();
  }

  function startRecording() {
    if (countdownSeconds <= 0) {
      beginRecording();
      return;
    }
    setCountdown(countdownSeconds);
    setStatus("countdown");
    countdownTimer.start();
  }

  function stopRecording() {
    recordingTimer.stop();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  function cancel() {
    countdownTimer.stop();
    recordingTimer.stop();
    stopCamera();
    setStatus("idle");
  }

  function retake() {
    setSubmitError(null);
    discardVideo();
    void startCamera();
  }

  async function submit(onSubmit: (video: Blob) => Promise<void>) {
    const video = videoRef.current;
    if (!video) return;
    setSubmitError(null);
    setStatus("submitting");
    try {
      await onSubmit(video);
      discardVideo();
      setStatus("done");
    } catch {
      // Keep the video so they can try again.
      setSubmitError("The video didn't send. Check your connection and try again.");
      setStatus("review");
    }
  }

  function reset() {
    setError(null);
    setSubmitError(null);
    setStatus("idle");
  }

  // Clean up if the component disappears (e.g. switching activities).
  useEffect(() => {
    return () => {
      countdownTimer.stop();
      recordingTimer.stop();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, []);

  return {
    status,
    error,
    submitError,
    stream,
    videoUrl,
    countdown,
    secondsLeft,
    facingMode,
    canFlip,
    startCamera,
    flipCamera,
    startRecording,
    stopRecording,
    cancel,
    retake,
    submit,
    reset,
    loadVideo,
  };
}
