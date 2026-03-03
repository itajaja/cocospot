import { useState } from "react";
import { useProfiles, ALL_PROFILE_ID } from "../ProfileContext";

export default function ProfileList() {
  const {
    profiles,
    selectedProfileId,
    selectProfile,
    addProfile,
    deleteProfile,
    renameProfile,
  } = useProfiles();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const p = addProfile(name);
    selectProfile(p.id);
    setNewName("");
    setIsAdding(false);
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleFinishEdit = () => {
    if (editingId && editName.trim()) {
      renameProfile(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* ALL profile - styled differently */}
      <button
        onClick={() => selectProfile(ALL_PROFILE_ID)}
        className={`
          relative px-4 py-2 rounded-full font-bold text-sm tracking-wide uppercase transition-all duration-200
          ${
            selectedProfileId === ALL_PROFILE_ID
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105"
              : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:from-purple-500/40 hover:to-pink-500/40"
          }
        `}
      >
        ALL
      </button>

      {/* Regular profiles */}
      {profiles.map((profile) => (
        <div key={profile.id} className="relative flex items-center group">
          {editingId === profile.id ? (
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleFinishEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFinishEdit();
                if (e.key === "Escape") {
                  setEditingId(null);
                  setEditName("");
                }
              }}
              className="px-3 py-1.5 rounded-full text-sm bg-zinc-700 text-white border border-zinc-500 outline-none focus:border-purple-400 w-28"
            />
          ) : (
            <button
              onClick={() => selectProfile(profile.id)}
              onDoubleClick={() => handleStartEdit(profile.id, profile.name)}
              className={`
                px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200
                ${
                  selectedProfileId === profile.id
                    ? "bg-zinc-100 text-zinc-900 shadow-md scale-105"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }
              `}
            >
              {profile.name}
            </button>
          )}

          {/* Delete button - visible on hover, not while editing */}
          {editingId !== profile.id && (
            <>
              {confirmDeleteId === profile.id ? (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 shadow-xl z-10">
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="text-xs text-red-400 font-semibold hover:text-red-300 px-1"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 px-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(profile.id)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-700 text-zinc-400 hover:bg-red-500 hover:text-white text-xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete profile"
                >
                  &times;
                </button>
              )}
            </>
          )}
        </div>
      ))}

      {/* Add profile button */}
      {isAdding ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewName("");
              }
            }}
            placeholder="Profile name"
            className="px-3 py-1.5 rounded-full text-sm bg-zinc-800 text-white border border-zinc-600 outline-none focus:border-purple-400 placeholder-zinc-500 w-32"
          />
          <button
            onClick={handleAdd}
            className="px-2 py-1.5 rounded-full text-sm bg-green-600 text-white hover:bg-green-500 font-semibold"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center justify-center text-lg transition-colors"
          title="Add profile"
        >
          +
        </button>
      )}
    </div>
  );
}
