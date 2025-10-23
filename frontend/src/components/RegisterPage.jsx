import { useState } from "react";

function RegisterPage({ onRegister, onSwitchMode }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!form.name.trim()) {
      setError("Vui long nhap ho ten hien thi.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mat khau xac nhan khong khop.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mat khau can toi thieu 6 ky tu.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await onRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (!result?.ok) {
        setError(result?.message || "Dang ky that bai, vui long thu lai.");
      }
    } catch (err) {
      setError(err?.message || "Dang ky that bai, vui long thu lai.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wizard-shell" style={{ justifyContent: "center" }}>
      <div
        className="wizard-card"
        style={{ width: "min(460px, 92%)", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "44px" }}>??</div>
          <h2 className="wizard-card__title">Tao tai khoan moi</h2>
          <p className="wizard-card__subtitle">
            Dang ky bang email cong viec de bat dau trai nghiem AI House
            Designer.
          </p>
        </div>

        <form
          style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          onSubmit={handleSubmit}
        >
          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Ho ten hien thi
            </span>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleChange("name")}
              className="input-text"
              placeholder="Vi du: Nguyen Minh An"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Email cong viec
            </span>
            <input
              type="email"
              required
              value={form.email}
              onChange={handleChange("email")}
              className="input-text"
              placeholder="Vi du: an.nguyen@ngoai-that.ai"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Mat khau
            </span>
            <input
              type="password"
              required
              value={form.password}
              onChange={handleChange("password")}
              className="input-text"
              placeholder="Toi thieu 6 ky tu"
            />
          </label>

          <label>
            <span style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Xac nhan mat khau
            </span>
            <input
              type="password"
              required
              value={form.confirm}
              onChange={handleChange("confirm")}
              className="input-text"
              placeholder="Nhap lai mat khau"
            />
          </label>

          {error ? <div className="alert error">{error}</div> : null}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Dang ky..." : "Tao tai khoan"}
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
          Da co tai khoan?
          <button
            type="button"
            onClick={() => onSwitchMode("login")}
            className="btn btn-ghost"
            style={{ marginLeft: "8px", padding: "6px 14px" }}
          >
            Dang nhap
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
