import { useMemo, useState } from "react";

function ProfilePage({ user, historyEntries = [], draft, onDeleteHistory }) {
  const {
    requirements = { style: "", colorPalette: "", decorItems: "", aiSuggestions: "" },
    sampleImage = null,
    houseImage = null,
  } = draft || {};

  const [expandedId, setExpandedId] = useState(null);

  const hasDraftDetails =
    Boolean(sampleImage || houseImage) ||
    Boolean(
      requirements.colorPalette ||
        requirements.decorItems ||
        requirements.aiSuggestions ||
        requirements.style
    );

  const sortedHistory = useMemo(() => {
    return [...historyEntries].sort((a, b) => {
      const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [historyEntries]);

  const toggleExpanded = (entryId) => {
    setExpandedId((current) => (current === entryId ? null : entryId));
  };

  return (
    <div className="space-y-8">
      <div className="wizard-card__section">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px" }}>👤</div>
          <h2 className="wizard-card__title">Hồ sơ cá nhân</h2>
          <p className="wizard-card__subtitle">
            Quản lý thông tin tài khoản, xem lịch sử và những bản nháp bạn đang thực hiện.
          </p>
        </div>

        <div className="info-grid" style={{ gap: "20px" }}>
          <article className="info-card" style={{ textAlign: "left" }}>
            <h3>Thông tin tài khoản</h3>
            <p style={{ marginTop: "12px" }}>
              <strong>Tên hiển thị:</strong> {user?.name || "Chưa cập nhật"}
            </p>
            <p style={{ marginTop: "8px" }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ marginTop: "8px" }}>
              <strong>Vai trò:</strong> {user?.role === "admin" ? "Quản trị viên" : "Nhà thiết kế"}
            </p>
          </article>

          <article className="info-card" style={{ textAlign: "left" }}>
            <h3>Yêu cầu đang soạn</h3>
            {hasDraftDetails ? (
              <ul style={{ marginTop: "12px", paddingLeft: "20px", lineHeight: 1.6 }}>
                <li>
                  <strong>Phong cách:</strong> {requirements.style || "Chưa chọn"}
                </li>
                <li>
                  <strong>Bảng màu:</strong> {requirements.colorPalette || "Chưa nhập"}
                </li>
                <li>
                  <strong>Điểm nhấn:</strong> {requirements.decorItems || "Chưa nhập"}
                </li>
                <li>
                  <strong>Ghi chú AI:</strong> {requirements.aiSuggestions || "Không có"}
                </li>
                <li>
                  <strong>Ảnh mẫu:</strong> {sampleImage?.file?.name || sampleImage?.name || "Chưa tải lên"}
                </li>
                <li>
                  <strong>Ảnh hiện trạng:</strong> {houseImage?.file?.name || houseImage?.name || "Chưa tải lên"}
                </li>
              </ul>
            ) : (
              <p style={{ marginTop: "12px", opacity: 0.7 }}>
                Bạn chưa bắt đầu hoặc đang ở bước đầu tiên của một yêu cầu mới.
              </p>
            )}
          </article>
        </div>
      </div>

      <div className="wizard-card__section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ marginBottom: "8px" }}>Lịch sử yêu cầu của bạn</h3>
            <p style={{ color: "rgba(226,233,255,0.75)" }}>
              Theo dõi tiến trình và các phương án đã gửi trước đó.
            </p>
          </div>
          <span className="tag">{sortedHistory.length} dự án</span>
        </div>

        {sortedHistory.length ? (
          <div className="history-grid" style={{ marginTop: "18px" }}>
            {sortedHistory.map((entry) => {
              const formattedDate = entry?.createdAt
                ? new Date(entry.createdAt).toLocaleString("vi-VN")
                : "Chưa cập nhật";
              const isExpanded = expandedId === entry.id;
              const hasSampleImage = Boolean(entry.sampleImageDataUrl);
              const hasHouseImage = Boolean(entry.houseImageDataUrl);
              const hasResultImage = Boolean(entry.outputImageUrl);
              return (
                <article key={entry.id} className="history-card">
                  <div className="tag tag--accent">
                    #{(entry.id || "").slice(0, 8).toUpperCase() || "YEUCAU"}
                  </div>
                  <p style={{ fontSize: "0.82rem", opacity: 0.75 }}>Tạo lúc: {formattedDate}</p>
                  <p>
                    <strong>Phong cách:</strong> {entry.style || "Chưa ghi chú"}
                  </p>
                  <p>
                    <strong>Bảng màu:</strong> {entry.colorPalette || "Chưa ghi chú"}
                  </p>
                  <p>
                    <strong>Điểm nhấn:</strong> {entry.decorItems || "Chưa ghi chú"}
                  </p>
                  <p>
                    <strong>Ghi chú AI:</strong> {entry.aiSuggestions || "Không có"}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {entry.status?.replace("_", " ") || "Đang chờ"}
                  </p>
                  {entry.notes ? (
                    <p style={{ fontSize: "0.8rem", opacity: 0.65 }}>
                      <strong>Ghi chú người dùng:</strong> {entry.notes}
                    </p>
                  ) : null}

                  {typeof onDeleteHistory === "function" ? (
                    <button
                      type="button"
                      onClick={() => onDeleteHistory(entry.id)}
                      className="btn btn-secondary"
                      style={{
                        marginTop: "8px",
                        alignSelf: "flex-start",
                        fontSize: "0.75rem",
                      }}
                    >
                      Xóa yêu cầu này
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => toggleExpanded(entry.id)}
                    className="btn btn-secondary"
                    style={{
                      marginTop: "12px",
                      alignSelf: "flex-start",
                      fontSize: "0.75rem",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {isExpanded ? "Thu gọn" : "Xem chi tiết các bước"}
                  </button>

                  {isExpanded ? (
                    <div
                      style={{
                        marginTop: "18px",
                        borderRadius: "16px",
                        border: "1px solid rgba(148, 163, 209, 0.18)",
                        background: "rgba(12, 18, 32, 0.75)",
                        padding: "16px 18px",
                        display: "grid",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.92rem", letterSpacing: "0.06em" }}>
                          Tóm tắt quy trình
                        </h4>
                        <ul
                          style={{
                            marginTop: "10px",
                            paddingLeft: "20px",
                            lineHeight: 1.65,
                            fontSize: "0.85rem",
                            color: "rgba(226,233,255,0.75)",
                          }}
                        >
                          <li>
                            <strong>Bước 01:</strong> Chọn ảnh mẫu {entry.sampleImageName ? `(${entry.sampleImageName})` : ""}
                          </li>
                          <li>
                            <strong>Bước 02:</strong> Thiết lập phong cách "{entry.style || "Chưa rõ"}"
                            {entry.colorPalette ? `, bảng màu "${entry.colorPalette}"` : ""}
                          </li>
                          <li>
                            <strong>Bước 03:</strong> Tải ảnh hiện trạng {entry.houseImageName ? `(${entry.houseImageName})` : ""}
                          </li>
                          <li>
                            <strong>Bước 04:</strong> Nhận kết quả và lưu phương án gợi ý.
                          </li>
                        </ul>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: "14px",
                          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        }}
                      >
                        {hasSampleImage ? (
                          <figure style={{ margin: 0 }}>
                            <div className="preview-image" style={{ marginBottom: "8px" }}>
                              <img src={entry.sampleImageDataUrl} alt="Ảnh mẫu đã lưu" loading="lazy" />
                            </div>
                            <figcaption style={{ fontSize: "0.74rem", opacity: 0.7 }}>
                              Ảnh mẫu tham chiếu
                            </figcaption>
                          </figure>
                        ) : null}
                        {hasHouseImage ? (
                          <figure style={{ margin: 0 }}>
                            <div className="preview-image" style={{ marginBottom: "8px" }}>
                              <img src={entry.houseImageDataUrl} alt="Ảnh hiện trạng đã lưu" loading="lazy" />
                            </div>
                            <figcaption style={{ fontSize: "0.74rem", opacity: 0.7 }}>
                              Ảnh hiện trạng
                            </figcaption>
                          </figure>
                        ) : null}
                        {hasResultImage ? (
                          <figure style={{ margin: 0 }}>
                            <div className="preview-image" style={{ marginBottom: "8px" }}>
                              <img src={entry.outputImageUrl} alt="Ảnh gợi ý từ AI" loading="lazy" />
                            </div>
                            <figcaption style={{ fontSize: "0.74rem", opacity: 0.7 }}>
                              Kết quả AI
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
          <div className="alert info" style={{ marginTop: "16px" }}>
            Bạn chưa lưu lịch sử nào. Hoàn tất quy trình để lưu lại các phương án đã tạo.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
