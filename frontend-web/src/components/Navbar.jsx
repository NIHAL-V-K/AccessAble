import { Link } from "react-router-dom";
import { Accessibility, ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <div className="brand-icon">
          <Accessibility size={25} />
        </div>
        <span>access<span className="brand-highlight">able</span></span>
      </Link>

      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#solutions">Solutions</a>
        <a href="#about">About us</a>
      </div>

      <div className="nav-actions">
        <Link to="/login" className="login-link">
          Log in
        </Link>

        <Link to="/register" className="nav-button">
          Get started <ArrowRight size={16} />
        </Link>
      </div>
    </nav>
  );
}