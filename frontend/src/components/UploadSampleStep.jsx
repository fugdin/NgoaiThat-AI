import { useRef } from "react";
import WizardNavigation from "./WizardNavigation.jsx";

function UploadSampleStep({
  sampleImage,
  onSampleSelected,
  onNext,
  onBack,
  disableBack = true,
  loading = false,
  error = null,
  extractedLayout = null,
  averageColor = null,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    onSampleSelected(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    onSampleSelected(file);
  };

  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          1. Tải ảnh mẫu bạn yêu thích
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Cung cấp một bức ảnh ngoại thất truyền cảm hứng. Ảnh này giúp hệ thống
          hiểu về phong cách, bảng màu và mức độ chi tiết mà bạn mong muốn.
        </p>
      </div>

      <div
        className="relative rounded-xl border border-dashed border-slate-500 bg-slate-800/40 p-8 transition hover:border-emerald-400 hover:bg-slate-800/70"
        onDragEnter={preventDefaults}
        onDragOver={preventDefaults}
        onDragLeave={preventDefaults}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              ↑
            </span>
            <div className="text-left">
              <p className="font-medium text-slate-100">
                Kéo &amp; thả hoặc chọn ảnh từ máy
              </p>
              <p className="text-xs text-slate-400">
                Định dạng hỗ trợ: JPG, PNG (tối đa 15MB)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Chọn ảnh
          </button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {sampleImage ? (
            <p className="text-xs text-emerald-300">
              Đã chọn: {sampleImage.file?.name ?? "Ảnh mẫu"}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Chúng tôi sẽ phân tích để nhận diện vật liệu, tông màu, ánh sáng và
              bố cục tổng thể.
            </p>
          )}
        </div>
      </div>

      {sampleImage?.preview ? (
        <div>
          <p className="text-sm font-medium text-slate-300 mb-3">
            Xem trước ảnh mẫu
          </p>
          <img
            src={sampleImage.preview}
            alt="Ảnh mẫu"
            className="block max-w-full rounded-lg shadow-lg"
            style={{ maxHeight: "calc(100vh - 300px)", objectFit: "contain" }}
          />
        </div>
      ) : null}

      {extractedLayout ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p className="font-semibold text-emerald-200">Gợi ý nhận diện nhanh</p>
          <p className="mt-1 text-emerald-100">
            {extractedLayout.notes ||
              "Hệ thống đã phân tích bố cục và phong cách từ ảnh mẫu."}
          </p>
          {Array.isArray(extractedLayout.styleKeywords) &&
          extractedLayout.styleKeywords.length ? (
            <p className="mt-2 text-xs uppercase tracking-wide text-emerald-300">
              Từ khóa: {extractedLayout.styleKeywords.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}

      {averageColor?.hex ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800/40 p-4 text-sm text-slate-300">
          <span
            className="h-10 w-10 rounded-full border border-slate-700 shadow-inner"
            style={{ backgroundColor: averageColor.hex }}
          />
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Tông màu chủ đạo
            </p>
            <p className="font-semibold text-slate-100">{averageColor.hex}</p>
            <p className="text-xs text-slate-500">
              RGB ({averageColor.r}, {averageColor.g}, {averageColor.b})
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <WizardNavigation
        onBack={onBack}
        onNext={onNext}
        disableBack={disableBack}
        disableNext={!sampleImage}
        nextLoading={loading}
      />
    </div>
  );
}

export default UploadSampleStep;
