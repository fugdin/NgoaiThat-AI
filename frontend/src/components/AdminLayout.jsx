import { useMemo, useState } from "react";
import AdminDashboardPage from "./AdminDashboardPage";
import AdminUserManagement from "./AdminUserManagement";

function AdminLayout({ user, onExit }) {
  const [adminView, setAdminView] = useState("dashboard"); // 'dashboard' | 'users'

  const displayName = useMemo(() => {
    const raw = (user?.name && user.name.trim()) || user?.email || "Admin";
    return raw;
  }, [user]);

  const initials = useMemo(() => {
    const source = displayName.trim();
    if (!source) return "AD";
    const parts = source.split(/\s+/);
    const letters = parts
      .map((p) => p.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return letters || "AD";
  }, [displayName]);

  return (
    <div className="admin-shell">
      {/* Sidebar trái giống phong cách Metronic */}
      <aside className="admin-shell__sidebar" aria-label="Điều hướng quản trị">
        <div className="admin-shell__sidebar-brand">
          <div className="admin-shell__sidebar-logo">AI</div>
          <span className="admin-shell__sidebar-title">Ngoại Thất AI</span>
        </div>

        <nav className="admin-shell__sidebar-nav">
          <p className="admin-shell__sidebar-section">Tổng quan</p>
          <button
            type="button"
            className={`admin-shell__sidebar-item${
              adminView === "dashboard" ? " is-active" : ""
            }`}
            onClick={() => setAdminView("dashboard")}
          >
            <span className="admin-shell__sidebar-dot" />
            <span>Bảng điều khiển</span>
          </button>

          <p className="admin-shell__sidebar-section">Quản lý</p>
          <button
            type="button"
            className={`admin-shell__sidebar-item${
              adminView === "users" ? " is-active" : ""
            }`}
            onClick={() => setAdminView("users")}
          >
            <span className="admin-shell__sidebar-dot" />
            <span>Tài khoản người dùng</span>
          </button>
        </nav>
      </aside>

      {/* Khu vực nội dung bên phải */}
      <div className="admin-shell__content">
        <header className="admin-shell__topbar">
          <div className="admin-shell__topbar-path">
            <span className="admin-shell__crumb">Trang quản trị</span>
            <span className="admin-shell__crumb-sep">/</span>
            <span className="admin-shell__crumb-current">
              {adminView === "dashboard" ? "Bảng điều khiển" : "Người dùng"}
            </span>
          </div>

          <div className="admin-shell__topbar-meta">
            <button
              type="button"
              className="admin-shell__sidebar-exit"
              onClick={onExit}
            >
              Đi tới trang người dùng
            </button>
            <div className="admin-shell__avatar">
              <span className="admin-shell__avatar-circle">{initials}</span>
              <div>
                <p className="admin-shell__avatar-name">{displayName}</p>
                <p className="admin-shell__avatar-role">Quản trị viên</p>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-shell__main">
          {adminView === "dashboard" ? (
            <AdminDashboardPage token={user.token} />
          ) : (
            <AdminUserManagement token={user.token} />
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
