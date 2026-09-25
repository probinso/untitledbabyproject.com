import { Title } from "@mantine/core";
import { icons } from "../assets/icons";
import { useThemed } from "../assets/themed";

export default function NotFound() {
  const peekaboo = useThemed(icons.peekaboo);

  return <Title>{peekaboo} Nothing here!</Title>;
}
