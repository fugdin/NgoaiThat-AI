import { useState } from "react";

function LoginPage({ onLogin, onSwitchMode, prefillEmail = "", notice = "" }) {
  const [credentials, setCredentials] = useState({
    email: prefillEmail,
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setCredentials((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await onLogin({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (!result?.ok) {
        setError(result?.message || "Dang nhap that bai.");
      }
    } catch (err) {
      setError(err?.message || "Dang nhap that bai.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wizard-shell" style={{ justifyContent: "center" }}>
      <div
        className="wizard-card"
        style={{ width: "min(420px, 92%)", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "44px" }}>??</div>
          <h2 className="wizard-card__title">Dang nhap AI House Designer</h2>
          <p className="wizard-card__subtitle">
            Su dung tai khoan noi bo de tiep tuc theo doi va tao phuong an
            thiet ke ngoai that.
          </p>
        </div>

        <form
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          onSubmit={handleSubmit}
        >
          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Email
            </span>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={handleChange("email")}
              className="input-text"
              placeholder="vi du: admin@ngoai-that.ai"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Mat khau
            </span>
            <input
              type="password"
              required
              value={credentials.password}
              onChange={handleChange("password")}
              className="input-text"
              placeholder="Nhap mat khau"
            />
          </label>

          {notice ? <div className="alert info">{notice}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Dang nhap..." : "Dang nhap"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "18px",
            fontSize: "0.85rem",
            color: "rgba(226,233,255,0.7)",
          }}
        >
          Chua co tai khoan?
          <button
            type="button"
            onClick={() => onSwitchMode("register")}
            className="btn btn-ghost"
            style={{ marginLeft: "8px", padding: "6px 14px" }}
          >
            Dang ky ngay
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
