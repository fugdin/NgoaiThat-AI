import { useCallback, useEffect, useMemo, useState } from "react";
import { generateFinal, generateStyle, uploadSample } from "../api/wizard";
import {
  createHistoryId,
  createInitialData,
  createInitialLoading,
  createInitialMessages,
  readFileAsDataUrl,
} from "../utils/wizard";

const cloneInitialData = () => createInitialData();
const cloneInitialLoading = () => createInitialLoading();
const cloneInitialMessages = () => createInitialMessages();

function useWizardFlow({ steps = [], pushToast = () => {} } = {}) {
  const totalSteps = Array.isArray(steps) ? steps.length : 0;
  const [stepIndex, setStepIndex] = useState(0);
  const [wizardData, setWizardData] = useState(cloneInitialData);
  const [loadingState, setLoadingState] = useState(cloneInitialLoading);
  const [apiMessages, setApiMessages] = useState(cloneInitialMessages);

  useEffect(() => {
    return () => {
      if (wizardData.sampleImage?.preview) {
        URL.revokeObjectURL(wizardData.sampleImage.preview);
      }
      if (wizardData.houseImage?.preview) {
        URL.revokeObjectURL(wizardData.houseImage.preview);
      }
    };
  }, [wizardData.sampleImage?.preview, wizardData.houseImage?.preview]);

  const goNext = useCallback(() => {
    setStepIndex((prev) => {
      if (totalSteps <= 0) return 0;
      return Math.min(prev + 1, totalSteps - 1);
    });
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const resetWizard = useCallback(() => {
    setWizardData((prev) => {
      if (prev.sampleImage?.preview) {
        URL.revokeObjectURL(prev.sampleImage.preview);
      }
      if (prev.houseImage?.preview) {
        URL.revokeObjectURL(prev.houseImage.preview);
      }
      return cloneInitialData();
    });
    setApiMessages(cloneInitialMessages());
    setLoadingState(cloneInitialLoading());
    setStepIndex(0);
  }, []);

  const handleSampleSelected = useCallback(
    async (input) => {
      setApiMessages((prev) => ({ ...prev, sample: "", house: "" }));

      setWizardData((prev) => {
        if (prev.sampleImage?.preview) {
          URL.revokeObjectURL(prev.sampleImage.preview);
        }
        const nextTemp = prev.tempId || createHistoryId();

        if (!input) {
          return {
            ...cloneInitialData(),
            tempId: nextTemp,
            requirements: prev.requirements,
          };
        }

        if (typeof File !== "undefined" && input instanceof File) {
          const preview = URL.createObjectURL(input);
          return {
            ...prev,
            sampleImage: { file: input, preview, name: input.name },
            tempId: nextTemp,
            houseImage: null,
            stylePlan: "",
            result: null,
          };
        }

        return {
          ...prev,
          sampleImage: input,
          tempId: input.tempId || prev.tempId || nextTemp,
          houseImage: null,
          stylePlan: "",
          result: null,
        };
      });

      if (!(typeof File !== "undefined" && input instanceof File)) {
        return;
      }

      try {
        const sampleDataUrl = await readFileAsDataUrl(input);
        if (sampleDataUrl) {
          setWizardData((prev) => ({
            ...prev,
            sampleImage: prev.sampleImage
              ? {
                  ...prev.sampleImage,
                  dataUrl: sampleDataUrl,
                  name: input.name,
                }
              : prev.sampleImage,
          }));
        }
      } catch (error) {
        console.warn("Không thể mã hóa ảnh mẫu thành data URL:", error);
      }

      setLoadingState((prev) => ({ ...prev, sample: true }));
      try {
        const response = await uploadSample(input);
        if (!response || response.ok === false || response.error) {
          const errorMessage =
            response?.message || "Không thể tải ảnh mẫu. Vui lòng thử lại.";
          setApiMessages((prev) => ({ ...prev, sample: errorMessage }));
          pushToast({
            variant: "error",
            title: "Tải ảnh mẫu thất bại",
            message: errorMessage,
          });
          return;
        }

        const tempId = response?.tempId || createHistoryId();
        const message =
          response?.message ||
          "Tải ảnh mẫu thành công. Chọn Tiếp tục để sang bước kế tiếp.";

        setWizardData((prev) => ({
          ...prev,
          tempId,
          sampleImage: prev.sampleImage
            ? { ...prev.sampleImage, tempId }
            : prev.sampleImage,
        }));

        setApiMessages((prev) => ({ ...prev, sample: message }));
      } catch (error) {
        console.error("uploadSample failed:", error);
        const fallbackMessage = "Không thể tải ảnh mẫu. Vui lòng thử lại.";
        setApiMessages((prev) => ({
          ...prev,
          sample: fallbackMessage,
        }));
        pushToast({
          variant: "error",
          title: "Tải ảnh mẫu thất bại",
          message: error?.message
            ? `${fallbackMessage} (Lý do: ${error.message})`
            : fallbackMessage,
        });
      } finally {
        setLoadingState((prev) => ({ ...prev, sample: false }));
      }
    },
    [pushToast]
  );

  const handleRequirementsChange = useCallback((requirements) => {
    setWizardData((prev) => ({
      ...prev,
      requirements,
    }));
  }, []);

  const handleGenerateStyle = useCallback(async () => {
    setApiMessages((prev) => ({ ...prev, requirements: "" }));

    const nextTempId = wizardData.tempId || createHistoryId();
    if (!wizardData.tempId) {
      setWizardData((prev) => ({ ...prev, tempId: nextTempId }));
    }

    const requirementsArray = [
      wizardData.requirements.style,
      wizardData.requirements.colorPalette,
      wizardData.requirements.decorItems,
      wizardData.requirements.aiSuggestions,
    ].filter(Boolean);

    if (requirementsArray.length === 0) {
      setApiMessages((prev) => ({
        ...prev,
        requirements: "Hãy nhập ít nhất một trường trước khi tiếp tục.",
      }));
      return;
    }

    setLoadingState((prev) => ({ ...prev, requirements: true }));
    try {
      const response = await generateStyle(nextTempId, requirementsArray);
      if (!response || response.ok === false || response.error) {
        const errorMessage =
          response?.message || "Không thể tạo gợi ý từ AI. Vui lòng thử lại.";
        setApiMessages((prev) => ({
          ...prev,
          requirements: errorMessage,
        }));
        pushToast({
          variant: "error",
          title: "Tạo gợi ý thất bại",
          message: errorMessage,
        });
        return;
      }

      const stylePlan =
        response?.plan ||
        (Array.isArray(response?.combined)
          ? response.combined.join("\n")
          : response?.promptHint || "");

      setWizardData((prev) => ({
        ...prev,
        stylePlan,
      }));

      setApiMessages((prev) => ({
        ...prev,
        requirements:
          response?.message ||
          "Đã tạo gợi ý từ AI. Chọn Tiếp tục để sang bước kế tiếp.",
      }));

      goNext();
    } catch (error) {
      console.error("generateStyle failed:", error);
      const fallbackMessage = "Không thể tạo gợi ý từ AI. Vui lòng thử lại.";
      setApiMessages((prev) => ({
        ...prev,
        requirements: fallbackMessage,
      }));
      pushToast({
        variant: "error",
        title: "Tạo gợi ý thất bại",
        message: error?.message
          ? `${fallbackMessage} (Lý do: ${error.message})`
          : fallbackMessage,
      });
    } finally {
      setLoadingState((prev) => ({ ...prev, requirements: false }));
    }
  }, [wizardData, goNext, pushToast]);

  const handleHouseSelected = useCallback(async (file) => {
    setWizardData((prev) => {
      if (prev.houseImage?.preview) {
        URL.revokeObjectURL(prev.houseImage.preview);
      }
      if (!file) {
        return { ...prev, houseImage: null };
      }
      if (typeof File !== "undefined" && file instanceof File) {
        return {
          ...prev,
          houseImage: {
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
          },
          result: null,
        };
      }
      return { ...prev, houseImage: file };
    });

    if (typeof File !== "undefined" && file instanceof File) {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        if (dataUrl) {
          setWizardData((prev) => ({
            ...prev,
            houseImage: prev.houseImage
              ? { ...prev.houseImage, dataUrl, name: file.name }
              : prev.houseImage,
          }));
        }
      } catch (error) {
        console.warn("Không thể mã hóa ảnh hiện trạng thành data URL:", error);
      }
    }
  }, []);

  const handleGenerateFinal = useCallback(async () => {
    if (!wizardData.houseImage?.file) {
      setApiMessages((prev) => ({
        ...prev,
        house: "Hãy tải ảnh hiện trạng trước khi tiếp tục.",
      }));
      return;
    }

    const tempId = wizardData.tempId || createHistoryId();
    setWizardData((prev) => ({ ...prev, tempId }));

    setLoadingState((prev) => ({ ...prev, house: true }));
    setApiMessages((prev) => ({ ...prev, house: "" }));

    try {
      const response = await generateFinal(
        tempId,
        wizardData.houseImage.file,
        wizardData.requirements
      );

      if (!response || response.ok === false || response.error) {
        const errorMessage =
          response?.message || "Không thể tạo phương án. Vui lòng thử lại.";
        setApiMessages((prev) => ({
          ...prev,
          house: errorMessage,
        }));
        pushToast({
          variant: "error",
          title: "Tạo ảnh gợi ý thất bại",
          message: errorMessage,
        });
        return;
      }

      const resultPayload = response?.result || response;

      setWizardData((prev) => ({
        ...prev,
        result: resultPayload,
      }));

      setApiMessages((prev) => ({
        ...prev,
        house:
          response?.message ||
          "Đã gửi ảnh hiện trạng. Kết quả sẽ hiển thị ở bước tiếp theo.",
      }));

      goNext();
    } catch (error) {
      console.error("generateFinal failed:", error);
      const fallbackMessage = "Không thể tạo phương án. Vui lòng thử lại.";
      setApiMessages((prev) => ({
        ...prev,
        house: fallbackMessage,
      }));
      pushToast({
        variant: "error",
        title: "Tạo ảnh gợi ý thất bại",
        message: error?.message
          ? `${fallbackMessage} (Lý do: ${error.message})`
          : fallbackMessage,
      });
    } finally {
      setLoadingState((prev) => ({ ...prev, house: false }));
    }
  }, [wizardData, goNext, pushToast]);

  const disableNextSample = !wizardData.sampleImage || loadingState.sample;
  const disableNextHouse = !wizardData.houseImage || loadingState.house;

  const currentStepId = useMemo(() => {
    if (!totalSteps) return "sample";
    return steps[stepIndex]?.id ?? steps[0]?.id ?? "sample";
  }, [stepIndex, steps, totalSteps]);

  const progressPercent = useMemo(() => {
    if (totalSteps <= 1) return 0;
    return (stepIndex / (totalSteps - 1)) * 100;
  }, [stepIndex, totalSteps]);

  return {
    wizardData,
    loadingState,
    apiMessages,
    stepIndex,
    currentStepId,
    progressPercent,
    disableNextSample,
    disableNextHouse,
    goNext,
    goBack,
    resetWizard,
    handleSampleSelected,
    handleRequirementsChange,
    handleGenerateStyle,
    handleHouseSelected,
    handleGenerateFinal,
  };
}

export default useWizardFlow;
