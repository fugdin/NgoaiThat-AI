import { useRef } from "react";
import WizardNavigation from "./WizardNavigation.jsx";

function UploadHouseStep({
  houseImage,
  sampleImage,
  requirements,
  onHouseSelected,
  onBack,
  onNext,
  loading = false,
  apiMessage = "",
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    onHouseSelected(file);
  };

  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    onHouseSelected(file);
  };

  return (
    <div>
      {loading ? (
        <div className="wizard-progress" role="status" aria-live="assertive">
          <span className="wizard-progress__spinner" aria-hidden="true" />
          <div className="wizard-progress__text">
            <strong>Đang gửi ảnh hiện trạng và tạo gợi ý...</strong>
            <span>Bước 3/4 – Việc này có thể mất khoảng 30-45 giây.</span>
          </div>
        </div>
      ) : null}

      <div className="wizard-card__section">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", letterSpacing: "0.2em", opacity: 0.6 }}>BƯỚC 03</div>
          <h2 className="wizard-card__title">Tải ảnh căn nhà hiện trạng</h2>
          <p className="wizard-card__subtitle">
            Để AI áp dụng phong cách đã chọn, hãy gửi một bức ảnh mặt tiền rõ nét của căn nhà hiện tại.
          </p>
        </div>

        <div className="info-grid" style={{ gap: "24px" }}>
          <div>
            <div
              className="upload-dropzone"
              onDragEnter={preventDefaults}
              onDragOver={preventDefaults}
              onDrop={handleDrop}
            >
              {houseImage?.preview ? (
                <>
                  <div className="preview-frame" style={{ marginBottom: "16px" }}>
                    <div className="preview-image">
                      <img src={houseImage.preview} alt="Ảnh hiện trạng" />
                    </div>
                  </div>
                  <p style={{ marginBottom: "12px", fontSize: "0.85rem", color: "rgba(144,255,195,0.85)" }}>
                    Ảnh đã chọn: <strong>{houseImage.file?.name ?? houseImage?.name ?? "Ảnh hiện trạng"}</strong>
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    Thay đổi ảnh
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏠</div>
                  <h3>Kéo thả ảnh hiện trạng tại đây</h3>
                  <p>hoặc nhấn để chọn ảnh từ thiết bị</p>
                  <button
                    type="button"
                    className={`btn btn-primary${loading ? " btn--loading" : ""}`}
                    style={{ marginTop: "22px" }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="btn__spinner" aria-hidden="true" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      "Chọn ảnh hiện trạng"
                    )}
                  </button>
                  <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "rgba(226,233,255,0.7)" }}>
                    Mẹo: Chụp chính diện, đủ sáng, tránh vật cản để có kết quả tốt nhất.
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="timeline-card">
            <h4>Tóm tắt yêu cầu</h4>
            <div className="info-grid" style={{ gridTemplateColumns: "1fr", gap: "12px" }}>
              <div className="info-card">
                <strong>Phong cách</strong>
                <p style={{ marginTop: "6px" }}>{requirements.style}</p>
              </div>
              <div className="info-card">
                <strong>Bảng màu chính</strong>
                <p style={{ marginTop: "6px" }}>{requirements.colorPalette || "Chưa cung cấp"}</p>
              </div>
              <div className="info-card">
                <strong>Vật liệu & điểm nhấn</strong>
                <p style={{ marginTop: "6px" }}>{requirements.decorItems || "Chưa cung cấp"}</p>
              </div>
              <div className="info-card">
                <strong>Ghi chú cho AI</strong>
                <p style={{ marginTop: "6px" }}>{requirements.aiSuggestions || "Không có ghi chú thêm"}</p>
              </div>
              {sampleImage?.preview ? (
                <div className="info-card" style={{ textAlign: "center" }}>
                  <strong>Ảnh mẫu tham chiếu</strong>
                  <div className="preview-image" style={{ marginTop: "12px" }}>
                    <img src={sampleImage.preview} alt="Ảnh mẫu tham chiếu" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="alert info" style={{ marginTop: "18px" }} role="status" aria-live="polite">
        {apiMessage ||
          "Sau khi xử lý xong, ảnh kết quả sẽ hiển thị ở bước tiếp theo để bạn xem và lưu lại."}
      </div>

      <WizardNavigation
        onBack={onBack}
        onNext={onNext}
        disableNext={!houseImage || loading}
        nextLabel="Tạo ảnh gợi ý"
        nextLoading={loading}
      />
    </div>
  );
}

export default UploadHouseStep;
