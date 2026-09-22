import { AppShell } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import SidebarNav from "./SidebarNav";
import TabBar from "./TabBar";

export default function AppLayout() {
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: true } }}
      footer={{ height: 76, collapsed: !isMobile }}
      padding="lg"
    >
      <AppHeader />
      <SidebarNav />
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <TabBar />
    </AppShell>
  );
}