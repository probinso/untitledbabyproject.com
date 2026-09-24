import { Routes, Route } from "react-router";
import { Title } from "@mantine/core";
import AppLayout from "./layout/AppLayout";
import Login from "./pages/Login";
import VideoHome from "./pages/VideoHome";
import VideoCategory from "./pages/VideoCategory";
import VideoLayout from "./components/video/VideoLayout";
import { activities } from "./activities";
import { videoPrompts } from "./components/video/videoPrompts";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        {activities
          .filter((a) => a.path !== "/video")
          .map((a) => (
            <Route key={a.path} path={a.path} element={a.element} />
          ))}
        <Route path="/video" element={<VideoLayout />}>
          <Route index element={<VideoHome />} />
          {videoPrompts.map((p) => (
            <Route key={p.path} path={p.path} element={<VideoCategory prompt={p} />} />
          ))}
        </Route>
        <Route path="*" element={<Title>🙈 Nothing here!</Title>} />
      </Route>
    </Routes>
  );
}