import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/health")
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(() => setHealth({ ok: false }));
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
