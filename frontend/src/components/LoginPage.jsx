import { useState } from "react";

function LoginPage({ onLogin, onSwitchMode, prefillEmail = "", notice = "" }) {
  const [credentials, setCredentials] = useState({ email: prefillEmail, password: "" });
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setCredentials((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onLogin({
      email: credentials.email.trim(),
      password: credentials.password,
    });
    if (!result.ok) {
      setError(result.message || "Đăng nhập thất bại.");
    } else {
      setError("");
    }
  };

  return (
    <div className="wizard-shell" style={{ justifyContent: "center" }}>
      <div className="wizard-card" style={{ width: "min(420px, 92%)", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "44px" }}>🔐</div>
          <h2 className="wizard-card__title">Đăng nhập AI House Designer</h2>
          <p className="wizard-card__subtitle">
            Sử dụng tài khoản nội bộ để tiếp tục theo dõi và tạo phương án thiết kế ngoại thất.
          </p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "18px" }} onSubmit={handleSubmit}>
          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Email</span>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={handleChange("email")}
              className="input-text"
              placeholder="ví dụ: admin@ngoai-that.ai"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Mật khẩu</span>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={handleChange("password")}
              className="input-text"
              placeholder="Nhập mật khẩu"
            />
          </label>

          {notice ? <div className="alert info">{notice}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}

          <button type="submit" className="btn btn-primary">
            Đăng nhập
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "0.85rem", color: "rgba(226,233,255,0.7)" }}>
          Chưa có tài khoản?
          <button
            type="button"
            onClick={() => onSwitchMode("register")}
            className="btn btn-ghost"
            style={{ marginLeft: "8px", padding: "6px 14px" }}
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
