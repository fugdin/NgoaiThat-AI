function HistoryViewer({ entries, title, emptyMessage }) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-slate-100">{title}</h2>
        <p className="text-sm text-slate-400">
          Theo dõi các dự án đã lưu để tiếp tục trao đổi với khách hàng hoặc đội
          ngũ thiết kế.
        </p>
      </header>

      <div className="space-y-4">
        {entries.length ? (
          entries.map((entry) => {
            const formattedDate = new Date(entry.createdAt).toLocaleString(
              "vi-VN"
            );
            return (
              <article
                key={entry.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Mã dự án #{entry.id.slice(0, 8).toUpperCase()}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {entry.style}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tạo lúc {formattedDate}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                    Trạng thái:{" "}
                    <span className="font-semibold text-emerald-200">
                      {entry.status?.replace("_", " ") || "pending"}
                    </span>
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                  <p>
                    <span className="text-slate-400">Bảng màu:</span>{" "}
                    {entry.colorPalette || "Chưa ghi chú"}
                  </p>
                  <p>
                    <span className="text-slate-400">Điểm nhấn:</span>{" "}
                    {entry.decorItems || "Chưa ghi chú"}
                  </p>
                  <p>
                    <span className="text-slate-400">Ghi chú AI:</span>{" "}
                    {entry.aiSuggestions || "Không có"}
                  </p>
                  <p>
                    <span className="text-slate-400">Ghi chú người dùng:</span>{" "}
                    {entry.notes || "Không có"}
                  </p>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryViewer;
