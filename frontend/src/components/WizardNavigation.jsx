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
  const renderNextLabel = () => {
    if (nextLoading) {
      return "Đang xử lý...";
    }
    return nextLabel;
  };

  return (
    <div className="button-group">
      <button
        type="button"
        onClick={onBack}
        disabled={disableBack}
        className="btn btn-secondary"
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
            className="btn btn-primary"
          >
            {renderNextLabel()}
          </button>
        )}
      </div>
    </div>
  );
}

export default WizardNavigation;
