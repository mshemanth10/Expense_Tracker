import { useNavigate, useLocation } from "react-router-dom";

import AIChatbot from "../components/AIChatbot";

const NAV = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Expenses",
    path: "/expenses",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    path: "/charts",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username") || "User";

  const initial = username[0].toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <>
      <style>{`
        .layout-wrap {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          background: #f0ede8;
        }
        .sidebar {
          width: 230px;
          background: #111218;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          z-index: 20;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-logo-wrap {
          padding: 28px 24px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 10px;
        }
        .sidebar-logo {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .sidebar-logo-dot { color: #c4431a; }
        .sidebar-logo-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .nav-section-label {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0 24px;
          margin: 12px 0 6px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          margin: 2px 10px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.15s;
          text-decoration: none;
          user-select: none;
          position: relative;
        }
        .nav-item:hover {
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.07);
        }
        .nav-item.active {
          color: #fff;
          background: linear-gradient(135deg, rgba(196,67,26,0.25), rgba(196,67,26,0.12));
          border: 1px solid rgba(196,67,26,0.2);
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 3px; height: 60%;
          background: #c4431a;
          border-radius: 0 3px 3px 0;
        }
        .nav-item-badge {
          margin-left: auto;
          background: rgba(196,67,26,0.2);
          color: #f97316;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 20px;
        }
        .sidebar-bottom {
          margin-top: auto;
          padding: 16px 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: default;
          margin-bottom: 4px;
        }
        .sidebar-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c4431a, #e85520);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }
        .sidebar-username {
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.8);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sidebar-role { font-size: 11px; color: rgba(255,255,255,0.3); }
        .logout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.3); cursor: pointer;
          background: none; border: none; width: 100%;
          transition: all 0.15s; font-family: 'Inter', sans-serif;
        }
        .logout-btn:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .main-content {
          flex: 1;
          padding: 36px 40px;
          overflow-y: auto;
          background: #f0ede8;
          min-height: 100vh;
        }
        @media (max-width: 768px) {
          .sidebar { width: 64px; }
          .sidebar-logo-sub, .nav-item span, .sidebar-username, .sidebar-role,
          .nav-section-label, .logout-btn span, .nav-item-badge { display: none; }
          .sidebar-logo { font-size: 18px; }
          .main-content { padding: 24px 20px; }
        }
      `}</style>

      <div className="layout-wrap">
        <nav className="sidebar">
          <div className="sidebar-logo-wrap">
            <div className="sidebar-logo">
              Spendly<span className="sidebar-logo-dot">.</span>
            </div>
            <div className="sidebar-logo-sub">Finance Tracker</div>
          </div>

          <div className="nav-section-label">Menu</div>

          {NAV.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.label}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            );
          })}

          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div className="sidebar-avatar">{initial}</div>
              <div>
                <div className="sidebar-username">{username}</div>
                <div className="sidebar-role">Free plan</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <main className="main-content">{children}</main>
        <AIChatbot />
      </div>
    </>
  );
}