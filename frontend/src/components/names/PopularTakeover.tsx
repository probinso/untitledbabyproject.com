import { useEffect } from "react";
import { Title, Text } from "@mantine/core";
import ssaLogo from "./ssa-logo.png";
import "./PopularTakeover.css";

interface Props {
  name: string;
  onDone: () => void;
}

export default function PopularTakeover({ name, onDone }: Props) {
  // Auto-dismiss, but a tap/click closes it early too.
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="pt-overlay" onClick={onDone}>
      <div className="pt-content">
        <img src={ssaLogo} alt="Social Security Administration" className="pt-logo" />
        <Title order={1} className="pt-title">
          Nice try, "{name}."
        </Title>
        <Text className="pt-subtitle">
          The SSA flagged this as a suspiciously common alias. You can't hide in the data, fugitive.
        </Text>
      </div>
    </div>
  );
}
