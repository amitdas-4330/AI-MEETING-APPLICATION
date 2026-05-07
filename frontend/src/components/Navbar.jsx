import "../styles/navbar.css";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      <div className="logo" onClick={() => navigate("/dashboard")}>
        Meeting<span>AI</span>
      </div>

      <div
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className={`nav-center ${menuOpen ? "open" : ""}`}>

        <button onClick={() => scrollToSection("home")} className="nav-item">
          Home
        </button>

        <button onClick={() => scrollToSection("transcript")} className="nav-item">
          Transcript
        </button>

        <button onClick={() => scrollToSection("summary")} className="nav-item">
          Summary
        </button>

        <button onClick={() => scrollToSection("team")} className="nav-item">
          Team
        </button>

        <button onClick={() => scrollToSection("about")} className="nav-item">
          About
        </button>

      </div>

      <div className="nav-right">

        <div className="profile-circle">U</div>

        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>

      </div>

    </nav>
  );
}

export default Navbar;