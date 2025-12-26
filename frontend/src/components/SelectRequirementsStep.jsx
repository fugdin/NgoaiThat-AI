import WizardNavigation from "./WizardNavigation.jsx";

const STYLE_OPTIONS = [
  {
    value: "Không",
    description:
      "Không chọn phong cách cụ thể, để AI tự do sáng tạo dựa trên các yêu cầu khác của bạn.",
    icon: "➖",
  },
  {
    value: "Hiện đại",
    description:
      "Đường nét gọn gàng, nhiều kính, phối màu trung tính nhấn kim loại ánh vàng.",
    icon: "✨",
  },
  {
    value: "Tân cổ điển",
    description:
      "Mặt tiền cân đối, phào chỉ tinh tế, điểm xuyết hoa văn mềm mại sang trọng.",
    icon: "🏛️",
  },
  {
    value: "Scandinavian",
    description:
      "Không gian sáng, gỗ tự nhiên và bảng màu trung tính mang lại sự ấm áp.",
    icon: "🌲",
  },
  {
    value: "Resort nhiệt đới",
    description:
      "Nhiều mảng xanh, chất liệu gần gũi tạo cảm giác nghỉ dưỡng thư thái.",
    icon: "🌴",
  },
  {
    value: "Sang trọng đẳng cấp",
    description:
      "Vật liệu cao cấp, ánh sáng nghệ thuật, tạo dấu ấn khác biệt cho mặt tiền.",
    icon: "💎",
  },
  {
    value: "Tối giản đương đại",
    description:
      "Tối ưu các mảng phẳng, ít chi tiết, nhấn mạnh khối kiến trúc hiện đại.",
    icon: "🧊",
  },
];

function SelectRequirementsStep({
  requirements,
  onChange,
  onBack,
  onNext,
  loading = false,
  stylePlan,
  apiMessage = "",
}) {
  const handleFieldChange = (field) => (event) => {
    onChange({ ...requirements, [field]: event.target.value });
  };

  return (
    <div>
      {loading ? (
        <div className="wizard-progress" role="status" aria-live="assertive">
          <span className="wizard-progress__spinner" aria-hidden="true" />
          <div className="wizard-progress__text">
            <strong>AI đang phân tích yêu cầu của bạn...</strong>
            <span>Bước 2/4 – Thông tin chi tiết giúp gợi ý chính xác hơn.</span>
          </div>
        </div>
      ) : null}

      <div className="wizard-card__section">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "42px", letterSpacing: "0.2em", opacity: 0.6 }}>BƯỚC 02</div>
          <h2 className="wizard-card__title">Chọn yêu cầu thiết kế mong muốn</h2>
          <p className="wizard-card__subtitle">
            Hãy đánh dấu phong cách phù hợp và mô tả chi tiết bạn muốn AI ưu tiên khi tạo phương án.
          </p>
        </div>

        <div className="info-grid">
          {STYLE_OPTIONS.map((option) => {
            const isActive = option.value === requirements.style;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...requirements, style: option.value })}
                className={`info-card ${isActive ? "info-card--active" : ""}`.trim()}
                style={{ textAlign: "left", cursor: "pointer" }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    background: isActive
                      ? "linear-gradient(135deg, #ffbd4a, #ff8f1f)"
                      : "rgba(40, 45, 70, 0.65)",
                    color: isActive ? "#1a1320" : "#f5f6ff",
                    marginBottom: "14px",
                  }}
                  aria-hidden="true"
                >
                  {option.icon}
                </div>
                <h3 style={{ margin: 0, color: "rgba(248,250,255,0.95)" }}>{option.value}</h3>
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "0.88rem",
                    color: isActive ? "rgba(255, 249, 237, 0.85)" : "rgba(226, 233, 255, 0.85)",
                  }}
                >
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="wizard-card__section">
        <div className="timeline-card">
          <h4>Tinh chỉnh yêu cầu chi tiết</h4>
          <label style={{ display: "block", marginBottom: "18px" }}>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Bảng màu mong muốn
            </span>
            <textarea
              className="textarea-text"
              rows={3}
              value={requirements.colorPalette}
              onChange={handleFieldChange("colorPalette")}
              placeholder="Ví dụ: trắng kem chủ đạo, nhấn vàng champagne, ốp gỗ walnut."
            />
          </label>
          <label style={{ display: "block", marginBottom: "18px" }}>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Vật liệu & trang trí mong muốn
            </span>
            <textarea
              className="textarea-text"
              rows={3}
              value={requirements.decorItems}
              onChange={handleFieldChange("decorItems")}
              placeholder="Ví dụ: lam gỗ dọc, đèn hắt khe, ban công cây xanh."
            />
          </label>
          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Ghi chú thêm cho AI
            </span>
            <textarea
              className="textarea-text"
              rows={3}
              value={requirements.aiSuggestions}
              onChange={handleFieldChange("aiSuggestions")}
              placeholder="Ví dụ: ưu tiên ban công xanh, sử dụng ánh sáng ấm vào buổi tối."
            />
          </label>
        </div>
      </div>

      {stylePlan ? (
        <div className="wizard-card__section">
          <div className="timeline-card">
            <h4>Kế hoạch gợi ý từ AI</h4>
            <p style={{ lineHeight: 1.7, color: "rgba(226,233,255,0.85)" }}>{stylePlan}</p>
          </div>
        </div>
      ) : null}

      <div className="alert info" style={{ marginTop: "18px" }} role="status" aria-live="polite">
        {apiMessage ||
          "Chọn phong cách và mô tả càng kỹ càng giúp AI hiểu rõ hơn về mong muốn của bạn."}
      </div>

      <WizardNavigation
        onBack={onBack}
        onNext={onNext}
        disableNext={loading}
        nextLoading={loading}
      />
    </div>
  );
}

export default SelectRequirementsStep;
