import { useMemo, useState } from "react";

function ResultStep({
  data,
  recommendations,
  history,
  onSaveHistory,
  onBack,
  onRestart,
}) {
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const houseName = data.houseImage?.file?.name ?? "Ảnh nhà hiện trạng";
  const sampleName = data.sampleImage?.file?.name ?? "Ảnh mẫu tham chiếu";

  // 🟢 Dữ liệu kết quả từ backend (generate-final)
  const resultUrl = data.result?.resultImageUrl ?? "";
  const resultDesc = data.result?.description ?? "Chưa có mô tả từ hệ thống.";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          4. Kết quả gợi ý ngoại thất
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Đây là kết quả được AI xử lý từ ảnh nhà của bạn và phong cách đã chọn.
        </p>
      </div>

      {/* 🟢 Hiển thị kết quả render từ Cloudinary */}
      {resultUrl ? (
        <div className="rounded-xl border border-emerald-500/40 bg-slate-800/40 p-4 text-center">
          <p className="mb-2 text-sm text-emerald-300 font-medium">
            Ảnh kết quả được tạo bởi AI
          </p>
          <img
            src={resultUrl}
            alt="Ảnh kết quả AI"
            className="mx-auto max-h-[480px] w-full rounded-lg object-contain shadow-lg"
          />
          <p className="mt-3 text-sm text-slate-300 italic">{resultDesc}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-600 bg-slate-800/40 p-8 text-center text-slate-400">
          Chưa có ảnh kết quả. Vui lòng hoàn tất bước "Upload ảnh nhà" để sinh
          thiết kế.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        {/* Thông tin tóm tắt */}
        <div className="space-y-4 rounded-xl border border-slate-600 bg-slate-800/40 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Thông tin tổng quan
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <span className="font-medium text-slate-100">Phong cách: </span>
              {data.requirements.style}
            </li>
            <li>
              <span className="font-medium text-slate-100">Bảng màu: </span>
              {data.requirements.colorPalette || "Chưa cung cấp"}
            </li>
            <li>
              <span className="font-medium text-slate-100">Điểm nhấn: </span>
              {data.requirements.decorItems || "Chưa cung cấp"}
            </li>
            <li>
              <span className="font-medium text-slate-100">Ghi chú cho AI: </span>
              {data.requirements.aiSuggestions || "Không có ghi chú thêm"}
            </li>
          </ul>

          <div className="grid gap-4 text-sm">
            {data.sampleImage?.preview && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Ảnh mẫu
                </p>
                <p className="text-xs text-slate-500">{sampleName}</p>
                <img
                  src={data.sampleImage.preview}
                  alt="Ảnh tham chiếu"
                  className="mt-2 max-h-48 w-full rounded-lg object-cover"
                />
              </div>
            )}
            {data.houseImage?.preview && (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Ảnh nhà gốc
                </p>
                <p className="text-xs text-slate-500">{houseName}</p>
                <img
                  src={data.houseImage.preview}
                  alt="Ảnh nhà"
                  className="mt-2 max-h-48 w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Gợi ý & lưu */}
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5">
            <p className="text-sm font-semibold text-emerald-200">
              Gợi ý từ hệ thống
            </p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-100">
              {recommendations.map((item, index) => (
                <li key={index} className="flex gap-2 leading-relaxed">
                  <span className="mt-1 text-emerald-300">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ghi chú người dùng */}
          <label className="flex flex-col gap-2 rounded-xl border border-slate-600 bg-slate-800/40 p-4">
            <span className="text-sm font-medium text-slate-200">
              Ghi chú bổ sung (ví dụ: chỉnh lại ban công, tăng cây xanh)
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              Quay lại điều chỉnh
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaved}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isSaved ? "Đã lưu vào lịch sử" : "Lưu vào lịch sử"}
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-lg border border-transparent bg-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-600"
            >
              Bắt đầu dự án mới
            </button>
          </div>
        </div>
      </div>

      {/* Lịch sử lưu */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
            Lịch sử dự án đã lưu
          </p>
          <p className="text-xs text-slate-500">
            {history.length
              ? `${history.length} bản ghi gần đây`
              : "Chưa có bản ghi nào"}
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {formattedHistory.length ? (
            formattedHistory.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Mã dự án: {entry.id.slice(0, 8).toUpperCase()}</span>
                  <span>{entry.formattedDate}</span>
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Phong cách: {entry.style}
                </p>
                <p>Bảng màu: {entry.colorPalette || "Chưa cung cấp"}</p>
                <p>Điểm nhấn: {entry.decorItems || "Chưa cung cấp"}</p>
                <p>Lưu ý: {entry.aiSuggestions || "Không có"}</p>
                {entry.notes ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Ghi chú người dùng: {entry.notes}
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-700 bg-slate-800/40 p-6 text-center text-sm text-slate-500">
              Lưu dự án để dễ dàng so sánh các phiên bản và chia sẻ với đội ngũ
              thiết kế.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultStep;
