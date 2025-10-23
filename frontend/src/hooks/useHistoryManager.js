import { useCallback, useEffect, useMemo, useState } from "react";
import { createHistoryId } from "../utils/wizard";

const HISTORY_STORAGE_KEY = "exteriorHistory";

const loadHistoryFromStorage = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Không thể đọc lịch sử từ localStorage:", error);
    return [];
  }
};

function useHistoryManager(user) {
  const [history, setHistory] = useState(loadHistoryFromStorage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn("Không thể lưu lịch sử vào localStorage:", error);
    }
  }, [history]);

  const saveHistory = useCallback(
    (wizardSnapshot, notes) => {
      if (!wizardSnapshot) return;
      const entry = {
        id: createHistoryId(),
        createdAt: new Date().toISOString(),
        createdBy: user?.email ?? "unknown",
        createdByName: user?.name ?? "Người dùng",
        style: wizardSnapshot.requirements?.style,
        colorPalette: wizardSnapshot.requirements?.colorPalette,
        decorItems: wizardSnapshot.requirements?.decorItems,
        aiSuggestions: wizardSnapshot.requirements?.aiSuggestions,
        notes,
        status: "pending",
        outputImageUrl: wizardSnapshot.result?.outputImageUrl ?? "",
        sampleImageDataUrl: wizardSnapshot.sampleImage?.dataUrl || "",
        sampleImageName:
          wizardSnapshot.sampleImage?.name ||
          wizardSnapshot.sampleImage?.file?.name ||
          "",
        houseImageDataUrl: wizardSnapshot.houseImage?.dataUrl || "",
        houseImageName:
          wizardSnapshot.houseImage?.name ||
          wizardSnapshot.houseImage?.file?.name ||
          "",
      };

      setHistory((prev) => [...prev, entry]);
    },
    [user?.email, user?.name]
  );

  const updateHistoryStatus = useCallback((entryId, status) => {
    setHistory((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, status, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  }, []);

  const forceClearHistory = useCallback(() => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Xóa toàn bộ lịch sử demo? Hành động này không thể hoàn tác."
      );
      if (!confirmed) return;
    }
    setHistory([]);
  }, []);

  const visibleHistory = useMemo(() => {
    if (!user) return [];
    return user.role === "admin"
      ? history
      : history.filter((entry) => entry.createdBy === user.email);
  }, [history, user]);

  const personalHistory = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return history;
    return history.filter((entry) => entry.createdBy === user.email);
  }, [history, user]);

  return {
    history,
    visibleHistory,
    personalHistory,
    saveHistory,
    updateHistoryStatus,
    forceClearHistory,
  };
}

export default useHistoryManager;
