const STYLE_OPTIONS = [
  {
    value: "Hiện đại",
    description: "Đường nét tinh giản, vật liệu kính và kim loại, phối màu trung tính.",
  },
  {
    value: "Tân cổ điển",
    description: "Nhấn mạnh chi tiết phào chỉ, mái vòm mềm mại, màu sắc thanh lịch.",
  },
  {
    value: "Scandinavian",
    description: "Tông sáng, gỗ tự nhiên, đề cao ánh sáng và sự tối giản ấm áp.",
  },
  {
    value: "Resort nhiệt đới",
    description: "Nhiều mảng xanh, vật liệu gần gũi thiên nhiên, nhấn mạnh ban công mở.",
  },
];

function SelectRequirementsStep({ requirements, onChange, onBack, onNext }) {
  const handleFieldChange = (field) => (event) => {
    onChange({ ...requirements, [field]: event.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          2. Xác định yêu cầu &amp; gợi ý
        </h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Mô tả sở thích và những điểm bạn muốn thay đổi. Hệ thống sử dụng thông
          tin này để gợi ý vật liệu, màu sắc và chi tiết phù hợp với ảnh mẫu.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800/40 p-4">
          <span className="text-sm font-medium text-slate-200">
            Bảng màu mong muốn
          </span>
          <textarea
            rows={3}
            value={requirements.colorPalette}
            onChange={handleFieldChange("colorPalette")}
            placeholder="Ví dụ: trắng kem làm chủ đạo, điểm nhấn màu gỗ óc chó và hệ thống đèn vàng ấm."
            className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </label>

        <label className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800/40 p-4">
          <span className="text-sm font-medium text-slate-200">
            Vật liệu &amp; trang trí mong muốn
          </span>
          <textarea
            rows={3}
            value={requirements.decorItems}
            onChange={handleFieldChange("decorItems")}
            placeholder="Ví dụ: thêm lam gỗ, bồn cây treo, đèn tường kiểu tối giản."
            className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
          />
        </label>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-200">
          Chọn phong cách ngoại thất chính
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {STYLE_OPTIONS.map((option) => {
            const isActive = option.value === requirements.style;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ ...requirements, style: option.value })}
                className={`rounded-xl border p-4 text-left transition ${
                  isActive
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-200 shadow"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-emerald-300/60 hover:bg-slate-800"
                }`}
              >
                <p className="font-semibold">{option.value}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300/80">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800/40 p-4">
        <span className="text-sm font-medium text-slate-200">
          Gợi ý thêm cho hệ thống AI
        </span>
        <textarea
          rows={3}
          value={requirements.aiSuggestions}
          onChange={handleFieldChange("aiSuggestions")}
          placeholder="Ví dụ: ưu tiên gợi ý ban công xanh, tận dụng ánh sáng tự nhiên, giữ độ cao mái như ảnh mẫu."
          className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
        />
      </label>

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
          onClick={onNext}
          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

export default SelectRequirementsStep;
