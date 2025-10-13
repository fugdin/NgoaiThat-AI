import { useEffect, useMemo, useState } from "react";
import WizardNavigation from "./WizardNavigation.jsx";

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

  useEffect(() => {
    setIsSaved(false);
    setNotes("");
  }, [data.result]);

  const houseName = data.houseImage?.file?.name ?? "Ảnh nhà hiện trạng";
  const sampleName = data.sampleImage?.file?.name ?? "Ảnh mẫu tham chiếu";
  const finalResult = data.result;
  const resultImageUrl = finalResult?.outputImageUrl ?? "";
  const resultDescription = finalResult?.description ?? "Đang chuẩn bị bản kết hợp từ AI.";
  const resultModel = finalResult?.model ?? "";
  const dominantColor = finalResult?.colorApplied?.hex ?? "";

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
    const result = onSaveHistory(notes.trim());
    if (result?.ok) {
      setIsSaved(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          4. Kết quả gợi ý ngoại thất
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Bạn có thể tải xuống ghi chú, lưu vào lịch sử dự án và gửi lại yêu cầu
          mới nếu cần tinh chỉnh.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
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
            {resultImageUrl ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-300">
                  Ảnh kết quả
                </p>
                <img
                  src={resultImageUrl}
                  alt="Ảnh kết quả"
                  className="mt-2 block max-w-full rounded-lg shadow"
                  style={{ maxHeight: "320px", objectFit: "contain" }}
                />
                <p className="mt-2 text-xs text-slate-400">
                  {resultDescription}
                </p>
                {resultModel ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Công cụ: {resultModel}
                  </p>
                ) : null}
                {dominantColor ? (
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>Tông màu áp dụng:</span>
                    <span
                      className="inline-flex h-4 w-4 rounded-full border border-slate-600"
                      style={{ backgroundColor: dominantColor }}
                    />
                    <span>{dominantColor}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
            {data.sampleImage?.preview ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Ảnh mẫu
                </p>
                <p className="text-xs text-slate-500">{sampleName}</p>
                <img
                  src={data.sampleImage.preview}
                  alt="Ảnh tham chiếu"
                  className="mt-2 block max-w-full rounded-lg"
                  style={{ maxHeight: "220px", objectFit: "contain" }}
                />
              </div>
            ) : null}
            {data.houseImage?.preview ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Ảnh nhà sẽ chỉnh sửa
                </p>
                <p className="text-xs text-slate-500">{houseName}</p>
                <img
                  src={data.houseImage.preview}
                  alt="Ảnh nhà"
                  className="mt-2 block max-w-full rounded-lg"
                  style={{ maxHeight: "220px", objectFit: "contain" }}
                />
              </div>
            ) : null}
          </div>
        </div>

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

          <label className="flex flex-col gap-2 rounded-xl border border-slate-600 bg-slate-800/40 p-4">
            <span className="text-sm font-medium text-slate-200">
              Ghi chú bổ sung (ví dụ: chỉnh lại ban công tầng 2, tăng cây xanh)
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </label>

          <WizardNavigation
            onBack={onBack}
            backLabel="Quay lại điều chỉnh"
            disableBack={false}
            primaryRight={
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaved}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isSaved ? "Đã lưu vào lịch sử" : "Lưu vào lịch sử"}
              </button>
            }
            secondaryRight={
              <button
                type="button"
                onClick={onRestart}
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-600"
              >
                Bắt đầu dự án mới
              </button>
            }
          />
        </div>
      </div>

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
                {entry.description ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Mô tả kết quả: {entry.description}
                  </p>
                ) : null}
                {entry.notes ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Ghi chú người dùng: {entry.notes}
                  </p>
                ) : null}
                {entry.outputImageUrl ? (
                  <img
                    src={entry.outputImageUrl}
                    alt="Ảnh kết quả đã lưu"
                    className="mt-2 block w-full rounded-lg"
                    style={{ maxHeight: "220px", objectFit: "contain" }}
                  />
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
