import { useEffect, useState } from "react";

function LoginPage({ onLogin, onSwitchMode, prefillEmail = "", notice = "" }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice);

  useEffect(() => {
    if (prefillEmail) {
      setCredentials((prev) => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  useEffect(() => {
    setInfo(notice);
  }, [notice]);

  const handleChange = (field) => (event) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = onLogin({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (!result.ok) {
      setError(result.message || "Đăng nhập thất bại, vui lòng thử lại.");
      return;
    }

    setError("");
    setInfo("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-400/80">
            Ngoại thất AI
          </p>
          <h1 className="text-2xl font-semibold">Đăng nhập hệ thống</h1>
          <p className="text-sm text-slate-400">
            Quản lý yêu cầu thiết kế ngoại thất bằng tài khoản đã được cấp.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">
              Email công việc
            </span>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={handleChange("email")}
              placeholder="vd: admin@ngoai-that.ai"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">
              Mật khẩu
            </span>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={handleChange("password")}
              placeholder="Nhập mật khẩu"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </label>

          {info ? (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {info}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => onSwitchMode("register")}
            className="font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Đăng ký ngay
          </button>
        </p>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-300">Tài khoản demo:</p>
          <p>Admin: admin@ngoai-that.ai / admin123</p>
          <p>Chuyên gia: designer@ngoai-that.ai / design123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
