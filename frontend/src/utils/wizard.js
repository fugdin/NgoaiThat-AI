export const createInitialData = () => ({
  sampleImage: null,
  houseImage: null,
  outputImage: null,
  requirements: {
    style: "Hiện đại",
    colorPalette: "",
    decorItems: "",
    aiSuggestions: "",
  },
  stylePlan: "",
  result: null,
  tempId: "",
});

export const createInitialMessages = () => ({
  sample: "",
  requirements: "",
  house: "",
  result: "",
});

export const createInitialLoading = () => ({
  sample: false,
  requirements: false,
  house: false,
});

export const createHistoryId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!(file instanceof Blob)) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () =>
      reject(new Error("Không thể đọc tệp hình ảnh từ thiết bị."));
    reader.readAsDataURL(file);
  });
