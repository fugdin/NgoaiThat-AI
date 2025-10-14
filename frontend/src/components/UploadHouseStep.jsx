import { useRef, useState } from "react";
import { generateFinal } from "../api/wizard";


function UploadHouseStep({ houseImage, sampleImage, requirements, onHouseSelected, onBack, onNext, tempId }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      onHouseSelected(file);
    }
  };

  const handleGenerate = async () => {
    if (!tempId || !houseImage?.file) {
      alert("Thiếu dữ liệu ảnh hoặc tempId!");
      return;
    }

    setLoading(true);
    try {
      const res = await generateFinal(tempId, houseImage.file, requirements);
      console.log("[GENERATE FINAL]", res);

      if (res.ok) {
        //alert("Sinh ảnh hoàn thiện thành công!");
        onNext(); // sang bước kết quả
      } else {
        alert("Lỗi khi sinh ảnh hoàn thiện: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Generate-final error:", err);
      alert("Không thể kết nối đến API /generate-final!");
    } finally {
      setLoading(false);
    }
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
                className="max-h-80 w-full rounded-lg object-cover shadow-lg"
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
                className="mt-2 max-h-40 w-full rounded-lg object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!houseImage}
          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {loading ? "Đang xử lý..." : "Hoàn tất phân tích"}
        </button>
      </div>
    </div>
  );
}

export default UploadHouseStep;
