import NameOverlay from "./NameOverlay";
import ssaLogo from "./ssa-logo.png";

interface Props {
  name: string;
  onDone: () => void;
}

export default function PopularTakeover({ name, onDone }: Props) {
  return (
    <NameOverlay
      image={ssaLogo}
      imageAlt="Social Security Administration"
      title={`Nice try, "${name}."`}
      subtitle="The SSA flagged this as a suspiciously common alias. You can't hide in the data, fugitive."
      background="rgba(255, 77, 109, 0.92)"
      foreground="white"
      imageBackground="white"
      imageRadius="12px"
      imagePadding="12px 20px"
      onDone={onDone}
    />
  );
}
