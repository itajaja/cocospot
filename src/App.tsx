import { Route, Routes } from "react-router-dom";
import AlbumGrid from "./components/AlbumGrid";
import AlbumView from "./components/AlbumView";
import Connect from "./components/Connect";
import { useAuth } from "./spotify/AuthProvider";

export default function App() {
  const { status } = useAuth();

  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      {status === "loading" ? (
        <div className="grid min-h-dvh place-items-center text-zinc-600">
          <p className="text-lg font-semibold">Loading&hellip;</p>
        </div>
      ) : status === "logged-in" ? (
        <Routes>
          <Route path="/" element={<AlbumGrid />} />
          <Route path="/album/:id" element={<AlbumView />} />
        </Routes>
      ) : (
        <Connect />
      )}
    </div>
  );
}
