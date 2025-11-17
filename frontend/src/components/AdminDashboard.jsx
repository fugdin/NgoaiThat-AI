import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "approved", label: "Đã phê duyệt" },
  { value: "revision", label: "Yêu cầu chỉnh sửa" },
  { value: "archived", label: "Lưu trữ" },
];

function AdminDashboard({ history, onUpdateStatus, onForceClear }) {
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    const base = {
      total: history.length,
      pending: 0,
      in_progress: 0,
      approved: 0,
      revision: 0,
      archived: 0,
    };
    history.forEach((entry) => {
      if (entry.status && base[entry.status] !== undefined) {
        base[entry.status] += 1;
      }
    });
    return base;
  }, [history]);

  const filtered = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((entry) => entry.status === filter);
  }, [filter, history]);

  return (
    <div>
      <div className="wizard-card__section" style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "40px" }}>📊</div>
        <h2 className="wizard-card__title">Bảng điều khiển quản trị</h2>
        <p className="wizard-card__subtitle">
          Theo dõi các đề xuất do đội ngũ thiết kế tạo ra, cập nhật trạng thái và làm sạch dữ liệu demo khi cần.
        </p>

        <div style={{ marginTop: "28px" }}>
          <div className="info-grid" style={{ marginBottom: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            <AdminStat label="Tổng dự án" value={stats.total} icon="📁" />
            <AdminStat label="Chờ xử lý" value={stats.pending} icon="⏳" />
            <AdminStat label="Đang thực hiện" value={stats.in_progress} icon="🚧" />
            <AdminStat label="Đã duyệt" value={stats.approved} icon="✅" />
            <AdminStat label="Chờ chỉnh sửa" value={stats.revision} icon="🛠️" />
            <AdminStat label="Đã lưu trữ" value={stats.archived} icon="📦" />
          </div>

          <div className="info-card" style={{ textAlign: "left" }}>
            <h3 style={{ marginTop: 0 }}>Tổng quan trạng thái</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "16px" }}>
              <MiniStat label="Đang hoạt động" value={stats.in_progress + stats.pending} />
              <MiniStat label="Đã hoàn tất" value={stats.approved + stats.archived} />
              <MiniStat label="Cần chú ý" value={stats.revision} />
            </div>
          </div>
        </div>
      </div>

      <div className="wizard-card__section">
        <div className="timeline-card" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <div className="tag" style={{ background: "rgba(44,51,80,0.75)" }}>Lọc trạng thái</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <button
              type="button"
              className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`btn ${filter === option.value ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={onForceClear}>
            Xóa lịch sử demo
          </button>
        </div>
      </div>

      <div className="history-grid">
        {filtered.length ? (
          filtered.map((entry) => (
            <article key={entry.id} className="history-card">
              <div className="tag tag--accent">#{entry.id.slice(0, 8).toUpperCase()}</div>
              <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                Tạo lúc: {new Date(entry.createdAt).toLocaleString("vi-VN")}
              </p>
              <p><strong>Người tạo:</strong> {entry.createdByName || entry.createdBy}</p>
              <p><strong>Phong cách:</strong> {entry.style}</p>
              <p><strong>Bảng màu:</strong> {entry.colorPalette || "Chưa cung cấp"}</p>
              <p><strong>Điểm nhấn:</strong> {entry.decorItems || "Chưa cung cấp"}</p>
              <p><strong>Ghi chú AI:</strong> {entry.aiSuggestions || "Không có"}</p>
              <div style={{ marginTop: "12px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                  Cập nhật trạng thái
                </label>
                <select
                  value={entry.status}
                  onChange={(event) => onUpdateStatus(entry.id, event.target.value)}
                  className="input-text"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))
        ) : (
          <div className="alert info">Không có dự án nào phù hợp bộ lọc hiện tại.</div>
        )}
      </div>
    </div>
  );
}

function AdminStat({ label, value, icon }) {
  return (
    <div className="info-card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>{icon}</div>
      <h3 style={{ margin: 0 }}>{value}</h3>
      <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>{label}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{
      borderRadius: "14px",
      padding: "12px 16px",
      background: "rgba(12,18,32,0.85)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <p style={{ margin: 0, fontSize: "0.85rem", letterSpacing: "0.06em", color: "rgba(226,233,255,0.7)" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: "1.5rem", fontWeight: 600 }}>{value}</p>
    </div>
  );
}

export default AdminDashboard;
