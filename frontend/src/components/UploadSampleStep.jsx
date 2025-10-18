import { useRef } from "react";
import WizardNavigation from "./WizardNavigation.jsx";

function UploadSampleStep({
  sampleImage,
  onSampleSelected,
  onNext,
  disableNext,
  loading = false,
  apiMessage = "",
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      onSampleSelected(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) {
      onSampleSelected(file);
    }
  };

  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const fileName = sampleImage?.file?.name ?? sampleImage?.name ?? "Chưa chọn";

  return (
    <div>
      <div className="wizard-card__section">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", letterSpacing: "0.2em", opacity: 0.6 }}>BƯỚC 01</div>
          <h2 className="wizard-card__title">Tải ảnh mẫu truyền cảm hứng</h2>
          <p className="wizard-card__subtitle">
            Chọn một bức ảnh ngoại thất bạn yêu thích để AI phân tích phong cách, vật liệu và ánh sáng.
          </p>
        </div>

        <div
          className="upload-dropzone"
          onDragEnter={preventDefaults}
          onDragOver={preventDefaults}
          onDragLeave={preventDefaults}
          onDrop={handleDrop}
        >
          <div style={{ fontSize: "38px", marginBottom: "12px" }}>📸</div>
          <h3>Kéo thả ảnh mẫu vào khung</h3>
          <p>hoặc nhấn để chọn ảnh từ thiết bị</p>
          <p style={{ fontSize: "0.82rem", marginTop: "12px" }}>
            Hỗ trợ JPG, PNG với dung lượng tối đa 15MB
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "22px" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Chọn ảnh mẫu"}
          </button>
          <input
            ref={fileInputRef}
            className="hidden-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {sampleImage ? (
            <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "rgba(144,255,195,0.85)" }}>
              Ảnh đã chọn: <strong>{fileName}</strong>
            </p>
          ) : (
            <p style={{ marginTop: "12px", fontSize: "0.85rem", color: "rgba(226,233,255,0.7)" }}>
              Mẹo: Ưu tiên ảnh sắc nét, bố cục rõ để AI hiểu phong cách nhanh hơn.
            </p>
          )}
        </div>

        {sampleImage?.preview ? (
          <div className="preview-frame">
            <div className="preview-image">
              <img src={sampleImage.preview} alt="Ảnh mẫu" />
            </div>
          </div>
        ) : null}

        {apiMessage ? (
          <div className="alert info" style={{ marginTop: "18px" }}>
            {apiMessage}
          </div>
        ) : null}
      </div>

      <WizardNavigation onBack={() => {}} disableBack disableNext={disableNext} onNext={onNext} />
    </div>
  );
}

export default UploadSampleStep;
