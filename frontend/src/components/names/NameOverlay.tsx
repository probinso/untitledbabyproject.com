import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Title, Text } from "@mantine/core";
import "./NameOverlay.css";

interface Props {
  image: string;
  imageAlt: string;
  title: ReactNode;
  subtitle: ReactNode;
  background: string;
  foreground: string;
  subtitleForeground?: string;
  imageBackground?: string;
  imageRadius?: string;
  imagePadding?: string;
  onDone: () => void;
}

/**
 * A full-screen takeover for "this baby name is special" moments (popular,
 * presidential, whatever comes next). To add a new one: write a small
 * wrapper component that supplies content + colors here — see
 * PopularTakeover.tsx and PresidentialNote.tsx for examples.
 */
export default function NameOverlay({
  image,
  imageAlt,
  title,
  subtitle,
  background,
  foreground,
  subtitleForeground,
  imageBackground,
  imageRadius,
  imagePadding,
  onDone,
}: Props) {
  // Auto-dismiss, but a tap/click closes it early too.
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  const style = {
    "--no-bg": background,
    "--no-fg": foreground,
    "--no-subtitle-fg": subtitleForeground,
    "--no-image-bg": imageBackground,
    "--no-image-radius": imageRadius,
    "--no-image-padding": imagePadding,
  } as CSSProperties;

  return (
    <div className="no-overlay" style={style} onClick={onDone}>
      <div className="no-content">
        <img src={image} alt={imageAlt} className="no-image" />
        <Title order={2} className="no-title">
          {title}
        </Title>
        <Text className="no-subtitle">{subtitle}</Text>
      </div>
    </div>
  );
}
