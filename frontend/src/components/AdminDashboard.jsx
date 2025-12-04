import { useMemo, useRef } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "approved", label: "Đã phê duyệt" },
  { value: "revision", label: "Yêu cầu chỉnh sửa" },
  { value: "archived", label: "Lưu trữ" },
];

const statusLabelMap = STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

function AdminDashboard({
  history,
  historyMeta,
  accountStats,
  accountMeta,
  selectedUser,
  selectedUserGenerations,
  selectedUserMeta,
  loading,
  errors,
  onUpdateStatus,
  onForceClear,
  onSelectAccount,
  onDeleteGeneration,
  onNextHistoryPage,
  onPrevHistoryPage,
  onNextAccountPage,
  onPrevAccountPage,
  onReloadHistory,
  onReloadAccounts,
  onNextSelectedUserPage,
  onPrevSelectedUserPage,
  onReloadSelectedUser,
}) {
  const detailRef = useRef(null);

  const statTiles = useMemo(() => {
    return [
      {
        title: "Lượt generate",
        caption: "Toàn bộ hệ thống",
        value: historyMeta?.total || history.length,
        delta: "Hiển thị 5 mục/trang",
        accent: "pink",
      },
      {
        title: "Tài khoản",
        caption: "Đang quản lý",
        value: accountMeta?.total || accountStats.length,
        delta: "Bao gồm admin và user",
        accent: "green",
      },
      {
        title: "Trang hiện tại",
        caption: "Điều hướng danh sách",
        value: `${historyMeta?.page || 1}/${Math.max(
          1,
          Math.ceil((historyMeta?.total || 1) / (historyMeta?.pageSize || 5))
        )}`,
        delta: "Nhấn kế tiếp để xem thêm",
        accent: "violet",
      },
    ];
  }, [
    accountMeta?.total,
    accountStats.length,
    history.length,
    historyMeta?.page,
    historyMeta?.pageSize,
    historyMeta?.total,
  ]);

  return (
    <section className="admin-surface" aria-label="Bảng điều khiển quản trị">
      {/* Hàng thống kê tổng quan */}
      <div className="admin-grid admin-grid--stats">
        {statTiles.map((tile) => (
          <StatTile key={tile.title} {...tile} />
        ))}
      </div>

      {/* Hàng 2: Theo tài khoản + Hoạt động nổi bật */}
      <div className="admin-panel admin-panel--split">
        <article className="admin-card admin-card--table">
          <header className="admin-card__header admin-card__header--table">
            <div>
              <p className="admin-eyebrow">Theo tài khoản</p>
              <h3>Thống kê theo tài khoản</h3>
            </div>
            <div className="admin-card__meta">
              {accountMeta.total} tài khoản • {accountMeta.pageSize} mục/trang
            </div>
          </header>

          {errors?.users ? <div className="admin-empty">{errors.users}</div> : null}

          {loading?.users ? (
            <div className="admin-empty">Đang tải danh sách tài khoản...</div>
          ) : accountStats.length ? (
            <div className="admin-table" role="table">
              <div className="admin-table__head" role="rowgroup">
                <span role="columnheader">Email</span>
                <span role="columnheader">Quyền</span>
                <span role="columnheader">Lượt generate</span>
                <span role="columnheader">Gần nhất</span>
              </div>
              <div className="admin-table__body" role="rowgroup">
                {accountStats.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className={`admin-table__row admin-table__row--clickable${
                      selectedUser && selectedUser.id === user.id
                        ? " is-active"
                        : ""
                    }`}
                    role="row"
                    onClick={() => {
                      onSelectAccount && onSelectAccount(user);
                      if (detailRef.current) {
                        detailRef.current.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <div className="admin-table__cell" role="cell">
                      <p className="admin-table__title">{user.email}</p>
                    </div>
                    <div className="admin-table__cell" role="cell">
                      <span
                        className={`admin-badge admin-badge--${
                          user.role === "admin" ? "accent" : "muted"
                        }`}
                      >
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                    <div className="admin-table__cell" role="cell">
                      <p className="admin-table__value">
                        {user.generationCount || 0}
                      </p>
                    </div>
                    <div className="admin-table__cell" role="cell">
                      <p className="admin-table__muted">
                        {formatDateTime(user.lastGenerationAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="admin-empty">
              Chưa có tài khoản nào có lượt generate.
            </div>
          )}

          <PaginationControls
            page={accountMeta.page}
            pageSize={accountMeta.pageSize}
            total={accountMeta.total}
            loading={loading?.users}
            onPrev={onPrevAccountPage}
            onNext={onNextAccountPage}
            onReload={onReloadAccounts}
          />
        </article>

        <article className="admin-card admin-card--spotlight">
          <header className="admin-card__header admin-card__header--tight">
            <div>
              <p className="admin-eyebrow">Hoạt động nổi bật</p>
              <h3>5 lượt mới nhất</h3>
            </div>
          </header>
          <div className="admin-spotlight__list">
            {history.length ? (
              history.map((entry) => (
                <div key={entry.id} className="admin-spotlight__item">
                  <div className="admin-spotlight__preview">
                    <span>{(entry.style || "AI").slice(0, 1)}</span>
                  </div>
                  <div>
                    <p className="admin-spotlight__title">
                      {entry.style || "Ý tưởng mới"}
                    </p>
                    <p className="admin-spotlight__meta">
                      {statusLabelMap[entry.status || "pending"]} •{" "}
                      {formatDateTime(entry.createdAt)}
                    </p>
                    <p className="admin-spotlight__description">
                      {entry.aiSuggestions || "Đang chờ AI bổ sung."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="admin-spotlight__placeholder">
                Chưa có hoạt động nào. Tạo một lượt generate để bắt đầu.
              </p>
            )}
          </div>
        </article>
      </div>

      {/* Hàng 3: Chi tiết theo tài khoản */}
      <div className="admin-panel">
        <article
          ref={detailRef}
          className="admin-card admin-card--table"
        >
          <header className="admin-card__header admin-card__header--tight">
            <div>
              <p className="admin-eyebrow">
                {selectedUser ? "Chi tiết theo tài khoản" : "Chọn một tài khoản"}
              </p>
              <h3>
                {selectedUser
                  ? `Lịch sử generate của ${selectedUser.email}`
                  : "Chưa chọn tài khoản"}
              </h3>
            </div>
          </header>

          {errors?.selectedUser ? (
            <div className="admin-empty">{errors.selectedUser}</div>
          ) : null}

          {!selectedUser ? (
            <div className="admin-empty">
              Hãy chọn một dòng trong bảng "Thống kê theo tài khoản" để xem chi tiết.
            </div>
          ) : loading?.selectedUser ? (
            <div className="admin-empty">
              Đang tải chi tiết lịch sử cho tài khoản đã chọn...
            </div>
          ) : selectedUserGenerations && selectedUserGenerations.length ? (
            <>
              <div className="admin-table" role="table">
                <div className="admin-table__head" role="rowgroup">
                  <span role="columnheader">Dự án</span>
                  <span role="columnheader">Thời gian</span>
                  <span role="columnheader">Mô tả</span>
                  <span role="columnheader">Thao tác</span>
                </div>
                <div className="admin-table__body" role="rowgroup">
                  {selectedUserGenerations.map((item) => (
                    <div
                      key={item.Id}
                      className="admin-table__row"
                      role="row"
                    >
                      <div className="admin-table__cell" role="cell">
                        <p className="admin-table__title">
                          {item.Style || "Ngoại thất"}
                        </p>
                        <p className="admin-table__muted">
                          #{String(item.Id).slice(0, 8)}
                        </p>
                      </div>
                      <div className="admin-table__cell" role="cell">
                        <p className="admin-table__value">
                          {formatDateTime(item.CreatedAt)}
                        </p>
                      </div>
                      <div className="admin-table__cell" role="cell">
                        <p className="admin-table__muted">
                          {item.InputDesc || item.Description || "Chưa có mô tả."}
                        </p>
                      </div>
                      <div className="admin-table__cell admin-table__cell--action" role="cell">
                        <button
                          type="button"
                          className="admin-button admin-button--danger"
                          onClick={() =>
                            onDeleteGeneration && onDeleteGeneration(item.Id)
                          }
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <PaginationControls
                page={selectedUserMeta.page}
                pageSize={selectedUserMeta.pageSize}
                total={selectedUserMeta.total}
                loading={loading?.selectedUser}
                onPrev={onPrevSelectedUserPage}
                onNext={onNextSelectedUserPage}
                onReload={onReloadSelectedUser}
              />
            </>
          ) : (
            <div className="admin-empty">
              Tài khoản này chưa có bản ghi generate nào.
            </div>
          )}
        </article>
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

function PaginationControls({ page, pageSize, total, loading, onPrev, onNext, onReload }) {
  const maxPage = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  return (
    <div className="admin-pagination">
      <button
        type="button"
        className="admin-button admin-button--ghost"
        onClick={onPrev}
        disabled={loading || page <= 1}
      >
        Trang trước
      </button>
      <span className="admin-card__meta">
        Trang {page} / {maxPage}
      </span>
      <button
        type="button"
        className="admin-button"
        onClick={onNext}
        disabled={loading || page >= maxPage}
      >
        Kế tiếp
      </button>
      {onReload ? (
        <button type="button" className="admin-icon-button" onClick={onReload} disabled={loading}>
          Tải lại
        </button>
      ) : null}
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
