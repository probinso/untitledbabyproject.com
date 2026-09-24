import Home from "./pages/Home";
import BabyNames from "./pages/BabyNames";
import Guestbook from "./pages/Guestbook";
import VideoHome from "./pages/VideoHome";

export const activities = [
  { path: "/", label: "Home", emoji: "🏠", element: <Home /> },
  { path: "/guestbook", label: "Guestbook", emoji: "📝", element: <Guestbook /> },
  { path: "/names", label: "Baby Names", emoji: "🍼", element: <BabyNames /> },
  // "/video" is routed separately in App.tsx (it has nested category routes),
  // so this entry's element is unused — it's here only for the nav label/emoji.
  { path: "/video", label: "Video", emoji: "🎥", element: <VideoHome /> },
];

// "/" only matches itself; other activities also match their sub-routes
// (e.g. "/video" stays active on "/video/2027").
export function isActivePath(pathname: string, path: string): boolean {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}