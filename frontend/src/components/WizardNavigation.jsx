function WizardNavigation({
  onBack = () => {},
  onNext = () => {},
  disableBack = false,
  disableNext = false,
  backLabel = "Quay lại",
  nextLabel = "Tiếp tục",
  nextLoading = false,
  secondaryRight,
  primaryRight,
}) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={disableBack}
        className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
      >
        {backLabel}
      </button>
      <div className="flex flex-wrap gap-3 sm:justify-end">
        {secondaryRight ?? null}
        {primaryRight ?? (
          <button
            type="button"
            onClick={onNext}
            disabled={disableNext || nextLoading}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {nextLoading ? "Đang xử lý..." : nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default WizardNavigation;
