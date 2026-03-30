import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./services/api";
import { toast } from "react-toastify";

const FEATURES = [
  { icon: "🤖", title: "AI Finance Advisor", desc: "Powered by Gemini — personalized insights on your spending" },
  { icon: "📊", title: "Live Charts & Analytics", desc: "Visual breakdowns by category, month, and trends" },
  { icon: "⚡", title: "Instant Expense Logging", desc: "Add, edit and delete expenses in seconds" },
  { icon: "📄", title: "PDF Export", desc: "Download your expense reports anytime" },
];

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/token/", form);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", form.username);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #0d0f1a;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(196,67,26,0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.08) 0%, transparent 50%);
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          max-width: 940px;
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          animation: fadeUp 0.5s ease both;
        }
        .login-left {
          background: linear-gradient(145deg, #111218 0%, #1a1c2e 100%);
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          gap: 40px;
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          top: -80px; left: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(196,67,26,0.2), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .login-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px;
          color: #fff;
          letter-spacing: -1px;
          position: relative;
        }
        .login-logo-dot { color: #c4431a; }
        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(196,67,26,0.15);
          border: 1px solid rgba(196,67,26,0.3);
          color: #f97316;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          margin-top: 10px;
          letter-spacing: 0.04em;
        }
        .login-hero { color: #fff; }
        .login-hero h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 34px;
          line-height: 1.25;
          margin-bottom: 14px;
          color: #fff;
        }
        .login-hero p {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
        }
        .login-features { display: flex; flex-direction: column; gap: 16px; }
        .login-feature {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          transition: background 0.2s;
        }
        .login-feature:hover { background: rgba(255,255,255,0.07); }
        .login-feature-icon {
          font-size: 20px;
          width: 38px; height: 38px;
          background: rgba(196,67,26,0.15);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .login-feature-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .login-feature-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        .login-right {
          background: #fff;
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .login-form-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 28px;
          color: #111;
          margin-bottom: 6px;
        }
        .login-form-sub { font-size: 14px; color: #888; margin-bottom: 36px; }
        .login-form-group { margin-bottom: 20px; }
        .login-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #999;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .login-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #111;
          background: #fafafa;
          outline: none;
          transition: all 0.2s;
        }
        .login-input:focus {
          border-color: #c4431a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(196,67,26,0.08);
        }
        .login-error {
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          border: 1px solid #fecaca;
          display: flex; align-items: center; gap: 8px;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #c4431a 0%, #e85520 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(196,67,26,0.4);
        }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .login-footer {
          margin-top: 28px;
          font-size: 14px;
          color: #888;
          text-align: center;
        }
        .login-link { color: #c4431a; text-decoration: none; font-weight: 600; }
        .login-link:hover { text-decoration: underline; }
        .login-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0; color: #ccc; font-size: 12px;
        }
        .login-divider::before, .login-divider::after {
          content: ''; flex: 1; height: 1px; background: #eee;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          {/* Left */}
          <div className="login-left">
            <div>
              <div className="login-logo">
                Spendly<span className="login-logo-dot">.</span>
              </div>
              <div className="login-badge">✦ AI-Powered Finance Tracker</div>
            </div>

            <div className="login-hero">
              <h2>Take control of every rupee</h2>
              <p>Track spending, get AI insights, and build better money habits — all in one beautiful dashboard.</p>
            </div>

            <div className="login-features">
              {FEATURES.map((f) => (
                <div key={f.title} className="login-feature">
                  <div className="login-feature-icon">{f.icon}</div>
                  <div>
                    <div className="login-feature-title">{f.title}</div>
                    <div className="login-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="login-right">
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-sub">Sign in to your account to continue</p>

            {error && <div className="login-error">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label className="login-label">Username</label>
                <input
                  className="login-input"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="login-form-group">
                <label className="login-label">Password</label>
                <input
                  className="login-input"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="login-divider">or</div>

            <div className="login-footer">
              Don't have an account?{" "}
              <Link to="/register" className="login-link">Create one free</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}