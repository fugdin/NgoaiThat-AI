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
    return new Date(value).toLocaleString("vi-VN", {
      hour12: false,
    });
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
        description: "Tất cả người dùng trong hệ thống",
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
        label: "Lượt sinh (trang)",
        value: totalGenerations,
        description: "Tổng lượt sinh của danh sách hiện tại",
      },
    ];
  }, [meta, users]);

  return (
    <div className="space-y-8">
      <section className="wizard-card__section" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px" }}>🗂️</div>
        <h2 className="wizard-card__title">Quản lý tài khoản</h2>
        <p className="wizard-card__subtitle">
          Dữ liệu lấy trực tiếp từ bảng Users và Generations, giúp bạn theo dõi số lượng tài khoản và mức độ hoạt động.
        </p>

        <div className="info-grid" style={{ marginTop: "28px" }}>
          {stats.map((item) => (
            <AdminStat key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="wizard-card__section">
        <div className="timeline-card" style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
          <div style={{ flex: "1 1 240px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span className="tag">Tìm kiếm</span>
            <input
              type="search"
              className="input-text"
              placeholder="Email người dùng"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {ROLE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`btn ${roleFilter === filter.value ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setRoleFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn btn-ghost" onClick={() => refresh({ search, role: roleFilter })}>
            Làm mới
          </button>
        </div>
      </section>

      <div
        className="info-grid"
        style={{ gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", alignItems: "flex-start" }}
      >
        <section className="wizard-card__section">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h3 style={{ margin: 0 }}>Danh sách người dùng</h3>
              <p style={{ margin: 0, color: "rgba(226,233,255,0.7)", fontSize: "0.9rem" }}>
                Kết quả lọc từ cơ sở dữ liệu.
              </p>
            </div>
            <span className="tag">{meta.total} tài khoản</span>
          </header>

          {error ? (
            <div className="alert error">{error}</div>
          ) : null}

          {users.length ? (
            <div className="history-grid">
              {users.map((user) => (
                <article
                  key={user.id}
                  className="history-card"
                  style={{
                    borderColor: selectedUserId === user.id ? "rgba(255, 207, 134, 0.6)" : undefined,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                    <div>
                      <div className="tag tag--accent">#{String(user.id).padStart(4, "0")}</div>
                      <h4 style={{ margin: "6px 0 0" }}>{deriveNameFromEmail(user.email)}</h4>
                      <p style={{ margin: "4px 0", fontSize: "0.9rem", opacity: 0.75 }}>{user.email}</p>
                    </div>
                    <span className="tag">{user.role === "admin" ? "Admin" : "User"}</span>
                  </div>

                  <p style={{ margin: "10px 0", fontSize: "0.9rem" }}>
                    <strong>Ngày tạo:</strong> {formatDate(user.createdAt)}
                  </p>

                  <div className="info-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
                    <MiniStat label="Lượt sinh" value={user.generationCount} />
                    <MiniStat label="Cuối cùng" value={formatDate(user.lastGenerationAt)} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="alert info" style={{ marginTop: "16px" }}>
              {loading ? "Đang tải dữ liệu người dùng..." : "Không có người dùng nào phù hợp bộ lọc."}
            </div>
          )}

          {loading ? (
            <p style={{ marginTop: "12px", fontStyle: "italic", color: "rgba(226,233,255,0.7)" }}>
              Đang đồng bộ dữ liệu...
            </p>
          ) : null}
        </section>

        <section className="wizard-card__section">
          {selectedUser ? (
            <div className="space-y-6">
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0 }}>{deriveNameFromEmail(selectedUser.email)}</h3>
                  <p style={{ margin: "4px 0 0", color: "rgba(226,233,255,0.7)", fontSize: "0.9rem" }}>
                    {selectedUser.email}
                  </p>
                </div>
                <span className="tag">{selectedUser.role === "admin" ? "Admin" : "User"}</span>
              </header>

              <div className="timeline-card">
                <h4>Thông tin chung</h4>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, lineHeight: 1.7 }}>
                  <li>
                    <strong>ID:</strong> {selectedUser.id}
                  </li>
                  <li>
                    <strong>Tạo lúc:</strong> {formatDate(selectedUser.createdAt)}
                  </li>
                  <li>
                    <strong>Lượt sinh:</strong> {selectedUser.generationCount}
                  </li>
                  <li>
                    <strong>Hoạt động gần nhất:</strong> {formatDate(selectedUser.lastGenerationAt)}
                  </li>
                </ul>
              </div>

              <div className="timeline-card">
                <h4>Sơ kết hoạt động</h4>
                <p style={{ margin: 0, color: "rgba(226,233,255,0.75)" }}>
                  Người dùng này đã tạo {selectedUser.generationCount} lượt sinh trong hệ thống.
                </p>
                <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "rgba(226,233,255,0.65)" }}>
                  Số liệu được tổng hợp trực tiếp từ bảng Generations nên phản ánh chính xác log backend.
                </p>
              </div>
            </div>
          ) : (
            <div className="alert info">Chọn một người dùng để xem chi tiết.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function AdminStat({ label, value, description }) {
  return (
    <article className="info-card" style={{ textAlign: "left" }}>
      <p style={{ margin: 0, fontSize: "2rem", fontWeight: 600 }}>{value}</p>
      <p style={{ margin: "6px 0 0", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "rgba(226,233,255,0.7)" }}>{description}</p>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="info-card" style={{ padding: "12px 16px" }}>
      <p
        style={{
          margin: 0,
          fontSize: "0.85rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "rgba(226,233,255,0.65)",
        }}
      >
        {label}
      </p>
      <p style={{ margin: "6px 0 0", fontWeight: 600 }}>{value || "--"}</p>
    </div>
  );
}

export default AdminUserManagement;
