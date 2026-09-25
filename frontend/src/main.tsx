import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router";
import "@mantine/core/styles.css";
import "./style/goofy.css";
import { theme } from "./style/theme";
import { ThemeProvider } from "./assets/themed";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* This app's own theming (magic/underwater/forest/...) is layered on
        top of Mantine, not built from Mantine's light/dark color scheme —
        so Mantine itself is locked to light and never switches on its own. */}
    <MantineProvider theme={theme} forceColorScheme="light">
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </MantineProvider>
  </StrictMode>
);