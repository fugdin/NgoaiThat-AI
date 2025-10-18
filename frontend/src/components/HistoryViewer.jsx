function HistoryViewer({ entries, title, emptyMessage }) {
  return (
    <div>
      <div className="wizard-card__section" style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "40px" }}>🗂️</div>
        <h2 className="wizard-card__title">{title}</h2>
        <p className="wizard-card__subtitle">
          Xem lại những phương án đã tạo để so sánh, tiếp tục chỉnh sửa hoặc trao đổi với khách hàng.
        </p>
      </div>

      {entries.length ? (
        <div className="history-grid">
          {entries.map((entry) => {
            const formattedDate = new Date(entry.createdAt).toLocaleString("vi-VN");
            return (
              <article key={entry.id} className="history-card">
                <div className="tag tag--accent">#{entry.id.slice(0, 8).toUpperCase()}</div>
                <p style={{ fontSize: "0.82rem", opacity: 0.75 }}>Tạo lúc: {formattedDate}</p>
                <h3 style={{ margin: 0 }}>{entry.style}</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                  <strong>Bảng màu:</strong> {entry.colorPalette || "Chưa ghi chú"}
                </p>
                <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                  <strong>Điểm nhấn:</strong> {entry.decorItems || "Chưa ghi chú"}
                </p>
                <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                  <strong>Ghi chú AI:</strong> {entry.aiSuggestions || "Không có"}
                </p>
                <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                  <strong>Trạng thái:</strong> {entry.status?.replace("_", " ") || "Đang chờ"}
                </p>
                {entry.notes ? (
                  <p style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                    <strong>Ghi chú người dùng:</strong> {entry.notes}
                  </p>
                ) : null}
                {entry.outputImageUrl ? (
                  <img src={entry.outputImageUrl} alt="Ảnh đã lưu" />
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="alert info">{emptyMessage}</div>
      )}
    </div>
  );
}

export default HistoryViewer;
