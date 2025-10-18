import { useEffect, useMemo, useState } from "react";
import AdminDashboard from "./components/AdminDashboard.jsx";
import HistoryViewer from "./components/HistoryViewer.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import ResultStep from "./components/ResultStep.jsx";
import SelectRequirementsStep from "./components/SelectRequirementsStep.jsx";
import UploadHouseStep from "./components/UploadHouseStep.jsx";
import UploadSampleStep from "./components/UploadSampleStep.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import {
  uploadSample,
  generateStyle,
  generateFinal,
  getHistories,
} from "./api/wizard";

const iconBaseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function Icon({ name, size = 18, className }) {
  const props = { ...iconBaseProps, width: size, height: size, className };

  switch (name) {
    case "palette":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="8.5" cy="10" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="12" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
          <path d="M12 20c2.5 0 3.5-1.4 3-3.2-.4-1.4.4-2.3 1.6-2.6" />
        </svg>
      );
    case "spark":
      return (
        <svg {...props}>
          <path d="M12 4.5 13.4 9 18 10.6 13.4 12.2 12 16.7 10.6 12.2 6 10.6 10.6 9z" />
          <path d="M5.5 5 6 7 7.8 7.5 6 8 5.5 9.8 5 8 3.2 7.5 5 7z" />
          <path d="M17.5 14 18 15.8 19.8 16.3 18 16.8 17.5 18.6 17 16.8 15.2 16.3 17 15.8z" />
        </svg>
      );
    case "camera":
      return (
        <svg {...props}>
          <rect x="4.5" y="7" width="15" height="11" rx="3" />
          <path d="M9 6.5h6" />
          <circle cx="12" cy="12.5" r="3.4" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.7 12 2.2 2.2 4.4-4.7" />
        </svg>
      );
    case "compass":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m9.5 14.5 1.1-3.9 3.9-1.1-1.1 3.9z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="9" r="3.2" />
          <path d="M6.5 18.5a6 6 0 0 1 11 0" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 4 6 6v5.5c0 3.9 2.5 7.5 6 8.5 3.5-1 6-4.6 6-8.5V6z" />
          <path d="m9.5 13 1.8 1.8 3.2-3.6" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="M4.5 10.5 12 5l7.5 5.5" />
          <path d="M6.5 10v8.5h11V10" />
          <path d="M10.5 18.5v-3.5h3v3.5" />
        </svg>
      );
    case "logo":
      return (
        <svg {...props}>
          <path d="M4.5 11.5 12 5l7.5 6.5" />
          <path d="M7 10.5v7.5h10V10.5" />
          <path d="M9.5 14.5h5" />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path d="M9 6v-2.5h8.5v17H9V18" />
          <path d="M14 12H4.5" />
          <path d="m7 9-3 3 3 3" />
        </svg>
      );
    default:
      return null;
  }
}

const steps = [
  { id: "sample", label: "Ảnh mẫu", icon: "palette" },
  { id: "requirements", label: "Yêu cầu", icon: "spark" },
  { id: "house", label: "Ảnh hiện trạng", icon: "camera" },
  { id: "result", label: "Kết quả", icon: "check" },
];

const DEFAULT_USERS = [
  {
    email: "admin@ngoai-that.ai",
    password: "admin123",
    role: "admin",
    name: "Quản trị viên",
  },
  {
    email: "designer@ngoai-that.ai",
    password: "design123",
    role: "designer",
    name: "Nhà thiết kế",
  },
];

const createInitialData = () => ({
  sampleImage: null,
  houseImage: null,
  requirements: {
    style: "Hiện đại",
    colorPalette: "",
    decorItems: "",
    aiSuggestions: "",
  },
  stylePlan: "",
  result: null,
  tempId: "",
});

const createHistoryId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () =>
      reject(new Error("Không thể đọc tệp hình ảnh từ thiết bị."));
    reader.readAsDataURL(file);
  });

const initialMessages = {
  sample: "",
  requirements: "",
  house: "",
  result: "",
};

const initialLoading = {
  sample: false,
  requirements: false,
  house: false,
};

function mergeUsers(storedUsers) {
  const map = new Map(
    DEFAULT_USERS.map((item) => [item.email.toLowerCase(), item])
  );
  if (Array.isArray(storedUsers)) {
    storedUsers.forEach((user) => {
      if (user?.email) {
        map.set(user.email.toLowerCase(), {
          ...user,
          email: user.email.toLowerCase(),
        });
      }
    });
  }
  return Array.from(map.values());
}

function App() {
  const [users, setUsers] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_USERS;
    try {
      const stored = window.localStorage.getItem("exteriorUsers");
      if (!stored) return DEFAULT_USERS;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return DEFAULT_USERS;
      return mergeUsers(parsed);
    } catch (error) {
      console.warn("Không thể đọc danh sách người dùng từ localStorage:", error);
      return DEFAULT_USERS;
    }
  });

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem("exteriorUser");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      console.warn("Không thể đọc người dùng từ localStorage:", error);
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [authNotice, setAuthNotice] = useState("");
  const [authPrefillEmail, setAuthPrefillEmail] = useState("");
  const [activeView, setActiveView] = useState("wizard");
  const [stepIndex, setStepIndex] = useState(0);
  const [wizardData, setWizardData] = useState(createInitialData);
  const [loadingState, setLoadingState] = useState(initialLoading);
  const [apiMessages, setApiMessages] = useState(initialMessages);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("exteriorHistory");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Không thể đọc lịch sử từ localStorage:", error);
      return [];
    }
  });
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("exteriorUsers", JSON.stringify(users));
    } catch (error) {
      console.warn("Không thể lưu người dùng vào localStorage:", error);
    }
  }, [users]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("exteriorHistory", JSON.stringify(history));
    } catch (error) {
      console.warn("Không thể lưu lịch sử vào localStorage:", error);
    }
  }, [history]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (user) {
        window.localStorage.setItem("exteriorUser", JSON.stringify(user));
      } else {
        window.localStorage.removeItem("exteriorUser");
      }
    } catch (error) {
      console.warn("Không thể lưu người dùng vào localStorage:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== "admin" && activeView === "admin") {
      setActiveView("wizard");
    }
  }, [activeView, user?.role]);

  useEffect(() => {
    return () => {
      if (wizardData.sampleImage?.preview) {
        URL.revokeObjectURL(wizardData.sampleImage.preview);
      }
      if (wizardData.houseImage?.preview) {
        URL.revokeObjectURL(wizardData.houseImage.preview);
      }
    };
  }, [wizardData.sampleImage?.preview, wizardData.houseImage?.preview]);

  useEffect(() => {
    if (!user || activeView !== "history") return;
    let cancelled = false;
    const fetchHistories = async () => {
      try {
        const res = await getHistories(user.role === "admin" ? "" : user.email);
        if (!cancelled && res && res.ok && Array.isArray(res.data?.items)) {
          console.log("Remote histories preview:", res.data.items.slice(0, 3));
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("Không thể lấy lịch sử từ API:", error);
        }
      }
    };
    fetchHistories();
    return () => {
      cancelled = true;
    };
  }, [activeView, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let rafId = null;
    const handleScroll = () => {
      const y = window.scrollY;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setIsHeaderCollapsed((prev) => {
          if (!prev && y > 160) return true;
          if (prev && y < 80) return false;
          return prev;
        });
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isHeaderCollapsed) setIsQuickMenuOpen(false);
  }, [isHeaderCollapsed]);

  const currentStep = steps[stepIndex]?.id ?? "sample";

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

  const navigationItems = useMemo(() => {
    const items = [
      { id: "wizard", label: "Quy trình", icon: "compass" },
      { id: "profile", label: "Hồ sơ", icon: "user" },
    ];
    if (user?.role === "admin") {
      items.push({ id: "admin", label: "Quản trị", icon: "shield" });
    }
    return items;
  }, [user?.role]);

  const roleLabel =
    user?.role === "admin" ? "Quản trị viên" : "Nhà thiết kế";
  const displayName = user?.name ?? "Người dùng";

  const displayInitials = useMemo(() => {
    const source = displayName.trim();
    if (!source) return "ND";
    const parts = source.split(/\s+/);
    const letters = parts
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return letters || "ND";
  }, [displayName]);

  const progressPercent = useMemo(() => {
    if (steps.length <= 1) return 0;
    return (stepIndex / (steps.length - 1)) * 100;
  }, [stepIndex]);

  const goNext = () => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  const resetWizard = () => {
    setWizardData((prev) => {
      if (prev.sampleImage?.preview) {
        URL.revokeObjectURL(prev.sampleImage.preview);
      }
      if (prev.houseImage?.preview) {
        URL.revokeObjectURL(prev.houseImage.preview);
      }
      return createInitialData();
    });
    setApiMessages({ ...initialMessages });
    setLoadingState({ ...initialLoading });
    setStepIndex(0);
  };

  const handleSampleSelected = async (input) => {
    setApiMessages((prev) => ({ ...prev, sample: "", house: "" }));

    setWizardData((prev) => {
      if (prev.sampleImage?.preview) {
        URL.revokeObjectURL(prev.sampleImage.preview);
      }
      const nextTemp = prev.tempId || createHistoryId();
      if (!input) {
        return {
          ...createInitialData(),
          tempId: nextTemp,
          requirements: prev.requirements,
        };
      }

      if (typeof File !== "undefined" && input instanceof File) {
        const preview = URL.createObjectURL(input);
        return {
          ...prev,
          sampleImage: { file: input, preview, name: input.name },
          tempId: nextTemp,
          houseImage: null,
          stylePlan: "",
          result: null,
        };
      }

      return {
        ...prev,
        sampleImage: input,
        tempId: input.tempId || prev.tempId || nextTemp,
        houseImage: null,
        stylePlan: "",
        result: null,
      };
    });

    if (!(typeof File !== "undefined" && input instanceof File)) {
      return;
    }

    try {
      const sampleDataUrl = await readFileAsDataUrl(input);
      if (sampleDataUrl) {
        setWizardData((prev) => ({
          ...prev,
          sampleImage: prev.sampleImage
            ? {
                ...prev.sampleImage,
                dataUrl: sampleDataUrl,
                name: input.name,
              }
            : prev.sampleImage,
        }));
      }
    } catch (error) {
      console.warn("Không thể mã hóa ảnh mẫu thành data URL:", error);
    }

    setLoadingState((prev) => ({ ...prev, sample: true }));
    try {
      const response = await uploadSample(input);
      const tempId = response?.tempId || createHistoryId();
      const message =
        response?.message ||
        "Tải ảnh mẫu thành công. Chọn Tiếp tục để sang bước kế tiếp.";

      setWizardData((prev) => ({
        ...prev,
        tempId,
        sampleImage: prev.sampleImage
          ? { ...prev.sampleImage, tempId }
          : prev.sampleImage,
      }));

      setApiMessages((prev) => ({ ...prev, sample: message }));
    } catch (error) {
      console.error("uploadSample failed:", error);
      setApiMessages((prev) => ({
        ...prev,
        sample: "Không thể tải ảnh mẫu. Vui lòng thử lại.",
      }));
    } finally {
      setLoadingState((prev) => ({ ...prev, sample: false }));
    }
  };

  const handleRequirementsChange = (requirements) => {
    setWizardData((prev) => ({
      ...prev,
      requirements,
    }));
  };

  const handleGenerateStyle = async () => {
    setApiMessages((prev) => ({ ...prev, requirements: "" }));

    const nextTempId = wizardData.tempId || createHistoryId();
    if (!wizardData.tempId) {
      setWizardData((prev) => ({ ...prev, tempId: nextTempId }));
    }

    const requirementsArray = [
      wizardData.requirements.style,
      wizardData.requirements.colorPalette,
      wizardData.requirements.decorItems,
      wizardData.requirements.aiSuggestions,
    ].filter(Boolean);

    if (requirementsArray.length === 0) {
      setApiMessages((prev) => ({
        ...prev,
        requirements: "Hãy nhập ít nhất một trường trước khi tiếp tục.",
      }));
      return;
    }

    setLoadingState((prev) => ({ ...prev, requirements: true }));
    try {
      const response = await generateStyle(nextTempId, requirementsArray);
      const stylePlan =
        response?.plan ||
        (Array.isArray(response?.combined)
          ? response.combined.join("\n")
          : response?.promptHint || "");

      setWizardData((prev) => ({
        ...prev,
        stylePlan,
      }));

      setApiMessages((prev) => ({
        ...prev,
        requirements:
          response?.message || "Đã tạo gợi ý từ AI. Chọn Tiếp tục để sang bước kế tiếp.",
      }));

      goNext();
    } catch (error) {
      console.error("generateStyle failed:", error);
      setApiMessages((prev) => ({
        ...prev,
        requirements: "Không thể tạo gợi ý từ AI. Vui lòng thử lại.",
      }));
    } finally {
      setLoadingState((prev) => ({ ...prev, requirements: false }));
    }
  };

  const handleHouseSelected = async (file) => {
    setWizardData((prev) => {
      if (prev.houseImage?.preview) {
        URL.revokeObjectURL(prev.houseImage.preview);
      }
      if (!file) {
        return { ...prev, houseImage: null };
      }
      if (typeof File !== "undefined" && file instanceof File) {
        return {
          ...prev,
          houseImage: {
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
          },
          result: null,
        };
      }
      return { ...prev, houseImage: file };
    });

    if (typeof File !== "undefined" && file instanceof File) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        if (dataUrl) {
          setWizardData((prev) => ({
            ...prev,
            houseImage: prev.houseImage
              ? { ...prev.houseImage, dataUrl, name: file.name }
              : prev.houseImage,
          }));
        }
      } catch (error) {
        console.warn("Không thể mã hóa ảnh hiện trạng thành data URL:", error);
      }
    }
  };

  const handleGenerateFinal = async () => {
    if (!wizardData.houseImage?.file) {
      setApiMessages((prev) => ({
        ...prev,
        house: "Hãy tải ảnh hiện trạng trước khi tiếp tục.",
      }));
      return;
    }

    const tempId = wizardData.tempId || createHistoryId();
    setWizardData((prev) => ({ ...prev, tempId }));

    setLoadingState((prev) => ({ ...prev, house: true }));
    setApiMessages((prev) => ({ ...prev, house: "" }));

    try {
      const response = await generateFinal(
        tempId,
        wizardData.houseImage.file,
        wizardData.requirements
      );

      const resultPayload = response?.result || response;

      setWizardData((prev) => ({
        ...prev,
        result: resultPayload,
      }));

      setApiMessages((prev) => ({
        ...prev,
        house:
          response?.message ||
          "Đã gửi ảnh hiện trạng. Kết quả sẽ hiển thị ở bước tiếp theo.",
      }));

      goNext();
    } catch (error) {
      console.error("generateFinal failed:", error);
      setApiMessages((prev) => ({
        ...prev,
        house: "Không thể tạo phương án. Vui lòng thử lại.",
      }));
    } finally {
      setLoadingState((prev) => ({ ...prev, house: false }));
    }
  };

  const handleSaveHistory = (notes) => {
    const entry = {
      id: createHistoryId(),
      createdAt: new Date().toISOString(),
      createdBy: user?.email ?? "unknown",
      createdByName: user?.name ?? "Người dùng",
      style: wizardData.requirements.style,
      colorPalette: wizardData.requirements.colorPalette,
      decorItems: wizardData.requirements.decorItems,
      aiSuggestions: wizardData.requirements.aiSuggestions,
      notes,
      status: "pending",
      outputImageUrl: wizardData.result?.outputImageUrl ?? "",
      sampleImageDataUrl: wizardData.sampleImage?.dataUrl || "",
      sampleImageName:
        wizardData.sampleImage?.name || wizardData.sampleImage?.file?.name || "",
      houseImageDataUrl: wizardData.houseImage?.dataUrl || "",
      houseImageName:
        wizardData.houseImage?.name || wizardData.houseImage?.file?.name || "",
    };

    setHistory((prev) => [...prev, entry]);
  };

  const handleUpdateHistoryStatus = (entryId, status) => {
    setHistory((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, status, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  };

  const handleForceClearHistory = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Xóa toàn bộ lịch sử demo? Hành động này không thể hoàn tác."
      );
      if (!confirmed) return;
    }
    setHistory([]);
  };

  const handleSwitchAuthMode = (mode, options = {}) => {
    setAuthMode(mode);
    setAuthNotice(options.notice ?? "");
    setAuthPrefillEmail(options.prefillEmail ?? "");
  };

  const handleLogin = ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = users.find(
      (candidate) =>
        candidate.email === normalizedEmail && candidate.password === password
    );

    if (!matchedUser) {
      return {
        ok: false,
        message: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
      };
    }

    setUser({
      email: matchedUser.email,
      role: matchedUser.role,
      name: matchedUser.name,
    });
    setActiveView("wizard");
    setAuthMode("login");
    setAuthNotice("");
    setAuthPrefillEmail("");
    resetWizard();
    return { ok: true };
  };

  const handleRegister = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((item) => item.email === normalizedEmail);
    if (exists) {
      return {
        ok: false,
        message: "Email đã tồn tại trong hệ thống.",
      };
    }
    const newUser = {
      email: normalizedEmail,
      password,
      role: "designer",
      name,
    };
    setUsers((prev) => [...prev, newUser]);
    setAuthMode("login");
    setAuthNotice("Đăng ký thành công. Vui lòng đăng nhập.");
    setAuthPrefillEmail(normalizedEmail);
    return { ok: true, email: normalizedEmail };
  };

  const handleLogout = () => {
    resetWizard();
    setUser(null);
    setActiveView("wizard");
    setAuthMode("login");
    setAuthNotice("");
    setAuthPrefillEmail("");
  };

  const disableNextSample = !wizardData.sampleImage || loadingState.sample;
  const disableNextHouse = !wizardData.houseImage || loadingState.house;

  let stepContent = null;
  if (currentStep === "sample") {
    stepContent = (
      <UploadSampleStep
        sampleImage={wizardData.sampleImage}
        onSampleSelected={handleSampleSelected}
        onNext={goNext}
        disableNext={disableNextSample}
        loading={loadingState.sample}
        apiMessage={apiMessages.sample}
      />
    );
  } else if (currentStep === "requirements") {
    stepContent = (
      <SelectRequirementsStep
        requirements={wizardData.requirements}
        onChange={handleRequirementsChange}
        onBack={goBack}
        onNext={handleGenerateStyle}
        loading={loadingState.requirements}
        stylePlan={wizardData.stylePlan}
        apiMessage={apiMessages.requirements}
      />
    );
  } else if (currentStep === "house") {
    stepContent = (
      <UploadHouseStep
        houseImage={wizardData.houseImage}
        sampleImage={wizardData.sampleImage}
        requirements={wizardData.requirements}
        onHouseSelected={handleHouseSelected}
        onBack={goBack}
        onNext={handleGenerateFinal}
        loading={loadingState.house}
        apiMessage={apiMessages.house}
      />
    );
  } else if (currentStep === "result") {
    stepContent = (
      <ResultStep
        data={wizardData}
        history={visibleHistory}
        onSaveHistory={handleSaveHistory}
        onBack={goBack}
        onRestart={resetWizard}
        apiMessage={apiMessages.result}
      />
    );
  }

  if (!user) {
    if (authMode === "register") {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onSwitchMode={handleSwitchAuthMode}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchMode={handleSwitchAuthMode}
        prefillEmail={authPrefillEmail}
        notice={authNotice}
      />
    );
  }

  const headerTitle =
    activeView === "admin"
      ? "Bảng điều khiển quản trị"
      : "Trợ lý thiết kế ngoại thất thông minh";

  return (
    <div className="app-shell">
      <header className={`app-header ${isHeaderCollapsed ? "app-header--hidden" : ""}`}>
        <div className="app-header__inner">
          <div className={`app-header__row${isHeaderCollapsed ? " app-header__row--hidden" : ""}`}>
            <div className="app-header__brand">
              <span className="app-logo-chip">
                <Icon name="logo" size={26} />
              </span>
              <div className="app-header__brand-text">
                <p className="app-header__title">AI House Designer</p>
              </div>
            </div>
          </div>

          <div className="app-header__meta">
            <h1 className="app-header__headline">{headerTitle}</h1>
          </div>

          <div className="app-header__nav">
            <div className="app-header__nav-actions">
              <div className="header-avatar">
                <div className="header-avatar__circle">
                  <span>{displayInitials}</span>
                  <span className="header-avatar__badge">
                    <Icon name="home" size={15} />
                  </span>
                </div>
                <div className="header-avatar__info">
                  <p className="header-avatar__name">{displayName}</p>
                  <p className="header-avatar__role">{roleLabel}</p>
                </div>
              </div>

              <button type="button" onClick={handleLogout} className="nav-chip nav-chip--ghost">
                <Icon name="logout" size={15} className="nav-chip__icon" />
                Đăng xuất
              </button>
            </div>

            <nav className="app-nav" aria-label="Điều hướng">
              {navigationItems.map(({ id, label, icon }) => {
                const isActive = activeView === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveView(id)}
                    className={`nav-chip${isActive ? " nav-chip--active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon name={icon} size={16} className="nav-chip__icon" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {isHeaderCollapsed ? (
        <>
          <button
            type="button"
            className={`quick-menu-toggle${isQuickMenuOpen ? " is-open" : ""}`}
            onClick={() => setIsQuickMenuOpen((prev) => !prev)}
            aria-label="Mở menu nhanh"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="4" y="7" width="16" height="2" rx="1" />
              <rect x="4" y="11" width="16" height="2" rx="1" />
              <rect x="4" y="15" width="16" height="2" rx="1" />
            </svg>
          </button>
          <div
            className={`quick-menu${isQuickMenuOpen ? " quick-menu--open" : ""}`}
            onClick={() => setIsQuickMenuOpen(false)}
          >
            <div
              className="quick-menu__panel"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="quick-menu__header">
                <div className="header-avatar">
                  <div className="header-avatar__circle">
                    <span>{displayInitials}</span>
                    <span className="header-avatar__badge">
                      <Icon name="home" size={15} />
                    </span>
                  </div>
                  <div className="header-avatar__info">
                    <p className="header-avatar__name">{displayName}</p>
                    <p className="header-avatar__role">{roleLabel}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickMenuOpen(false);
                    handleLogout();
                  }}
                  className="nav-chip nav-chip--ghost quick-menu__logout"
                >
                  <Icon name="logout" size={15} className="nav-chip__icon" />
                  Đăng xuất
                </button>
              </div>

              <nav className="quick-menu__nav" aria-label="Menu điều hướng">
                {navigationItems.map(({ id, label, icon }) => {
                  const isActive = activeView === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setActiveView(id);
                        setIsQuickMenuOpen(false);
                      }}
                      className={`quick-menu__item${isActive ? " is-active" : ""}`}
                    >
                      <Icon name={icon} size={16} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      ) : null}

      <main className="app-main wizard-main">
        {activeView === "wizard" && (
          <div className="step-progress" role="list" aria-label="Tiến trình thiết kế">
            <div className="step-progress__items">
              {steps.map((step, index) => {
                const isActive = index === stepIndex;
                const isComplete = index < stepIndex;
                return (
                  <div
                    key={step.id}
                    className={`step-progress__item${isActive ? " is-active" : ""}${
                      isComplete ? " is-complete" : ""
                    }`}
                    role="listitem"
                  >
                    <div className="step-progress__status">
                      <Icon name={step.icon} size={18} className="step-progress__icon" />
                    </div>
                    <div className="step-progress__text">
                      <span className="step-progress__label">{step.label}</span>
                      <span className="step-progress__caption">Bước {index + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="step-progress__bar" aria-hidden="true">
              <div className="step-progress__bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="app-stage">
          {activeView === "wizard" ? (
            stepContent
          ) : activeView === "history" ? (
            <HistoryViewer
              entries={visibleHistory}
              title={
                user.role === "admin"
                  ? "Lịch sử dự án"
                  : "Lịch sử dự án của tôi"
              }
              emptyMessage={
                user.role === "admin"
                  ? "Chưa có dự án nào được lưu."
                  : "Bạn chưa lưu dự án nào. Hãy tạo đề xuất trong wizard để bắt đầu."
              }
            />
          ) : activeView === "profile" ? (
            <ProfilePage
              user={user}
              historyEntries={personalHistory}
              draft={wizardData}
            />
          ) : (
            <AdminDashboard
              history={history}
              onUpdateStatus={handleUpdateHistoryStatus}
              onForceClear={handleForceClearHistory}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <div>
            <p className="app-footer__brand">AI House Designer</p>
            <p className="app-footer__tagline">Trợ lý thiết kế ngoại thất thông minh</p>
          </div>
          <div className="app-footer__links">
            <span className="app-footer__copyright">
              © {new Date().getFullYear()} Ngoại Thất AI
            </span>
            <a href="#" className="app-footer__link">
              Điều khoản
            </a>
            <a href="#" className="app-footer__link">
              Liên hệ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
