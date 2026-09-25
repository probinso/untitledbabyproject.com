import { matchPath } from "react-router";
import Home from "./pages/Home";
import BabyNames from "./pages/BabyNames";
import Guestbook from "./pages/Guestbook";
import VideoHome from "./pages/VideoHome";
import Lullabies from "./pages/Lullabies";
import { icons } from "./assets/icons";

export const activities = [
  { path: "/", label: "Home", emoji: icons.home, element: <Home /> },
  { path: "/guestbook", label: "Guestbook", emoji: icons.guestbook, element: <Guestbook /> },
  { path: "/names", label: "Baby Names", emoji: icons.babyNames, element: <BabyNames /> },
  // "/video" is routed separately in App.tsx (it has nested category routes),
  // so this entry's element is unused — it's here only for the nav label/emoji.
  { path: "/video", label: "Video", emoji: icons.video, element: <VideoHome /> },
  { path: "/lullabies", label: "Lulubies", emoji: icons.lullabies, element: <Lullabies /> },
];

// "/" only matches itself; other activities also match their sub-routes
// (e.g. "/video" stays active on "/video/2027") — react-router's own path
// matcher handles that via `end: false`, rather than a hand-rolled
// startsWith check.
export function isActivePath(pathname: string, path: string): boolean {
  return matchPath({ path, end: path === "/" }, pathname) !== null;
}