import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";

const STORAGE_KEY_HISTORY = "exteriorHistory";

export const WIZARD_STEPS = [
  { id: "sample", label: "Ảnh mẫu", route: "upload-sample" },
  { id: "requirements", label: "Yêu cầu", route: "select-requirements" },
  { id: "house", label: "Ảnh nhà", route: "upload-house" },
  { id: "result", label: "Kết quả", route: "result" },
];

const createInitialData = () => ({
  sampleImage: null,
  requirements: {
    colorPalette: "",
    decorItems: "",
    aiSuggestions: "",
    style: "Hiện đại",
  },
  houseImage: null,
  result: null,
});

const createHistoryId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const normalizeHistory = (entries) => {
  if (!Array.isArray(entries)) return [];
  return entries.map((entry) => ({
    ...entry,
    status: entry.status || "pending",
  }));
};

const revokePreview = (image) => {
  if (image?.preview) {
    URL.revokeObjectURL(image.preview);
  }
};

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const { user } = useAuth();
  const [wizardData, setWizardData] = useState(createInitialData);
  const [stepIndex, setStepIndex] = useState(0);
  const [session, setSession] = useState({
    tempId: null,
    sampleImageUrl: "",
    extractedLayout: null,
    averageColor: null,
    stylePlan: null,
    finalResult: null,
  });
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_HISTORY);
      if (!stored) return [];
      return normalizeHistory(JSON.parse(stored));
    } catch (error) {
      console.warn("Không thể đọc lịch sử từ localStorage:", error);
      return [];
    }
  });
  const [loading, setLoading] = useState({
    sample: false,
    requirements: false,
    final: false,
  });
  const [errors, setErrors] = useState({
    sample: null,
    requirements: null,
    final: null,
  });

  const apiBase =
    typeof window !== "undefined"
      ? import.meta.env.VITE_API_URL?.replace(/\/$/, "")
      : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    return () => {
      revokePreview(wizardData.sampleImage);
      revokePreview(wizardData.houseImage);
    };
  }, [wizardData.sampleImage, wizardData.houseImage]);

  useEffect(() => {
    if (!user) {
      setStepIndex(0);
      setWizardData((prev) => {
        revokePreview(prev.sampleImage);
        revokePreview(prev.houseImage);
        return createInitialData();
      });
      setSession({
        tempId: null,
        sampleImageUrl: "",
        extractedLayout: null,
        averageColor: null,
        stylePlan: null,
        finalResult: null,
      });
      setErrors({ sample: null, requirements: null, final: null });
      setLoading({ sample: false, requirements: false, final: false });
    }
  }, [user]);

  const setStepLoading = useCallback(
    (key, value) => setLoading((prev) => ({ ...prev, [key]: value })),
    []
  );

  const setStepError = useCallback(
    (key, message) => setErrors((prev) => ({ ...prev, [key]: message })),
    []
  );

  const selectSample = useCallback((file) => {
    setWizardData((prev) => {
      revokePreview(prev.sampleImage);
      if (!file) {
        return { ...prev, sampleImage: null, result: null };
      }
      return {
        ...prev,
        sampleImage: {
          file,
          preview: URL.createObjectURL(file),
        },
        result: null,
      };
    });
    setSession({
      tempId: null,
      sampleImageUrl: "",
      extractedLayout: null,
      averageColor: null,
      stylePlan: null,
      finalResult: null,
    });
    setStepError("sample", null);
  }, [setStepError]);

  const selectHouse = useCallback((file) => {
    setWizardData((prev) => {
      revokePreview(prev.houseImage);
      if (!file) {
        return { ...prev, houseImage: null };
      }
      return {
        ...prev,
        houseImage: {
          file,
          preview: URL.createObjectURL(file),
        },
      };
    });
    setStepError("final", null);
  }, [setStepError]);

  const updateRequirements = useCallback(
    (nextRequirements) => {
      setWizardData((prev) => ({
        ...prev,
        requirements: nextRequirements,
      }));
      setStepError("requirements", null);
    },
    [setStepError]
  );

  const uploadSample = useCallback(async () => {
    if (!wizardData.sampleImage?.file) {
      setStepError("sample", "Vui lòng chọn ảnh mẫu trước khi tiếp tục.");
      return false;
    }
    if (!apiBase) {
      setStepError(
        "sample",
        "Thiếu cấu hình VITE_API_URL. Không thể kết nối đến backend."
      );
      return false;
    }

    setStepLoading("sample", true);
    setStepError("sample", null);
    try {
      const formData = new FormData();
      formData.append("sample", wizardData.sampleImage.file);
      const response = await fetch(`${apiBase}/api/upload-sample`, {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        throw new Error(json.message || "Upload ảnh mẫu thất bại.");
      }
      setSession((prev) => ({
        ...prev,
        tempId: json.data.tempId,
        sampleImageUrl: json.data.sampleImageUrl,
        extractedLayout: json.data.extractedLayout,
        averageColor: json.data.averageColor,
        stylePlan: null,
        finalResult: null,
      }));
      return true;
    } catch (error) {
      console.error(error);
      setStepError("sample", error.message);
      return false;
    } finally {
      setStepLoading("sample", false);
    }
  }, [apiBase, setStepError, setStepLoading, wizardData.sampleImage]);

  const submitRequirements = useCallback(
    async ({ skipSampleCheck = false } = {}) => {
      if (!apiBase) {
        setStepError(
          "requirements",
          "Thiếu cấu hình VITE_API_URL. Không thể kết nối đến backend."
        );
        return false;
      }
      if (!skipSampleCheck && !session.tempId) {
        const uploaded = await uploadSample();
        if (!uploaded) return false;
      }

      setStepLoading("requirements", true);
      setStepError("requirements", null);

      const requirementsPayload = [
        wizardData.requirements.style &&
          `Phong cách: ${wizardData.requirements.style}`,
        wizardData.requirements.colorPalette &&
          `Bảng màu: ${wizardData.requirements.colorPalette}`,
        wizardData.requirements.decorItems &&
          `Trang trí: ${wizardData.requirements.decorItems}`,
        wizardData.requirements.aiSuggestions &&
          `Ghi chú AI: ${wizardData.requirements.aiSuggestions}`,
      ].filter(Boolean);

      try {
        const response = await fetch(`${apiBase}/api/generate-style`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tempId: session.tempId,
            requirements: requirementsPayload,
          }),
        });
        const json = await response.json();
        if (!response.ok || !json.ok) {
          const msg = json?.message?.toLowerCase() || "";
          if (
            response.status === 400 &&
            msg.includes("tempid") &&
            !skipSampleCheck
          ) {
            const uploaded = await uploadSample();
            if (uploaded) {
              return await submitRequirements({ skipSampleCheck: true });
            }
          }
          throw new Error(json?.message || "Gửi yêu cầu thiết kế thất bại.");
        }
        setSession((prev) => ({
          ...prev,
          stylePlan: json.data.stylePlan,
        }));
        return true;
      } catch (error) {
        console.error(error);
        setStepError("requirements", error.message);
        return false;
      } finally {
        setStepLoading("requirements", false);
      }
    },
    [
      apiBase,
      session.tempId,
      setStepError,
      setStepLoading,
      uploadSample,
      wizardData.requirements.aiSuggestions,
      wizardData.requirements.colorPalette,
      wizardData.requirements.decorItems,
      wizardData.requirements.style,
    ]
  );

  const submitFinal = useCallback(async (options = {}) => {
    const { __retry = false } = options;
    if (!apiBase) {
      setStepError(
        "final",
        "Thiếu cấu hình VITE_API_URL. Không thể kết nối đến backend."
      );
      return false;
    }
    if (!wizardData.houseImage?.file) {
      setStepError("final", "Vui lòng tải ảnh nhà hiện trạng.");
      return false;
    }

    if (!session.tempId) {
      const uploaded = await uploadSample();
      if (!uploaded) return false;
    }

    if (!session.stylePlan) {
      const styled = await submitRequirements({ skipSampleCheck: true });
      if (!styled) return false;
    }

    setStepLoading("final", true);
    setStepError("final", null);

    try {
      const formData = new FormData();
      formData.append("tempId", session.tempId);
      formData.append("house", wizardData.houseImage.file);

      const response = await fetch(`${apiBase}/api/generate-final`, {
        method: "POST",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        const msg = json?.message?.toLowerCase() || "";
        if (response.status === 400 && msg.includes("tempid") && !__retry) {
          const uploaded = await uploadSample();
          if (uploaded) {
            const styled = await submitRequirements({
              skipSampleCheck: true,
            });
            if (styled) {
              return await submitFinal({ __retry: true });
            }
          }
        }
        throw new Error(json?.message || "Sinh ảnh kết quả thất bại.");
      }

      setSession((prev) => ({
        ...prev,
        finalResult: json.data,
      }));
      setWizardData((prev) => ({
        ...prev,
        result: json.data,
      }));
      return true;
    } catch (error) {
      console.error(error);
      setStepError("final", error.message);
      return false;
    } finally {
      setStepLoading("final", false);
    }
  }, [
    apiBase,
    session.tempId,
    session.stylePlan,
    setStepError,
    setStepLoading,
    submitRequirements,
    uploadSample,
    wizardData.houseImage,
  ]);

  const restartWizard = useCallback(() => {
    setWizardData((prev) => {
      revokePreview(prev.sampleImage);
      revokePreview(prev.houseImage);
      return createInitialData();
    });
    setSession({
      tempId: null,
      sampleImageUrl: "",
      extractedLayout: null,
      averageColor: null,
      stylePlan: null,
      finalResult: null,
    });
    setErrors({ sample: null, requirements: null, final: null });
    setLoading({ sample: false, requirements: false, final: false });
    setStepIndex(0);
  }, []);

  const saveHistory = useCallback(
    (notes) => {
      if (!user) {
        return { ok: false, message: "Bạn cần đăng nhập để lưu lịch sử." };
      }

      const entry = {
        id: createHistoryId(),
        createdAt: new Date().toISOString(),
        style: wizardData.requirements.style,
        colorPalette: wizardData.requirements.colorPalette,
        decorItems: wizardData.requirements.decorItems,
        aiSuggestions: wizardData.requirements.aiSuggestions,
        sampleImageName: wizardData.sampleImage?.file?.name ?? "",
        houseImageName: wizardData.houseImage?.file?.name ?? "",
        notes,
        status: "pending",
        createdBy: user.email,
        createdByName: user.name,
        outputImageUrl: wizardData.result?.outputImageUrl ?? "",
        description: wizardData.result?.description ?? "",
        dominantColorHex: session.averageColor?.hex ?? "",
        model: wizardData.result?.model ?? "",
        prompt: wizardData.result?.prompt ?? "",
      };

      setHistory((prev) => [entry, ...prev]);
      return { ok: true, entry };
    },
    [session.averageColor?.hex, user, wizardData]
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

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const recommendations = useMemo(() => {
    if (session.stylePlan?.combined?.length) {
      return session.stylePlan.combined;
    }

    const items = [];
    const { requirements, sampleImage, houseImage } = wizardData;

    if (requirements.colorPalette) {
      items.push(
        `Giữ bảng màu chủ đạo "${requirements.colorPalette}" và tinh chỉnh độ bão hòa để hài hòa với ánh sáng hiện trạng.`
      );
    } else {
      items.push(
        "Đề xuất sử dụng tông màu trung tính (trắng kem, ghi nhạt) kết hợp điểm nhấn gỗ để tạo cảm giác ấm áp."
      );
    }

    if (requirements.decorItems) {
      items.push(
        `Bổ sung các chi tiết trang trí: ${requirements.decorItems}. Ưu tiên bố trí cân đối ở ban công và mặt đứng.`
      );
    }

    switch (requirements.style) {
      case "Hiện đại":
        items.push(
          "Tăng mảng kính và lam nhôm ngang để nhấn mạnh đường nét hiện đại, kết hợp ánh sáng âm trần mạnh."
        );
        break;
      case "Tân cổ điển":
        items.push(
          "Thêm phào chỉ tinh gọn và hệ cột cân đối, sử dụng đèn tường cổ điển để tạo cảm giác sang trọng."
        );
        break;
      case "Scandinavian":
        items.push(
          "Ưu tiên bề mặt gỗ sáng, cửa kính lớn và bồn cây nhỏ để tăng độ thoáng đãng đặc trưng Bắc Âu."
        );
        break;
      case "Resort nhiệt đới":
        items.push(
          "Bố trí lam gỗ dọc, mái hiên lớn và mảng xanh rủ nhằm tạo cảm giác nghỉ dưỡng thoáng mát."
        );
        break;
      default:
        break;
    }

    if (requirements.aiSuggestions) {
      items.push(
        `Lưu ý riêng: ${requirements.aiSuggestions}. Hệ thống sẽ ưu tiên chi tiết này trong giai đoạn render.`
      );
    }

    if (sampleImage && houseImage) {
      items.push(
        "AI sẽ đồng bộ góc chụp và ánh sáng giữa ảnh mẫu và ảnh hiện trạng để tăng mức độ tương đồng."
      );
    }

    items.push(
      "Khi có kết quả, bạn có thể đề nghị thêm phương án khác (ví dụ: biến thể màu sắc hoặc vật liệu)."
    );

    return items;
  }, [session.stylePlan, wizardData]);

  const visibleHistory = useMemo(() => {
    if (user?.role === "admin") {
      return history;
    }
    if (!user?.email) {
      return [];
    }
    return history.filter((entry) => entry.createdBy === user.email);
  }, [history, user]);

  const value = useMemo(
    () => ({
      wizardData,
      steps: WIZARD_STEPS,
      stepIndex,
      setStepIndex,
      selectSample,
      uploadSample,
      updateRequirements,
      submitRequirements,
      selectHouse,
      submitFinal,
      restartWizard,
      saveHistory,
      updateHistoryStatus,
      clearHistory,
      recommendations,
      history,
      visibleHistory,
      session,
      loading,
      errors,
    }),
    [
      wizardData,
      WIZARD_STEPS,
      stepIndex,
      selectSample,
      uploadSample,
      updateRequirements,
      submitRequirements,
      selectHouse,
      submitFinal,
      restartWizard,
      saveHistory,
      updateHistoryStatus,
      clearHistory,
      recommendations,
      history,
      visibleHistory,
      session,
      loading,
      errors,
    ]
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard phải được sử dụng bên trong WizardProvider");
  }
  return context;
}
