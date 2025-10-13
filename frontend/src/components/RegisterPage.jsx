import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/wizard/upload-sample", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Vui lòng nhập họ tên hiển thị.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    const result = register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    if (!result.ok) {
      setError(result.message || "Đăng ký thất bại, vui lòng thử lại.");
      return;
    }

    navigate("/login", {
      replace: true,
      state: {
        prefillEmail: result.email,
        notice: "Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.",
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-400/80">
            Ngoại thất AI
          </p>
          <h1 className="text-2xl font-semibold">Đăng ký tài khoản</h1>
          <p className="text-sm text-slate-400">
            Tạo tài khoản designer để lưu trữ và theo dõi các dự án ngoại thất.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">
              Họ tên hiển thị
            </span>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleChange("name")}
              placeholder="vd: Nguyễn Minh An"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">
              Email công việc
            </span>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              placeholder="vd: an.nguyen@ngoai-that.ai"
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
              value={form.password}
              onChange={handleChange("password")}
              placeholder="Tối thiểu 6 ký tự"
              minLength={6}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">
              Xác nhận mật khẩu
            </span>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={handleChange("confirm")}
              placeholder="Nhập lại mật khẩu"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </label>

          {error ? (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Tạo tài khoản
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
