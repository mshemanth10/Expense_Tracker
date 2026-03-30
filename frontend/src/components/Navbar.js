import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 className="fw-bold">💰 FinTrack</h3>
        <small className="text-secondary">Smart Expense Dashboard</small>
      </div>

      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;