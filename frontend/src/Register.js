import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./services/api";
import { toast } from "react-toastify";

const STEPS = [
  { num: "01", title: "Create your account", desc: "Takes less than a minute" },
  { num: "02", title: "Log your expenses", desc: "By category, date & amount" },
  { num: "03", title: "Get AI insights", desc: "Gemini analyses your spending" },
  { num: "04", title: "Track & grow", desc: "Build better money habits" },
];

const focusIn = (e) => {
  e.target.style.borderColor = "#c4431a";
  e.target.style.boxShadow = "0 0 0 3px rgba(196,67,26,0.08)";
  e.target.style.background = "#fff";
};
const focusOut = (e) => {
  e.target.style.borderColor = "#e5e5e5";
  e.target.style.boxShadow = "none";
  e.target.style.background = "#fafafa";
};

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      await api.post("/api/register/", { username: form.username, email: form.email, password: form.password });
      toast.success("Account created! Please sign in.");
      navigate("/");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.username) setError("Username already taken.");
      else if (data?.email) setError("Email already registered.");
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px",
    border: "1.5px solid #e5e5e5", borderRadius: "10px",
    fontFamily: "'Inter', sans-serif", fontSize: "14px",
    color: "#111", background: "#fafafa", outline: "none",
    transition: "all 0.2s", boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        .reg-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 32px 24px;
          background: #0d0f1a;
          background-image:
            radial-gradient(ellipse at 80% 50%, rgba(196,67,26,0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 50%);
          font-family: 'Inter', sans-serif;
        }
        .reg-card {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          max-width: 960px; width: 100%;
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          animation: fadeUp 0.5s ease both;
        }
        .reg-left {
          background: linear-gradient(145deg, #111218 0%, #1a1c2e 100%);
          padding: 56px 44px;
          display: flex; flex-direction: column; gap: 36px;
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative; overflow: hidden;
        }
        .reg-left::after {
          content: '';
          position: absolute; bottom: -100px; right: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(196,67,26,0.15), transparent 70%);
          border-radius: 50%; pointer-events: none;
        }
        .reg-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px; color: #fff; letter-spacing: -1px;
        }
        .reg-logo-dot { color: #c4431a; }
        .reg-hero h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px; line-height: 1.3; color: #fff; margin-bottom: 12px;
        }
        .reg-hero p { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.7; }
        .reg-steps { display: flex; flex-direction: column; gap: 0; }
        .reg-step {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .reg-step:last-child { border-bottom: none; }
        .reg-step-num {
          font-size: 10px; font-weight: 700; color: #c4431a;
          letter-spacing: 0.05em; margin-top: 3px; flex-shrink: 0; width: 24px;
        }
        .reg-step-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .reg-step-desc { font-size: 12px; color: rgba(255,255,255,0.4); }
        .reg-right {
          background: #fff;
          padding: 48px 52px;
          display: flex; flex-direction: column; justify-content: center;
        }
        .reg-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 26px; color: #111; margin-bottom: 4px;
        }
        .reg-sub { font-size: 14px; color: #888; margin-bottom: 32px; }
        .reg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
        .reg-group { margin-bottom: 18px; }
        .reg-label {
          display: block; font-size: 11px; font-weight: 600;
          color: #999; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 7px;
        }
        .reg-error {
          background: #fef2f2; color: #b91c1c; font-size: 13px;
          padding: 10px 14px; border-radius: 8px; margin-bottom: 16px;
          border: 1px solid #fecaca; display: flex; align-items: center; gap: 8px;
        }
        .reg-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #c4431a 0%, #e85520 100%);
          color: #fff; border: none; border-radius: 10px;
          font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; margin-top: 8px; transition: all 0.2s; letter-spacing: 0.01em;
        }
        .reg-btn:hover:not(:disabled) {
          transform: translateY(-1px); box-shadow: 0 8px 24px rgba(196,67,26,0.4);
        }
        .reg-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .reg-footer { margin-top: 22px; font-size: 14px; color: #888; text-align: center; }
        .reg-link { color: #c4431a; text-decoration: none; font-weight: 600; }
        .reg-link:hover { text-decoration: underline; }
        .reg-strength {
          height: 3px; border-radius: 2px; margin-top: 6px; background: #eee; overflow: hidden;
        }
        .reg-strength-fill {
          height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s;
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-card">
          {/* Left */}
          <div className="reg-left">
            <div className="reg-logo">Spendly<span className="reg-logo-dot">.</span></div>
            <div className="reg-hero">
              <h2>Start tracking your money today</h2>
              <p>Join smart spenders who use AI to understand and optimise their finances.</p>
            </div>
            <div className="reg-steps">
              {STEPS.map((s) => (
                <div key={s.num} className="reg-step">
                  <div className="reg-step-num">{s.num}</div>
                  <div>
                    <div className="reg-step-title">{s.title}</div>
                    <div className="reg-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="reg-right">
            <h2 className="reg-title">Create your account</h2>
            <p className="reg-sub">Free forever — no credit card required</p>

            {error && <div className="reg-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="reg-row">
                <div>
                  <label className="reg-label">Username</label>
                  <input style={inputStyle} name="username" type="text"
                    value={form.username} onChange={handleChange}
                    placeholder="yourname" required
                    onFocus={focusIn} onBlur={focusOut} />
                </div>
                <div>
                  <label className="reg-label">Email</label>
                  <input style={inputStyle} name="email" type="email"
                    value={form.email} onChange={handleChange}
                    placeholder="you@email.com" required
                    onFocus={focusIn} onBlur={focusOut} />
                </div>
              </div>

              <div className="reg-group">
                <label className="reg-label">Password</label>
                <input style={inputStyle} name="password" type="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min 8 characters" required
                  onFocus={focusIn} onBlur={focusOut} />
                {form.password && (
                  <div className="reg-strength">
                    <div className="reg-strength-fill" style={{
                      width: form.password.length >= 12 ? "100%" : form.password.length >= 8 ? "60%" : "30%",
                      background: form.password.length >= 12 ? "#22c55e" : form.password.length >= 8 ? "#f59e0b" : "#ef4444",
                    }} />
                  </div>
                )}
              </div>

              <div className="reg-group">
                <label className="reg-label">Confirm Password</label>
                <input style={inputStyle} name="confirmPassword" type="password"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password" required
                  onFocus={focusIn} onBlur={focusOut} />
              </div>

              <button type="submit" className="reg-btn" disabled={loading}>
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            <div className="reg-footer">
              Already have an account? <Link to="/" className="reg-link">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}