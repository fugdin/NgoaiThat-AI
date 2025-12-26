function HistoryViewer({ entries, title, emptyMessage, onDeleteHistory }) {
  return (
    <div>
      <div
        className="wizard-card__section"
        style={{ textAlign: "center", marginBottom: "32px" }}
      >
        <div style={{ fontSize: "40px" }}>???</div>
        <h2 className="wizard-card__title">{title}</h2>
        <p className="wizard-card__subtitle">
          Xem lại những phương án đã tạo để so sánh, tiếp tục chỉnh sửa hoặc trao
          đổi với khách hàng.
        </p>
      </div>

      {entries.length ? (
        <div className="history-grid">
          {entries.map((entry) => {
            const formattedDate = new Date(entry.createdAt).toLocaleString("vi-VN");
            const sampleSrc = entry.sampleImageUrl || entry.sampleImageDataUrl || "";
            const houseSrc = entry.houseImageUrl || entry.houseImageDataUrl || "";
            const resultSrc = entry.outputImageUrl || houseSrc || "";

            return (
              <article key={entry.id} className="history-card">
                <div className="tag tag--accent">
                  #{entry.id.slice(0, 8).toUpperCase()}
                </div>
                <p style={{ fontSize: "0.82rem", opacity: 0.75 }}>
                  Tạo lúc: {formattedDate}
                </p>
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
                  <strong>Trạng thái:</strong>{" "}
                  {entry.status?.replace("_", " ") || "Đang chờ"}
                </p>
                {entry.notes ? (
                  <p style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                    <strong>Ghi chú người dùng:</strong> {entry.notes}
                  </p>
                ) : null}

                {typeof onDeleteHistory === "function" ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginTop: "8px", fontSize: "0.78rem" }}
                    onClick={() => onDeleteHistory(entry.id)}
                  >
                    Xóa khỏi lịch sử
                  </button>
                ) : null}

                {resultSrc || sampleSrc || houseSrc ? (
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    {resultSrc ? (
                      <figure style={{ margin: 0 }}>
                        <img
                          src={resultSrc}
                          alt="Ảnh kết quả"
                          style={{ width: "100%", borderRadius: "12px" }}
                        />
                        {entry.resultIsOriginal ? (
                          <figcaption
                            style={{
                              fontSize: "0.75rem",
                              opacity: 0.65,
                              marginTop: "6px",
                            }}
                          >
                            Đang hiển thị ảnh gốc chưa qua xử lý.
                          </figcaption>
                        ) : null}
                      </figure>
                    ) : null}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {sampleSrc ? (
                        <figure style={{ margin: 0 }}>
                          <img
                            src={sampleSrc}
                            alt="Ảnh tham chiếu"
                            style={{ width: "100%", borderRadius: "10px" }}
                          />
                          <figcaption
                            style={{
                              fontSize: "0.72rem",
                              opacity: 0.6,
                              marginTop: "4px",
                            }}
                          >
                            Ảnh tham chiếu
                          </figcaption>
                        </figure>
                      ) : null}
                      {houseSrc ? (
                        <figure style={{ margin: 0 }}>
                          <img
                            src={houseSrc}
                            alt="Ảnh hiện trạng"
                            style={{ width: "100%", borderRadius: "10px" }}
                          />
                          <figcaption
                            style={{
                              fontSize: "0.72rem",
                              opacity: 0.6,
                              marginTop: "4px",
                            }}
                          >
                            Ảnh hiện trạng
                          </figcaption>
                        </figure>
                      ) : null}
                    </div>
                  </div>
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
