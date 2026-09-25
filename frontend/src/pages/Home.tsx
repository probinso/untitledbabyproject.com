import { Title, Text } from "@mantine/core";
import { icons } from "../assets/icons";
import { useThemed } from "../assets/themed";

export default function Home() {
  const wave = useThemed(icons.wave);

  return (
    <>
      <Title>{wave} Welcome!</Title>
      <Text>Pick an activity from the menu.</Text>
    </>
  );
}
