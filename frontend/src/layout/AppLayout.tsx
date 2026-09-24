import { AppShell } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Navigate, Outlet } from "react-router";
import AppHeader from "./AppHeader";
import SidebarNav from "./SidebarNav";
import TabBar from "./TabBar";
import { getIdentityRaw } from "../identity";

export default function AppLayout() {
  const isMobile = useMediaQuery("(max-width: 48em)");

  // Pure routing guard, not a backend call — the raw check is fine here.
  if (!getIdentityRaw()) return <Navigate to="/login" replace />;

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