import { useEffect, useMemo, useState } from "react";
import AdminDashboard from "./components/AdminDashboard.jsx";
import HistoryViewer from "./components/HistoryViewer.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import ResultStep from "./components/ResultStep.jsx";
import SelectRequirementsStep from "./components/SelectRequirementsStep.jsx";
import UploadHouseStep from "./components/UploadHouseStep.jsx";
import UploadSampleStep from "./components/UploadSampleStep.jsx";
import { uploadSample, generateStyle, generateFinal, getHistories } from "./api/wizard";

const steps = [
  { id: "sample", label: "Ảnh mẫu" },
  { id: "requirements", label: "Yêu cầu" },
  { id: "house", label: "Ảnh nhà" },
  { id: "result", label: "Kết quả" },
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
  requirements: {
    colorPalette: "",
    decorItems: "",
    aiSuggestions: "",
    style: "Hiện đại",
  },
  houseImage: null,
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

const mergeUsers = (storedUsers) => {
  const map = new Map(
    DEFAULT_USERS.map((user) => [user.email.toLowerCase(), user])
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
};

function App() {
  const [users, setUsers] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_USERS;
    try {
      const stored = window.localStorage.getItem("exteriorUsers");
      if (!stored) return DEFAULT_USERS;
      const parsed = JSON.parse(stored);
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
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.localStorage.getItem("exteriorHistory");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return normalizeHistory(parsed);
    } catch (error) {
      console.warn("Không thể đọc lịch sử từ localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("exteriorUsers", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("exteriorHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem("exteriorUser", JSON.stringify(user));
    } else {
      window.localStorage.removeItem("exteriorUser");
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== "admin" && activeView === "admin") {
      setActiveView("wizard");
    }
  }, [activeView, user]);

  useEffect(() => {
  return () => {
    setTimeout(() => {
      if (wizardData.sampleImage?.preview)
        URL.revokeObjectURL(wizardData.sampleImage.preview);
      if (wizardData.houseImage?.preview)
        URL.revokeObjectURL(wizardData.houseImage.preview);
    }, 500); // ✅ Delay 0.5s để React render xong rồi mới revoke
  };
}, [wizardData.sampleImage?.preview, wizardData.houseImage?.preview]);


  useEffect(() => {
  const fetchHistories = async () => {
    try {
      const res = await getHistories(1);
      console.log("Histories API:", res);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử:", err);
    }
  };

  if (activeView === "history") {
    fetchHistories();
  }
}, [activeView]);


  const restartWizard = () => {
    setWizardData((prev) => {
      if (prev.sampleImage?.preview) {
        URL.revokeObjectURL(prev.sampleImage.preview);
      }
      if (prev.houseImage?.preview) {
        URL.revokeObjectURL(prev.houseImage.preview);
      }
      return createInitialData();
    });
    setStepIndex(0);
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
        message: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
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
    restartWizard();

    return { ok: true };
  };

  const handleRegister = ({ name, email, password }) => {
    const normalizedEmail = email.toLowerCase();
    const exists = users.some((item) => item.email === normalizedEmail);
    if (exists) {
      return {
        ok: false,
        message: "Email này đã tồn tại trong hệ thống.",
      };
    }

    const newUser = {
      email: normalizedEmail,
      password,
      role: "designer",
      name,
    };

    setUsers((prev) => [...prev, newUser]);

    return { ok: true, email: normalizedEmail };
  };

  const handleLogout = () => {
    restartWizard();
    setUser(null);
    setActiveView("wizard");
    setAuthMode("login");
    setAuthNotice("");
    setAuthPrefillEmail("");
  };

// Trong App.jsx
const handleSampleSelected = (fileData) => {
  setWizardData((prev) => {
    if (prev.sampleImage?.preview) {
      URL.revokeObjectURL(prev.sampleImage.preview);
    }

    // ✅ Nếu có tempId, luôn lưu lại vào wizardData
    if (fileData?.tempId) {
      return {
        ...prev,
        tempId: fileData.tempId,
        sampleImage: fileData,
      };
    }

    // Nếu chỉ là file thô (chưa upload xong)
    if (fileData?.file) {
      return {
        ...prev,
        sampleImage: fileData,
      };
    }

    return prev;
  });
};



  const handleHouseSelected = (file) => {
    setWizardData((prev) => {
      if (prev.houseImage?.preview) {
        URL.revokeObjectURL(prev.houseImage.preview);
      }
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
  };

  const handleRequirementsChange = (nextRequirements) => {
    setWizardData((prev) => ({
      ...prev,
      requirements: nextRequirements,
    }));
  };

  const goNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };
  

  const handleSaveHistory = async (notes) => {
  try {
    const res = await getHistories(1);
    if (!res.ok) throw new Error(res.message);
    console.log("Histories:", res.data.items);
  } catch (err) {
    console.error("Không thể lấy lịch sử:", err.message);
  }
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
        "Xóa toàn bộ lịch sử demo? Thao tác này không thể hoàn tác."
      );
      if (!confirmed) {
        return;
      }
    }
    setHistory([]);
  };

  const recommendations = useMemo(() => {
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
  }, [wizardData]);

  const currentStep = steps[stepIndex]?.id ?? "sample";
  const visibleHistory =
    user?.role === "admin"
      ? history
      : history.filter((entry) => entry.createdBy === user?.email);

  let stepContent = null;
  if (currentStep === "sample") {
    stepContent = (
      <UploadSampleStep
        sampleImage={wizardData.sampleImage}
        onSampleSelected={handleSampleSelected}
        onNext={goNext}
      />
    );
  } else if (currentStep === "requirements") {
    stepContent = (
      <SelectRequirementsStep
        tempId={wizardData.tempId} 
        requirements={wizardData.requirements}
        onChange={handleRequirementsChange}
        onBack={goBack}
        onNext={goNext}
      />
    );
  } else if (currentStep === "house") {
    stepContent = (
      <UploadHouseStep
        houseImage={wizardData.houseImage}
        sampleImage={wizardData.sampleImage}
        requirements={wizardData.requirements}
        tempId={wizardData.tempId}
        onHouseSelected={handleHouseSelected}
        onBack={goBack}
        onNext={goNext}
      />
    );
  } else if (currentStep === "result") {
    stepContent = (
      <ResultStep
        data={wizardData}
        recommendations={recommendations}
        history={visibleHistory}
        onSaveHistory={handleSaveHistory}
        onBack={goBack}
        onRestart={restartWizard}
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

  const headerSubtitle =
    activeView === "admin"
      ? "Theo dõi và quản lý các yêu cầu thiết kế mà đội ngũ đã khởi tạo."
      : "Hoàn thiện mặt tiền theo phong cách bạn mong muốn trong bốn bước rõ ràng.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex flex-col gap-4 px-6 py-6 lg:max-w-5xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-400/80">
              Ngoại thất AI
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-50">
              {headerTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{headerSubtitle}</p>
          </div>
          <div className="flex flex-col items-stretch gap-3 text-sm text-slate-300 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2">
              <div>
                <p className="font-semibold text-slate-100">{user.name}</p>
                <p className="text-xs uppercase tracking-wide text-emerald-300/80">
                  {user.role === "admin" ? "Quản trị viên" : "Nhà thiết kế"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView("wizard")}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeView === "wizard"
                    ? "bg-emerald-500 text-emerald-950"
                    : "border border-slate-700 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200"
                }`}
              >
                Wizard
              </button>
              <button
                type="button"
                onClick={() => setActiveView("history")}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeView === "history"
                    ? "bg-emerald-500 text-emerald-950"
                    : "border border-slate-700 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200"
                }`}
              >
                Lịch sử
              </button>
              {user.role === "admin" ? (
                <button
                  type="button"
                  onClick={() => setActiveView("admin")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    activeView === "admin"
                      ? "bg-emerald-500 text-emerald-950"
                      : "border border-slate-700 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200"
                  }`}
                >
                  Admin
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-rose-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-500/10"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
        {activeView === "wizard" ? (
          <div className="border-t border-slate-900/60">
            <div className="mx-auto flex items-center gap-4 px-6 py-4 lg:max-w-5xl">
              {steps.map((step, index) => {
                const isActive = index === stepIndex;
                const isCompleted = index < stepIndex;
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                        isCompleted
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                          : isActive
                          ? "border-emerald-400 text-emerald-200"
                          : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p
                      className={`text-xs font-medium uppercase tracking-wide ${
                        isActive
                          ? "text-emerald-200"
                          : isCompleted
                          ? "text-slate-300"
                          : "text-slate-600"
                      }`}
                    >
                      {step.label}
                    </p>
                    {index < steps.length - 1 ? (
                      <span className="h-px w-10 bg-slate-800" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {activeView === "wizard" ? (
          stepContent
        ) : activeView === "history" ? (
          <HistoryViewer
            entries={visibleHistory}
            title={
              user.role === "admin" ? "Lịch sử dự án" : "Lịch sử dự án của tôi"
            }
            emptyMessage={
              user.role === "admin"
                ? "Chưa có dự án nào được lưu."
                : "Bạn chưa lưu dự án nào. Hãy tạo đề xuất trong Wizard để bắt đầu."
            }
          />
        ) : (
          <AdminDashboard
            history={history}
            onUpdateStatus={handleUpdateHistoryStatus}
            onForceClear={handleForceClearHistory}
          />
        )}
      </main>
    </div>
  );
}

export default App;
