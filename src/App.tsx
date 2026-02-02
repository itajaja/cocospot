import { Routes, Route } from "react-router-dom";
import AlbumGrid from "./components/AlbumGrid";
import AlbumView from "./components/AlbumView";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Routes>
        <Route path="/" element={<AlbumGrid />} />
        <Route path="/album/:id" element={<AlbumView />} />
      </Routes>
    </div>
  );
}
