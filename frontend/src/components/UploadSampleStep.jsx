import { useRef } from "react";

function UploadSampleStep({ sampleImage, onSampleSelected, onNext }) {
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
            className="max-h-80 w-full rounded-lg object-cover shadow-lg"
          />
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!sampleImage}
          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

export default UploadSampleStep;
