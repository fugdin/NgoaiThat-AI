import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL;
    if (!base) {
      setHealth({ ok: false, error: "❌ Missing VITE_API_URL in .env" });
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);

    fetch(`${base}/health`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) =>
        setHealth({
          ok: false,
          error: err.name === "AbortError" ? "Timeout after 5s" : "Fetch error",
        })
      )
      .finally(() => clearTimeout(t));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">AI Exterior - Frontend Skeleton</h1>
      <p className="text-sm opacity-80">
        Health check: {health ? JSON.stringify(health) : "Loading..."}
      </p>
    </div>
  );
}

export default App;
