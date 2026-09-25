import NameOverlay from "./NameOverlay";
import { images } from "../../assets/images";
import { useThemed } from "../../assets/themed";

interface Props {
  name: string;
  onDone: () => void;
}

export default function PresidentialNote({ name, onDone }: Props) {
  const portrait = useThemed(images.presidentialPortrait);

  return (
    <NameOverlay
      image={portrait}
      imageAlt="Presidential inauguration"
      title={`"${name}" has presidential energy... lets try again...`}
      subtitle="No president is as impressive as our kiddo."
      background="rgba(30, 27, 20, 0.92)"
      foreground="#f5e9d0"
      subtitleForeground="#d8c9a3"
      onDone={onDone}
    />
  );
}
