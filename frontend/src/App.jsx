import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AnimatedOutlet from "./components/AnimatedOutlet.jsx";
import HistoryViewer from "./components/HistoryViewer.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import ResultStep from "./components/ResultStep.jsx";
import SelectRequirementsStep from "./components/SelectRequirementsStep.jsx";
import UploadHouseStep from "./components/UploadHouseStep.jsx";
import UploadSampleStep from "./components/UploadSampleStep.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useWizard, WIZARD_STEPS } from "./context/WizardContext.jsx";

const WIZARD_BASE_PATH = "/wizard";
const FIRST_WIZARD_STEP_PATH = `${WIZARD_BASE_PATH}/${WIZARD_STEPS[0].route}`;

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to={FIRST_WIZARD_STEP_PATH} replace />} />
          <Route path="wizard" element={<WizardLayout />}>
            <Route
              index
              element={<Navigate to={WIZARD_STEPS[0].route} replace />}
            />
            <Route path={WIZARD_STEPS[0].route} element={<UploadSampleRoute />} />
            <Route
              path={WIZARD_STEPS[1].route}
              element={<SelectRequirementsRoute />}
            />
            <Route path={WIZARD_STEPS[2].route} element={<UploadHouseRoute />} />
            <Route path={WIZARD_STEPS[3].route} element={<ResultRoute />} />
          </Route>
          <Route path="history" element={<HistoryRoute />} />
          <Route path="admin" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to={FIRST_WIZARD_STEP_PATH} replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  return <Outlet />;
}

function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const {
    steps,
    stepIndex,
    restartWizard,
  } = useWizard();
  const navigate = useNavigate();
  const location = useLocation();

  const isWizardPath = location.pathname.startsWith("/wizard");
  const isHistoryPath = location.pathname.startsWith("/history");
  const isAdminPath = location.pathname.startsWith("/admin");

  const currentStep = steps[stepIndex] ?? steps[0];
  const wizardLink = `${WIZARD_BASE_PATH}/${currentStep.route}`;

  let headerTitle = "Trợ lý thiết kế ngoại thất thông minh";
  let headerSubtitle =
    "Hoàn thiện mặt tiền theo phong cách bạn mong muốn trong bốn bước rõ ràng.";

  if (isHistoryPath) {
    headerTitle =
      user.role === "admin" ? "Lịch sử dự án" : "Lịch sử dự án của tôi";
    headerSubtitle =
      "Theo dõi các phiên gợi ý đã lưu để tiếp tục trao đổi với khách hàng.";
  } else if (isAdminPath) {
    headerTitle = "Bảng điều khiển quản trị";
    headerSubtitle =
      "Theo dõi và quản lý các yêu cầu thiết kế mà đội ngũ đã khởi tạo.";
  }

  const navButtonClass = (active) =>
    `rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
      active
        ? "bg-emerald-500 text-emerald-950"
        : "border border-slate-700 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200"
    }`;

  const handleLogout = () => {
    restartWizard();
    logout();
    navigate("/login", { replace: true });
  };

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
                onClick={() => navigate(wizardLink)}
                className={navButtonClass(isWizardPath)}
              >
                Wizard
              </button>
              <button
                type="button"
                onClick={() => navigate("/history")}
                className={navButtonClass(isHistoryPath)}
              >
                Lịch sử
              </button>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className={navButtonClass(isAdminPath)}
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
        {isWizardPath ? (
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
        <AnimatedOutlet />
      </main>
    </div>
  );
}

function WizardLayout() {
  const { setStepIndex } = useWizard();
  const location = useLocation();

  const slug = location.pathname.split("/").pop() ?? WIZARD_STEPS[0].route;

  const stepPosition = WIZARD_STEPS.findIndex((step) => step.route === slug);

  useEffect(() => {
    if (stepPosition >= 0) {
      setStepIndex(stepPosition);
    }
  }, [stepPosition, setStepIndex]);

  return <AnimatedOutlet />;
}

function UploadSampleRoute() {
  const { wizardData, selectSample, uploadSample, session, loading, errors } =
    useWizard();
  const navigate = useNavigate();

  const handleNext = async () => {
    const ok = await uploadSample();
    if (ok) {
      navigate(`${WIZARD_BASE_PATH}/${WIZARD_STEPS[1].route}`);
    }
  };
  const handleBack = () => {};

  return (
    <UploadSampleStep
      sampleImage={wizardData.sampleImage}
      onSampleSelected={selectSample}
      onNext={handleNext}
      onBack={handleBack}
      disableBack
      loading={loading.sample}
      error={errors.sample}
      extractedLayout={session.extractedLayout}
      averageColor={session.averageColor}
    />
  );
}

function SelectRequirementsRoute() {
  const {
    wizardData,
    updateRequirements,
    submitRequirements,
    session,
    loading,
    errors,
  } = useWizard();
  const navigate = useNavigate();

  const handleBack = () =>
    navigate(`${WIZARD_BASE_PATH}/${WIZARD_STEPS[0].route}`);
  const handleNext = async () => {
    const ok = await submitRequirements();
    if (ok) {
      navigate(`${WIZARD_BASE_PATH}/${WIZARD_STEPS[2].route}`);
    }
  };

  return (
    <SelectRequirementsStep
      requirements={wizardData.requirements}
      onChange={updateRequirements}
      onBack={handleBack}
      onNext={handleNext}
      loading={loading.requirements}
      error={errors.requirements}
      stylePlan={session.stylePlan}
    />
  );
}

function UploadHouseRoute() {
  const {
    wizardData,
    selectHouse,
    submitFinal,
    loading,
    errors,
    session,
  } = useWizard();
  const navigate = useNavigate();

  const handleBack = () =>
    navigate(`${WIZARD_BASE_PATH}/${WIZARD_STEPS[1].route}`);
  const handleNext = async () => {
    const ok = await submitFinal();
    if (ok) {
      navigate(`${WIZARD_BASE_PATH}/${WIZARD_STEPS[3].route}`);
    }
  };

  return (
    <UploadHouseStep
      houseImage={wizardData.houseImage}
      sampleImage={wizardData.sampleImage}
      requirements={wizardData.requirements}
      stylePlan={session.stylePlan}
      onHouseSelected={selectHouse}
      onBack={handleBack}
      onNext={handleNext}
      loading={loading.final}
      error={errors.final}
    />
  );
}

function ResultRoute() {
  const {
    wizardData,
    recommendations,
    visibleHistory,
    saveHistory,
    restartWizard,
  } = useWizard();
  const navigate = useNavigate();

  const handleBack = () =>
    navigate(`${WIZARD_BASE_PATH}/${WIZARD_STEPS[2].route}`);

  const handleRestart = () => {
    restartWizard();
    navigate(FIRST_WIZARD_STEP_PATH, { replace: true });
  };

  return (
    <ResultStep
      data={wizardData}
      recommendations={recommendations}
      history={visibleHistory}
      onSaveHistory={saveHistory}
      onBack={handleBack}
      onRestart={handleRestart}
    />
  );
}

function HistoryRoute() {
  const { visibleHistory } = useWizard();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  return (
    <HistoryViewer
      entries={visibleHistory}
      title={isAdmin ? "Lịch sử dự án" : "Lịch sử dự án của tôi"}
      emptyMessage={
        isAdmin
          ? "Chưa có dự án nào được lưu."
          : "Bạn chưa lưu dự án nào. Hãy tạo đề xuất trong Wizard để bắt đầu."
      }
    />
  );
}

function AdminRoute() {
  const { isAdmin } = useAuth();
  const { history, updateHistoryStatus, clearHistory } = useWizard();

  if (!isAdmin) {
    return <Navigate to={FIRST_WIZARD_STEP_PATH} replace />;
  }

  const handleForceClear = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Xóa toàn bộ lịch sử demo? Thao tác này không thể hoàn tác."
      );
      if (!confirmed) {
        return;
      }
    }
    clearHistory();
  };

  return (
    <AdminDashboard
      history={history}
      onUpdateStatus={updateHistoryStatus}
      onForceClear={handleForceClear}
    />
  );
}

export default App;
