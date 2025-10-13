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
  error = null,
  stylePlan = null,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    onHouseSelected(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          3. Tải ảnh căn nhà hiện trạng
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Đây là bức ảnh sẽ được AI chỉnh sửa dựa trên phong cách bạn chọn. Hãy
          sử dụng ảnh rõ nét, chụp thẳng mặt tiền và đủ ánh sáng để đạt kết quả
          tối ưu.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-500 bg-slate-800/40 p-8 text-center">
            <p className="text-sm font-medium text-slate-200">
              Kéo &amp; thả hoặc chọn ảnh từ máy
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Gợi ý: ảnh chụp ban ngày, độ phân giải &ge; 1920px, tránh người hoặc
              xe che khuất mặt tiền.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Chọn ảnh nhà thô
            </button>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {houseImage ? (
              <p className="mt-3 text-xs text-emerald-300">
                Đã chọn: {houseImage.file?.name ?? "Ảnh nhà hiện trạng"}
              </p>
            ) : null}
          </div>

          {houseImage?.preview ? (
            <div>
              <p className="text-sm font-medium text-slate-300 mb-3">
                Xem trước ảnh nhà
              </p>
              <img
                src={houseImage.preview}
                alt="Ảnh nhà hiện trạng"
                className="block max-w-full rounded-lg shadow-lg"
                style={{ maxHeight: "calc(100vh - 320px)", objectFit: "contain" }}
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-xl border border-slate-600 bg-slate-800/40 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Tóm tắt yêu cầu
          </p>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <p className="font-medium text-slate-200">Phong cách mong muốn</p>
              <p className="text-slate-400">{requirements.style}</p>
            </div>
            <div>
              <p className="font-medium text-slate-200">Bảng màu chính</p>
              <p className="text-slate-400">
                {requirements.colorPalette || "Chưa cung cấp"}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-200">Điểm nhấn &amp; trang trí</p>
              <p className="text-slate-400">
                {requirements.decorItems || "Chưa cung cấp"}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-200">Lưu ý cho AI</p>
              <p className="text-slate-400">
                {requirements.aiSuggestions || "Không có lưu ý thêm"}
              </p>
            </div>
          </div>

          {sampleImage?.preview ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Ảnh mẫu tham chiếu
              </p>
              <img
                src={sampleImage.preview}
                alt="Ảnh mẫu tham chiếu"
                className="mt-2 block max-w-full rounded-lg"
                style={{ maxHeight: "200px", objectFit: "contain" }}
              />
            </div>
          ) : null}

          {stylePlan?.combined?.length ? (
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-4 text-xs text-emerald-100">
              <p className="font-semibold text-emerald-200">Từ khóa phân tích</p>
              <p className="mt-1">{stylePlan.combined.join(", ")}</p>
              {stylePlan.promptHint ? (
                <p className="mt-2 uppercase tracking-wide text-emerald-300">
                  Prompt: {stylePlan.promptHint}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <WizardNavigation
        onBack={onBack}
        onNext={onNext}
        disableNext={!houseImage}
        nextLabel="Hoàn tất phân tích"
        nextLoading={loading}
      />
    </div>
  );
}

export default UploadHouseStep;
