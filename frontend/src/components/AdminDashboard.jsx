import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang triển khai" },
  { value: "approved", label: "Đã phê duyệt" },
  { value: "revision", label: "Yêu cầu chỉnh sửa" },
  { value: "archived", label: "Lưu trữ" },
];

const STATUS_STYLES = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  in_progress: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  revision: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  archived: "border-slate-500/40 bg-slate-700/30 text-slate-200",
};

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
      designers: new Set(),
    };

    history.forEach((entry) => {
      if (entry.status && base[entry.status] !== undefined) {
        base[entry.status] += 1;
      }
      if (entry.createdBy) {
        base.designers.add(entry.createdBy);
      }
    });

    return {
      ...base,
      designers: base.designers.size,
    };
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((entry) => entry.status === filter);
  }, [filter, history]);

  const hasHistory = filteredHistory.length > 0;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Tổng dự án
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-200/80">
            Đã phê duyệt
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-100">
            {stats.approved}
          </p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-200/80">
            Chờ xử lý
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-100">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Nhà thiết kế tham gia
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {stats.designers}
          </p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              filter === "all"
                ? "bg-slate-100 text-slate-900"
                : "border border-slate-700 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200"
            }`}
          >
            Tất cả
          </button>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                filter === option.value
                  ? "bg-emerald-500 text-emerald-950"
                  : "border border-slate-700 text-slate-300 hover:border-emerald-400/60 hover:text-emerald-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onForceClear}
          className="rounded-full border border-rose-500/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-500/10"
        >
          Xóa lịch sử demo
        </button>
      </section>

      <section className="space-y-4">
        {hasHistory ? (
          filteredHistory.map((entry) => {
            const statusStyle =
              STATUS_STYLES[entry.status] ?? STATUS_STYLES.pending;
            const formattedDate = new Date(entry.createdAt).toLocaleString(
              "vi-VN"
            );

            return (
              <article
                key={entry.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-400/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      Mã dự án #{entry.id.slice(0, 8).toUpperCase()}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {entry.style} – {entry.colorPalette || "Chưa có bảng màu"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tạo lúc {formattedDate} bởi{" "}
                      <span className="font-medium text-slate-200">
                        {entry.createdByName || entry.createdBy || "Ẩn danh"}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyle}`}
                  >
                    Trạng thái:{" "}
                    {
                      STATUS_OPTIONS.find(
                        (option) => option.value === entry.status
                      )?.label
                    }
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="text-slate-400">Điểm nhấn:</span>{" "}
                      {entry.decorItems || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="text-slate-400">Ghi chú AI:</span>{" "}
                      {entry.aiSuggestions || "Không có"}
                    </p>
                    {entry.notes ? (
                      <p>
                        <span className="text-slate-400">
                          Ghi chú người dùng:
                        </span>{" "}
                        {entry.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1 text-sm text-slate-400">
                    <p>
                      <span className="text-slate-500">Ảnh mẫu:</span>{" "}
                      {entry.sampleImageName || "Không đính kèm"}
                    </p>
                    <p>
                      <span className="text-slate-500">Ảnh nhà thô:</span>{" "}
                      {entry.houseImageName || "Không đính kèm"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-xs uppercase tracking-widest text-slate-500">
                      Cập nhật trạng thái
                    </span>
                    <select
                      value={entry.status}
                      onChange={(event) =>
                        onUpdateStatus(entry.id, event.target.value)
                      }
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs uppercase tracking-wide text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
            Không có dự án phù hợp với bộ lọc hiện tại. Hãy quay lại chế độ
            Wizard để tạo thêm đề xuất mới.
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
