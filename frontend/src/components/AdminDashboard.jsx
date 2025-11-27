import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "approved", label: "Đã phê duyệt" },
  { value: "revision", label: "Yêu cầu chỉnh sửa" },
  { value: "archived", label: "Lưu trữ" },
];

const DEMO_PRESETS = [
  {
    id: "demo-1",
    name: "Demo 1",
    description: "Dashboard + Wizards",
    accent: "pink",
  },
  {
    id: "demo-2",
    name: "Demo 2",
    description: "Analytics + Tables",
    accent: "blue",
  },
  {
    id: "demo-3",
    name: "Demo 3",
    description: "Commerce + Orders",
    accent: "violet",
  },
];

const statusLabelMap = STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

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
      const key = entry.status || "pending";
      if (base[key] !== undefined) {
        base[key] += 1;
      } else {
        base.pending += 1;
      }
    });
    return base;
  }, [history]);

  const filtered = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((entry) => entry.status === filter);
  }, [filter, history]);

  const weeklyActivity = useMemo(() => {
    const countsByDate = history.reduce((acc, entry) => {
      if (!entry.createdAt) return acc;
      const dateKey = new Date(entry.createdAt).toDateString();
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});
    const days = [];
    const today = new Date();
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      const key = day.toDateString();
      const label = day
        .toLocaleDateString("vi-VN", { weekday: "short" })
        .replace(".", "");
      days.push({ label, value: countsByDate[key] || 0 });
    }
    const hasValue = days.some((item) => item.value > 0);
    if (!hasValue) {
      const fallback = [4, 6, 5, 7, 6, 9, 8];
      return days.map((item, index) => ({ ...item, value: fallback[index] }));
    }
    return days;
  }, [history]);

  const inboundBandwidth = useMemo(() => {
    return stats.pending * 12 + stats.in_progress * 18 + stats.total * 4;
  }, [stats]);

  const outboundBandwidth = useMemo(() => {
    return stats.approved * 22 + stats.revision * 6 + stats.total * 3;
  }, [stats]);

  const spotlightEntries = useMemo(() => {
    return [...history]
      .sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || 0;
        const dateB = b.updatedAt || b.createdAt || 0;
        return new Date(dateB) - new Date(dateA);
      })
      .slice(0, 4);
  }, [history]);

  const statTiles = useMemo(() => {
    return [
      {
        title: "Delivered",
        caption: "Dự án đã bàn giao",
        value: stats.approved,
        delta: "+18% tuần này",
        accent: "pink",
      },
      {
        title: "Ordered",
        caption: "Đơn mới nhận",
        value: stats.pending + stats.in_progress,
        delta: "+72 items",
        accent: "green",
      },
      {
        title: "In review",
        caption: "Chờ xác nhận",
        value: stats.revision,
        delta: "Cần phản hồi",
        accent: "amber",
      },
    ];
  }, [stats]);

  return (
    <section className="admin-surface" aria-label="Bảng điều khiển quản trị">
      <div className="admin-panel admin-panel--split">
        <article className="admin-card admin-card--activity">
          <header className="admin-card__header">
            <div>
              <p className="admin-eyebrow">Hoạt động</p>
              <h2>Biểu đồ công việc</h2>
            </div>
            <span className="admin-pill admin-pill--ghost">Expert</span>
          </header>
          <p className="admin-card__lead">
            Theo dõi khối lượng xử lý của đội thiết kế trong 7 ngày gần nhất.
          </p>
          <ActivityChart data={weeklyActivity} />
          <div className="admin-bandwidth">
            <BandwidthStat
              label="Inbound Bandwidth"
              value={`${inboundBandwidth}+`}
              caption="Successful transactions"
              accent="teal"
            />
            <BandwidthStat
              label="Outbound Bandwidth"
              value={`${outboundBandwidth}+`}
              caption="Completed orders"
              accent="purple"
            />
          </div>
        </article>

        <aside className="admin-card admin-card--demo" aria-label="Bộ sưu tập giao diện">
          <header className="admin-card__header admin-card__header--tight">
            <div>
              <p className="admin-eyebrow">Select a demo</p>
              <h3>AI Admin Kit</h3>
            </div>
            <button type="button" className="admin-icon-button" onClick={onForceClear}>
              Xóa dữ liệu demo
            </button>
          </header>
          <div className="admin-demo__list">
            {DEMO_PRESETS.map((demo, index) => (
              <DemoPreview
                key={demo.id}
                demo={demo}
                isActive={index === 0}
              />
            ))}
          </div>
        </aside>
      </div>

      <div className="admin-grid admin-grid--stats">
        {statTiles.map((tile) => (
          <StatTile key={tile.title} {...tile} />
        ))}
      </div>

      <article className="admin-card">
        <div className="admin-filter">
          <div>
            <p className="admin-eyebrow">Bộ lọc trạng thái</p>
            <h3>Điều phối tiến độ</h3>
          </div>
          <div className="admin-chip-group" role="group" aria-label="Chọn trạng thái">
            <button
              type="button"
              className={`admin-chip ${filter === "all" ? "is-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Tất cả ({stats.total})
            </button>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`admin-chip ${filter === option.value ? "is-active" : ""}`}
                onClick={() => setFilter(option.value)}
              >
                {option.label} ({stats[option.value]})
              </button>
            ))}
          </div>
          <button type="button" className="admin-button admin-button--ghost" onClick={onForceClear}>
            Làm sạch dữ liệu demo
          </button>
        </div>
      </article>

      <div className="admin-panel admin-panel--columns">
        <article className="admin-card admin-card--table">
          <header className="admin-card__header admin-card__header--table">
            <div>
              <p className="admin-eyebrow">Danh sách dự án</p>
              <h3>
                {filter === "all"
                  ? "Tất cả đề xuất"
                  : statusLabelMap[filter] || "Đề xuất"}
              </h3>
            </div>
            <p className="admin-card__meta">
              {filtered.length} mục · cập nhật theo thời gian thực
            </p>
          </header>

          {filtered.length ? (
            <div className="admin-table" role="table">
              <div className="admin-table__head" role="rowgroup">
                <span role="columnheader">Dự án</span>
                <span role="columnheader">Khách hàng</span>
                <span role="columnheader">Tổng quan</span>
                <span role="columnheader">Trạng thái</span>
              </div>
              <div className="admin-table__body" role="rowgroup">
                {filtered.map((entry) => (
                  <div key={entry.id} className="admin-table__row" role="row">
                    <div className="admin-table__cell" role="cell">
                      <p className="admin-table__title">
                        {entry.style || "Ngoại thất hiện đại"}
                      </p>
                      <span className="admin-badge">
                        #{String(entry.id).slice(0, 6)}
                      </span>
                    </div>
                    <div className="admin-table__cell" role="cell">
                      <p className="admin-table__label">Khách hàng</p>
                      <p className="admin-table__value">
                        {entry.createdByName || entry.createdBy || "Ẩn danh"}
                      </p>
                      <p className="admin-table__muted">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                    <div className="admin-table__cell" role="cell">
                      <p className="admin-table__label">Ghi chú</p>
                      <p className="admin-table__value">
                        {entry.aiSuggestions || "Chưa có mô tả chi tiết."}
                      </p>
                    </div>
                    <div className="admin-table__cell admin-table__cell--action" role="cell">
                      <label className="admin-table__label" htmlFor={`status-${entry.id}`}>
                        Trạng thái
                      </label>
                      <select
                        id={`status-${entry.id}`}
                        value={entry.status || "pending"}
                        onChange={(event) => onUpdateStatus(entry.id, event.target.value)}
                        className="admin-select"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="admin-empty">
              <p>Không có dự án nào khớp với bộ lọc hiện tại.</p>
            </div>
          )}
        </article>

        <aside className="admin-card admin-card--spotlight">
          <header className="admin-card__header admin-card__header--tight">
            <div>
              <p className="admin-eyebrow">Hoạt động gần đây</p>
              <h3>Spotlight</h3>
            </div>
          </header>
          <div className="admin-spotlight__list">
            {spotlightEntries.length ? (
              spotlightEntries.map((entry) => (
                <div key={entry.id} className="admin-spotlight__item">
                  <div className="admin-spotlight__preview">
                    <span>{(entry.style || "AI").slice(0, 1)}</span>
                  </div>
                  <div>
                    <p className="admin-spotlight__title">
                      {entry.style || "Ý tưởng mới"}
                    </p>
                    <p className="admin-spotlight__meta">
                      {statusLabelMap[entry.status || "pending"]} ·{" "}
                      {formatDateTime(entry.updatedAt || entry.createdAt)}
                    </p>
                    <p className="admin-spotlight__description">
                      {entry.aiSuggestions || "Đang chờ AI bổ sung."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-spotlight__placeholder">
                Chưa có hoạt động nào. Hãy tạo vài đề xuất để bắt đầu.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function StatTile({ title, caption, value, delta, accent }) {
  return (
    <article className={`admin-stat admin-stat--${accent}`}>
      <div>
        <p className="admin-eyebrow">{caption}</p>
        <h4>{title}</h4>
      </div>
      <p className="admin-stat__value">{value}</p>
      <p className="admin-stat__delta">{delta}</p>
    </article>
  );
}

function BandwidthStat({ label, value, caption, accent }) {
  return (
    <div className={`admin-bandwidth__card admin-bandwidth__card--${accent}`}>
      <p className="admin-eyebrow">{label}</p>
      <p className="admin-bandwidth__value">{value}</p>
      <p className="admin-bandwidth__caption">{caption}</p>
    </div>
  );
}

function DemoPreview({ demo, isActive }) {
  return (
    <button type="button" className={`admin-demo ${isActive ? "is-active" : ""}`}>
      <div className={`admin-demo__figure admin-demo__figure--${demo.accent}`} />
      <div className="admin-demo__text">
        <p>{demo.name}</p>
        <span>{demo.description}</span>
      </div>
      <span className="admin-demo__cta">Xem</span>
    </button>
  );
}

function ActivityChart({ data }) {
  if (!data.length) {
    return null;
  }
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const gradientId = "adminChartGradient";

  return (
    <div className="admin-chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Biểu đồ hoạt động 7 ngày">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 99, 132, 0.45)" />
            <stop offset="100%" stopColor="rgba(255, 99, 132, 0)" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="rgba(236, 72, 153, 0.9)"
          strokeWidth="1.8"
          points={points}
        />
        <polygon
          fill={`url(#${gradientId})`}
          points={`0,100 ${points} 100,100`}
        />
      </svg>
      <div className="admin-chart__labels">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";
  try {
    return new Date(value).toLocaleString("vi-VN", { hour12: false });
  } catch (_error) {
    return value;
  }
}

export default AdminDashboard;
