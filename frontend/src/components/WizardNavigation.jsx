function WizardNavigation({
  onBack = () => {},
  onNext = () => {},
  disableBack = false,
  disableNext = false,
  backLabel = "Quay lại",
  nextLabel = "Tiếp tục",
  nextLoading = false,
  secondaryRight = null,
  primaryRight = null,
}) {
  return (
    <div className="button-group">
      <button
        type="button"
        onClick={onBack}
        disabled={disableBack || nextLoading}
        className={`btn btn-secondary${nextLoading ? " btn--disabled" : ""}`}
      >
        ← {backLabel}
      </button>
      <div className="button-group__right">
        {secondaryRight}
        {primaryRight ?? (
          <button
            type="button"
            onClick={onNext}
            disabled={disableNext || nextLoading}
            className={`btn btn-primary${nextLoading ? " btn--loading" : ""}`}
            aria-busy={nextLoading}
            aria-live="polite"
          >
            {nextLoading ? (
              <>
                <span className="btn__spinner" aria-hidden="true" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              nextLabel
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default WizardNavigation;
