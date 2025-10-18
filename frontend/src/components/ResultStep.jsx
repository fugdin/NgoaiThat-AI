import { useEffect, useMemo, useState } from "react";
import WizardNavigation from "./WizardNavigation.jsx";

function ResultStep({ data, history, onSaveHistory, onBack, onRestart, apiMessage = "" }) {
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes("");
    setIsSaved(false);
  }, [data?.result?.outputImageUrl]);

  const formattedHistory = useMemo(
    () =>
      history.map((entry) => ({
        ...entry,
        formattedDate: new Date(entry.createdAt).toLocaleString("vi-VN"),
      })),
    [history]
  );

  const handleSave = () => {
    if (isSaved) return;
    onSaveHistory(notes.trim());
    setIsSaved(true);
  };

  const { requirements, sampleImage, houseImage, result, stylePlan } = data;
  const styleSummary =
    typeof stylePlan === "string"
      ? stylePlan
      : Array.isArray(stylePlan?.combined)
      ? stylePlan.combined.join(", ")
      : stylePlan?.promptHint || "";

  return (
    <div>
      <div className="wizard-card__section">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", letterSpacing: "0.2em", opacity: 0.6 }}>BƯỚC 04</div>
          <h2 className="wizard-card__title">Khám phá phương án gợi ý</h2>
          <p className="wizard-card__subtitle">
            AI đã áp dụng phong cách bạn chọn lên ảnh hiện trạng. Bạn có thể so sánh, ghi chú và lưu lại phương án này.
          </p>
        </div>

        <div className="info-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div className="info-card info-card--active" style={{ minHeight: "260px" }}>
            <h3>Thông tin tổng quan</h3>
            <ul style={{ marginTop: "16px", lineHeight: 1.7, paddingLeft: "20px" }}>
              <li><strong>Phong cách:</strong> {requirements.style}</li>
              <li><strong>Bảng màu:</strong> {requirements.colorPalette || "Chưa cung cấp"}</li>
              <li><strong>Điểm nhấn:</strong> {requirements.decorItems || "Chưa cung cấp"}</li>
              <li><strong>Ghi chú AI:</strong> {requirements.aiSuggestions || "Không có"}</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Ảnh kết quả</h3>
            {result?.outputImageUrl ? (
              <div className="preview-image" style={{ marginTop: "14px" }}>
                <img src={result.outputImageUrl} alt="Ảnh gợi ý từ AI" />
              </div>
            ) : (
              <div className="alert info" style={{ marginTop: "14px" }}>
                Ảnh kết quả sẽ hiển thị tại đây ngay khi hoàn tất xử lý.
              </div>
            )}
            <p style={{ marginTop: "12px", fontSize: "0.88rem", color: "rgba(226,233,255,0.78)" }}>
              {result?.description || "Đang chờ kết quả từ hệ thống."}
            </p>
            {result?.model ? <span className="tag">🤖 Mô hình: {result.model}</span> : null}
          </div>

          <div className="info-card">
            <h3>Ảnh mẫu tham chiếu</h3>
            {sampleImage?.preview ? (
              <div className="preview-image" style={{ marginTop: "14px" }}>
                <img src={sampleImage.preview} alt="Ảnh mẫu" />
              </div>
            ) : (
              <p style={{ marginTop: "12px", color: "rgba(226,233,255,0.7)" }}>Chưa có ảnh mẫu.</p>
            )}
          </div>

          <div className="info-card">
            <h3>Ảnh hiện trạng</h3>
            {houseImage?.preview ? (
              <div className="preview-image" style={{ marginTop: "14px" }}>
                <img src={houseImage.preview} alt="Ảnh hiện trạng" />
              </div>
            ) : (
              <p style={{ marginTop: "12px", color: "rgba(226,233,255,0.7)" }}>Chưa có ảnh hiện trạng.</p>
            )}
          </div>
        </div>
      </div>

      {stylePlan ? (
        <div className="wizard-card__section">
          <div className="timeline-card">
            <h4>Kế hoạch gợi ý</h4>
            <p style={{ lineHeight: 1.7, color: "rgba(226,233,255,0.85)" }}>
              {styleSummary || "Hệ thống chưa trả về bản mô tả chi tiết."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="wizard-card__section">
        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
            Ghi chú bổ sung (ví dụ: chỉnh lại ban công, thêm cây xanh...)
          </span>
          <textarea
            className="textarea-text"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
      </div>

      {apiMessage ? (
        <div className="alert info" style={{ marginBottom: "18px" }}>
          {apiMessage}
        </div>
      ) : null}

      <WizardNavigation
        onBack={onBack}
        backLabel="Quay lại điều chỉnh"
        secondaryRight={
          <button type="button" className="btn btn-secondary" onClick={onRestart}>
            Bắt đầu dự án mới
          </button>
        }
        primaryRight={
          <button type="button" onClick={handleSave} disabled={isSaved} className="btn btn-primary">
            {isSaved ? "Đã lưu vào lịch sử" : "Lưu vào lịch sử"}
          </button>
        }
      />

      <div className="wizard-card__section">
        <div className="timeline-card">
          <h4>Lịch sử dự án đã lưu</h4>
          <div className="history-grid" style={{ marginTop: "16px" }}>
            {formattedHistory.length ? (
              formattedHistory.map((entry) => (
                <div key={entry.id} className="history-card">
                  <div className="tag tag--accent">📁 Mã #{entry.id.slice(0, 8).toUpperCase()}</div>
                  <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>Tạo lúc: {entry.formattedDate}</p>
                  <p><strong>Phong cách:</strong> {entry.style}</p>
                  <p><strong>Bảng màu:</strong> {entry.colorPalette || "Chưa cung cấp"}</p>
                  <p><strong>Điểm nhấn:</strong> {entry.decorItems || "Chưa cung cấp"}</p>
                  <p><strong>Ghi chú AI:</strong> {entry.aiSuggestions || "Không có"}</p>
                  {entry.notes ? (
                    <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                      <strong>Ghi chú người dùng:</strong> {entry.notes}
                    </p>
                  ) : null}
                  {entry.outputImageUrl ? (
                    <img src={entry.outputImageUrl} alt="Ảnh kết quả đã lưu" />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="alert info">Chưa có dự án nào được lưu.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultStep;
