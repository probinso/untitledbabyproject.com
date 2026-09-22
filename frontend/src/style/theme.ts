import { createTheme, Button, Card, TextInput, Textarea } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "Fredoka, system-ui, sans-serif",
  headings: { fontFamily: "Fredoka, system-ui, sans-serif", fontWeight: "700" },
  primaryColor: "pink",
  defaultRadius: "xl",
  components: {
    Button: Button.extend({ defaultProps: { size: "md", radius: "xl" } }),
    Card: Card.extend({ defaultProps: { radius: "xl", padding: "lg" } }),
    TextInput: TextInput.extend({ defaultProps: { radius: "xl", size: "md" } }),
    Textarea: Textarea.extend({ defaultProps: { radius: "lg", size: "md" } }),
  },
});