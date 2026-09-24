import { useEffect } from "react";
import { Title, Text } from "@mantine/core";
import presidentialPortrait from "./presidential-portrait.png";
import "./PresidentialNote.css";

interface Props {
  name: string;
  onDone: () => void;
}

export default function PresidentialNote({ name, onDone }: Props) {
  // Auto-dismiss, but a tap/click closes it early too.
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="pn-overlay" onClick={onDone}>
      <div className="pn-content">
        <img src={presidentialPortrait} alt="Presidential inauguration" className="pn-image" />
        <Title order={2} className="pn-title">
          "{name}" has presidential energy... lets try again...
        </Title>
        <Text className="pn-subtitle">No president is as impressive as our kiddo.</Text>
      </div>
    </div>
  );
}
