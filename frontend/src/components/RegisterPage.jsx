import { useState } from "react";

function RegisterPage({ onRegister, onSwitchMode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
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
    if (form.password.length < 6) {
      setError("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    const result = onRegister({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    if (!result.ok) {
      setError(result.message || "Đăng ký thất bại, vui lòng thử lại.");
    }
  };

  return (
    <div className="wizard-shell" style={{ justifyContent: "center" }}>
      <div className="wizard-card" style={{ width: "min(460px, 92%)", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "44px" }}>🆕</div>
          <h2 className="wizard-card__title">Tạo tài khoản mới</h2>
          <p className="wizard-card__subtitle">
            Đăng ký bằng email công việc để bắt đầu trải nghiệm AI House Designer.
          </p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "18px" }} onSubmit={handleSubmit}>
          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Họ tên hiển thị</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleChange("name")}
              className="input-text"
              placeholder="Ví dụ: Nguyễn Minh An"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Email công việc</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              className="input-text"
              placeholder="ví dụ: an.nguyen@ngoai-that.ai"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Mật khẩu</span>
            <input
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              className="input-text"
              placeholder="Tối thiểu 6 ký tự"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Xác nhận mật khẩu</span>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={handleChange("confirm")}
              className="input-text"
              placeholder="Nhập lại mật khẩu"
            />
          </label>

          {error ? <div className="alert error">{error}</div> : null}

          <button type="submit" className="btn btn-primary">
            Tạo tài khoản
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "0.85rem", color: "rgba(226,233,255,0.7)" }}>
          Đã có tài khoản?
          <button
            type="button"
            onClick={() => onSwitchMode("login")}
            className="btn btn-ghost"
            style={{ marginLeft: "8px", padding: "6px 14px" }}
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
