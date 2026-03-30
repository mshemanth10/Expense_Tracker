import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#0f172a",
        padding: "20px",
        borderRight: "1px solid #1e293b",
      }}
    >
      <h4 className="text-white fw-bold mb-4">💰 FinTrack</h4>

      <button
        className="btn btn-outline-light w-100 mb-3"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </button>

      <button
        className="btn btn-outline-light w-100 mb-3"
        onClick={handleLogout}
      >
        Logout
      </button>

      <small className="text-secondary mt-5 d-block">
        © 2026 Hemanth
      </small>
    </div>
  );
}

export default Sidebar;