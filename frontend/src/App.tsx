import { Routes, Route } from "react-router";
import { Title } from "@mantine/core";
import AppLayout from "./layout/AppLayout";
import { activities } from "./activities";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {activities.map((a) => (
          <Route key={a.path} path={a.path} element={a.element} />
        ))}
        <Route path="*" element={<Title>🙈 Nothing here!</Title>} />
      </Route>
    </Routes>
  );
}