import Home from "./pages/Home";
import BabyNames from "./pages/BabyNames";
import Guestbook from "./pages/Guestbook";
import VideoDrop from "./pages/VideoDrop";

export const activities = [
  { path: "/", label: "Home", emoji: "🏠", element: <Home /> },
  { path: "/guestbook", label: "Guestbook", emoji: "📝", element: <Guestbook /> },
  { path: "/names", label: "Baby Names", emoji: "🍼", element: <BabyNames /> },
  { path: "/video", label: "Video", emoji: "🎥", element: <VideoDrop /> },
];