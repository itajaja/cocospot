import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Profile {
  id: string;
  name: string;
  albumIds: string[];
}

export const ALL_PROFILE_ID = "__all__";

interface ProfileContextValue {
  profiles: Profile[];
  selectedProfileId: string;
  selectProfile: (id: string) => void;
  addProfile: (name: string) => Profile;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  addAlbumToProfile: (profileId: string, albumId: string) => void;
  removeAlbumFromProfile: (profileId: string, albumId: string) => void;
  /** Returns the deduplicated union of albumIds across all regular profiles */
  allAlbumIds: string[];
  /** Whether the selected profile is the ALL profile */
  isAllProfile: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY = "cocospot-profiles";
const SELECTED_KEY = "cocospot-selected-profile";

function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

let nextId = Date.now();
function generateId() {
  return `profile-${nextId++}`;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    () => localStorage.getItem(SELECTED_KEY) || ALL_PROFILE_ID
  );

  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(SELECTED_KEY, selectedProfileId);
  }, [selectedProfileId]);

  const selectProfile = useCallback((id: string) => {
    setSelectedProfileId(id);
  }, []);

  const addProfile = useCallback((name: string): Profile => {
    const profile: Profile = { id: generateId(), name, albumIds: [] };
    setProfiles((prev) => [...prev, profile]);
    return profile;
  }, []);

  const deleteProfile = useCallback((id: string) => {
    if (id === ALL_PROFILE_ID) return;
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setSelectedProfileId((prev) => (prev === id ? ALL_PROFILE_ID : prev));
  }, []);

  const renameProfile = useCallback((id: string, name: string) => {
    if (id === ALL_PROFILE_ID) return;
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }, []);

  const addAlbumToProfile = useCallback((profileId: string, albumId: string) => {
    if (profileId === ALL_PROFILE_ID) return;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId && !p.albumIds.includes(albumId)
          ? { ...p, albumIds: [...p.albumIds, albumId] }
          : p
      )
    );
  }, []);

  const removeAlbumFromProfile = useCallback((profileId: string, albumId: string) => {
    if (profileId === ALL_PROFILE_ID) return;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId
          ? { ...p, albumIds: p.albumIds.filter((a) => a !== albumId) }
          : p
      )
    );
  }, []);

  const allAlbumIds = Array.from(
    new Set(profiles.flatMap((p) => p.albumIds))
  );

  const isAllProfile = selectedProfileId === ALL_PROFILE_ID;

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        selectedProfileId,
        selectProfile,
        addProfile,
        deleteProfile,
        renameProfile,
        addAlbumToProfile,
        removeAlbumFromProfile,
        allAlbumIds,
        isAllProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfiles must be used within ProfileProvider");
  return ctx;
}
