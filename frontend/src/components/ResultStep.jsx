import { useEffect, useMemo, useState } from "react";
import WizardNavigation from "./WizardNavigation.jsx";

function ResultStep({ data, history, onSaveHistory, onBack, onRestart, apiMessage = "" }) {
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNotes("");
    setIsSaved(false);
  }, [data?.result?.data.outputImage, data?.houseImage?.preview]);

  const formattedHistory = useMemo(
    () =>
      history.map((entry) => ({
        ...entry,
        formattedDate: new Date(entry.createdAt).toLocaleString("vi-VN"),
        resultImageSrc:
          entry.outputImageUrl || entry.houseImageUrl || entry.houseImageDataUrl || "",
        sampleImageSrc: entry.sampleImageUrl || entry.sampleImageDataUrl || "",
        houseImageSrc: entry.houseImageUrl || entry.houseImageDataUrl || "",
      })),
    [history]
  );

  const handleSave = () => {
    if (isSaved) return;
    onSaveHistory(notes.trim());
    setIsSaved(true);
  };

  const { requirements, sampleImage, houseImage, result, stylePlan } = data;

  const sampleImageSrc = sampleImage?.dataUrl || sampleImage?.url || "";
  const houseImageSrc =
    houseImage?.preview || houseImage?.dataUrl || houseImage?.url || "";
  const resultImageSrc = result?.data.outputImage  || "";
  const resultIsOriginal = !result?.outputImage && !!houseImageSrc;

  const styleSummary =
    typeof stylePlan === "string"
      ? stylePlan
      : Array.isArray(stylePlan?.combined)
      ? stylePlan.combined.join(", ")
      : stylePlan?.promptHint || "";

console.log("Rendered ResultStep with data:", data);

  return (
    <div>
      <div className="wizard-card__section">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", letterSpacing: "0.2em", opacity: 0.6 }}>
            BUOC 04
          </div>
          <h2 className="wizard-card__title">Kham pha phuong an goi y</h2>        
          <p className="wizard-card__subtitle">
            AI da ap dung phong cach ban chon len anh hien trang. Ban co the so
            sanh, ghi chu va luu lai phuong an nay.
          </p>
        </div>

        <div
          className="info-grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
        >
          <div className="info-card info-card--active" style={{ minHeight: "260px" }}>
            <h3>Thong tin tong quan</h3>
            <ul style={{ marginTop: "16px", lineHeight: 1.7, paddingLeft: "20px" }}>
              <li>
                <strong>Phong cach:</strong> {requirements.style}
              </li>
              <li>
                <strong>Bang mau:</strong> {requirements.colorPalette || "Chua cung cap"}
              </li>
              <li>
                <strong>Diem nhan:</strong> {requirements.decorItems || "Chua cung cap"}
              </li>
              <li>
                <strong>Ghi chu AI:</strong> {requirements.aiSuggestions || "Khong co"}
              </li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Anh ket qua</h3>
            {resultImageSrc ? (
              <div className="preview-image" style={{ marginTop: "14px" }}>
                <img src={resultImageSrc} alt="Anh goi y tu he thong" />
              </div>
            ) : (
              <div className="alert info" style={{ marginTop: "14px" }}>
                Anh ket qua se hien thi tai day ngay khi hoan tat xu ly.
              </div>
            )}
            <p
              style={{
                marginTop: "12px",
                fontSize: "0.88rem",
                color: "rgba(226,233,255,0.78)",
              }}
            >
              {result?.description ||
                (resultIsOriginal
                  ? "Dang hien thi anh goc trong khi cho ket qua tu he thong."
                  : "Dang cho ket qua tu he thong.")}
            </p>
            {resultIsOriginal ? (
              <span className="tag">Tam thoi hien anh goc</span>
            ) : null}
            {result?.model ? <span className="tag">Mo hinh: {result.model}</span> : null}
          </div>

          <div className="info-card">
            <h3>Anh mau tham chieu</h3>
            {sampleImageSrc ? (
              <div className="preview-image" style={{ marginTop: "14px" }}>
                <img src={sampleImageSrc} alt="Anh tham chieu" />
              </div>
            ) : (
              <p style={{ marginTop: "12px", color: "rgba(226,233,255,0.7)" }}>
                Chua co anh mau.
              </p>
            )}
          </div>

          <div className="info-card">
            <h3>Anh hien trang</h3>
            {houseImageSrc ? (
              <div className="preview-image" style={{ marginTop: "14px" }}>
                <img src={houseImageSrc} alt="Anh hien trang" />
              </div>
            ) : (
              <p style={{ marginTop: "12px", color: "rgba(226,233,255,0.7)" }}>
                Chua co anh hien trang.
              </p>
            )}
          </div>
        </div>
      </div>

      {styleSummary ? (
        <div className="wizard-card__section">
          <div className="timeline-card">
            <h4>Ke hoach goi y</h4>
            <p style={{ lineHeight: 1.7, color: "rgba(226,233,255,0.85)" }}>
              {styleSummary || "He thong chua tra ve ban mo ta chi tiet."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="wizard-card__section">
        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
            Ghi chu bo sung (vi du: chinh lai ban cong, them cay xanh...)
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
        backLabel="Quay lai dieu chinh"
        secondaryRight={
          <button type="button" className="btn btn-secondary" onClick={onRestart}>
            Bat dau du an moi
          </button>
        }
        primaryRight={
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved}
            className="btn btn-primary"
          >
            {isSaved ? "Da luu vao lich su" : "Luu vao lich su"}
          </button>
        }
      />

      <div className="wizard-card__section">
        <div className="timeline-card">
          <h4>Lich su du an da luu</h4>
          <div className="history-grid" style={{ marginTop: "16px" }}>
            {formattedHistory.length ? (
              formattedHistory.map((entry) => (
                <div key={entry.id} className="history-card">
                  <div className="tag tag--accent">
                    Ma #{entry.id.slice(0, 8).toUpperCase()}
                  </div>
                  <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                    Tao luc: {entry.formattedDate}
                  </p>
                  <p>
                    <strong>Phong cach:</strong> {entry.style}
                  </p>
                  <p>
                    <strong>Bang mau:</strong> {entry.colorPalette || "Chua cung cap"}
                  </p>
                  <p>
                    <strong>Diem nhan:</strong> {entry.decorItems || "Chua cung cap"}
                  </p>
                  <p>
                    <strong>Ghi chu AI:</strong> {entry.aiSuggestions || "Khong co"}
                  </p>
                  {entry.notes ? (
                    <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                      <strong>Ghi chu nguoi dung:</strong> {entry.notes}
                    </p>
                  ) : null}

                  {entry.resultImageSrc || entry.sampleImageSrc || entry.houseImageSrc ? (
                    <div
                      style={{
                        display: "grid",
                        gap: "12px",
                        marginTop: "12px",
                      }}
                    >
                      {entry.resultImageSrc ? (
                        <figure style={{ margin: 0 }}>
                          <img
                            src={entry.resultImageSrc}
                            alt="Anh ket qua da luu"
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
                              Dang hien thi anh goc.
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
                        {entry.sampleImageSrc ? (
                          <figure style={{ margin: 0 }}>
                            <img
                              src={entry.sampleImageSrc}
                              alt="Anh tham chieu da luu"
                              style={{ width: "100%", borderRadius: "10px" }}
                            />
                            <figcaption
                              style={{
                                fontSize: "0.72rem",
                                opacity: 0.6,
                                marginTop: "4px",
                              }}
                            >
                              Anh tham chieu
                            </figcaption>
                          </figure>
                        ) : null}
                        {entry.houseImageSrc ? (
                          <figure style={{ margin: 0 }}>
                            <img
                              src={entry.houseImageSrc}
                              alt="Anh hien trang da luu"
                              style={{ width: "100%", borderRadius: "10px" }}
                            />
                            <figcaption
                              style={{
                                fontSize: "0.72rem",
                                opacity: 0.6,
                                marginTop: "4px",
                              }}
                            >
                              Anh hien trang
                            </figcaption>
                          </figure>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="alert info">Chua co du an nao duoc luu.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultStep;
