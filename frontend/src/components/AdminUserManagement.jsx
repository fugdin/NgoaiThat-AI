import { useEffect, useMemo, useState } from "react";
import useAdminUsers from "../hooks/useAdminUsers";

const ROLE_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "Người dùng" },
];

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  try {
    return new Date(value).toLocaleString("vi-VN", { hour12: false });
  } catch (_error) {
    return value;
  }
}

function deriveNameFromEmail(email = "") {
  if (!email) return "Người dùng";
  const localPart = email.split("@")[0] || email;
  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function AdminUserManagement({ token }) {
  const { users, loading, error, meta, refresh } = useAdminUsers(token);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      refresh({ page: 1, search, role: roleFilter });
    }, 350);
    return () => clearTimeout(handler);
  }, [search, roleFilter, refresh]);

  useEffect(() => {
    if (!users.length) {
      setSelectedUserId(null);
      return;
    }
    if (!selectedUserId || !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0].id);
    }
  }, [users, selectedUserId]);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  const stats = useMemo(() => {
    const totalUsers = meta.total || 0;
    const adminCount = meta.roleSummary?.admin || 0;
    const userCount = meta.roleSummary?.user || 0;
    const totalGenerations = users.reduce(
      (sum, entry) => sum + (entry.generationCount || 0),
      0
    );
    return [
      {
        label: "Tổng tài khoản",
        value: totalUsers,
        description: "Toàn bộ người dùng",
      },
      {
        label: "Admin",
        value: adminCount,
        description: "Quyền quản trị",
      },
      {
        label: "Người dùng",
        value: userCount,
        description: "Tài khoản tiêu chuẩn",
      },
      {
        label: "Lượt sinh",
        value: totalGenerations,
        description: "Tổng lượt sinh hiển thị",
      },
    ];
  }, [meta, users]);

  return (
    <section className="admin-surface" aria-label="Quản lý tài khoản">
      <div className="admin-panel admin-panel--split">
        <article className="admin-card admin-card--users">
          <header className="admin-card__header">
            <div>
              <p className="admin-eyebrow">Người dùng</p>
              <h2>Ảnh hưởng toàn hệ thống</h2>
            </div>
            <span className="admin-pill">{meta.total} tài khoản</span>
          </header>
          <p className="admin-card__lead">
            Theo dõi phân bổ quyền truy cập và mức độ sử dụng AI của từng người dùng.
          </p>
          <div className="admin-grid admin-grid--stats">
            {stats.map((item) => (
              <UserStat key={item.label} {...item} />
            ))}
          </div>
        </article>

        <aside className="admin-card admin-card--filters">
          <label className="admin-input__label" htmlFor="user-search">
            Tìm kiếm
          </label>
          <div className="admin-input">
            <input
              id="user-search"
              type="search"
              placeholder="Nhập email hoặc tên người dùng"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <p className="admin-eyebrow">Phân quyền</p>
          <div className="admin-chip-group admin-chip-group--wrap">
            {ROLE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`admin-chip ${roleFilter === filter.value ? "is-active" : ""}`}
                onClick={() => setRoleFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="admin-button"
            onClick={() => refresh({ search, role: roleFilter })}
          >
            Làm mới dữ liệu
          </button>
          {loading ? (
            <p className="admin-card__meta">Đang đồng bộ...</p>
          ) : (
            <p className="admin-card__meta">
              {meta.total} tài khoản · cập nhật {new Date().toLocaleTimeString("vi-VN")}
            </p>
          )}
        </aside>
      </div>

      <div className="admin-panel admin-panel--columns">
        <article className="admin-card admin-card--table">
          <header className="admin-card__header admin-card__header--table">
            <div>
              <p className="admin-eyebrow">Danh sách người dùng</p>
              <h3>Kết quả lọc hiện tại</h3>
            </div>
            <span className="admin-pill admin-pill--ghost">
              {users.length} mục
            </span>
          </header>

          {error ? <div className="admin-empty">{error}</div> : null}

          {users.length ? (
            <div className="admin-user-list">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`admin-user ${selectedUserId === user.id ? "is-active" : ""}`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div className="admin-user__avatar">
                    {deriveNameFromEmail(user.email).slice(0, 2)}
                  </div>
                  <div className="admin-user__body">
                    <div className="admin-user__row">
                      <strong>{deriveNameFromEmail(user.email)}</strong>
                      <span className={`admin-badge admin-badge--${user.role === "admin" ? "accent" : "muted"}`}>
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                    <p>{user.email}</p>
                    <div className="admin-user__meta">
                      <span>Lượt sinh: {user.generationCount || 0}</span>
                      <span>Tạo: {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              {loading ? "Đang tải dữ liệu người dùng..." : "Không có người dùng nào phù hợp bộ lọc."}
            </div>
          )}
        </article>

        <aside className="admin-card admin-card--spotlight">
          {selectedUser ? (
            <div>
              <header className="admin-card__header admin-card__header--tight">
                <div>
                  <p className="admin-eyebrow">Chi tiết</p>
                  <h3>{deriveNameFromEmail(selectedUser.email)}</h3>
                </div>
                <span className="admin-pill">
                  {selectedUser.role === "admin" ? "Admin" : "User"}
                </span>
              </header>
              <ul className="admin-detail-list">
                <li>
                  <p>ID</p>
                  <strong>{selectedUser.id}</strong>
                </li>
                <li>
                  <p>Email</p>
                  <strong>{selectedUser.email}</strong>
                </li>
                <li>
                  <p>Tạo lúc</p>
                  <strong>{formatDate(selectedUser.createdAt)}</strong>
                </li>
                <li>
                  <p>Hoạt động cuối</p>
                  <strong>{formatDate(selectedUser.lastGenerationAt)}</strong>
                </li>
                <li>
                  <p>Tổng lượt sinh</p>
                  <strong>{selectedUser.generationCount || 0}</strong>
                </li>
              </ul>
            </div>
          ) : (
            <div className="admin-empty">
              Chọn một tài khoản để xem chi tiết hoạt động.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function UserStat({ label, value, description }) {
  return (
    <article className="admin-stat admin-stat--light">
      <h4>{value}</h4>
      <p>{label}</p>
      <span>{description}</span>
    </article>
  );
}

export default AdminUserManagement;

