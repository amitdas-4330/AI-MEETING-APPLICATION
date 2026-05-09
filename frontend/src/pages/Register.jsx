import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      // SAFETY CHECK
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server Error (${res.status})`);
      }

      const data = await res.json();

      console.log("REGISTER SUCCESS:", data);

      alert("Registered Successfully");

      // clear form
      setName("");
      setEmail("");
      setPassword("");

      navigate("/");

    } catch (err) {

      console.error("REGISTER ERROR:", err);
      alert(err.message || "Something went wrong");

    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="auth-container">

      {/* LEFT SIDE */}
      <div className="auth-left">

        <div className="brand-badge">
          ⚡ AI Powered Meeting Assistant
        </div>

        <h1>
          Turn Meetings Into <span>Smart Insights</span>
        </h1>

        <p className="hero-desc">
          Record, transcribe, and summarize meetings using AI.
        </p>

      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">

        <div className="login-box">

          <h2>Create Account</h2>

          <p className="sub-text">
            Start your AI-powered journey
          </p>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="switch-text">
            Already have an account?
            <span
              className="switch-link"
              onClick={() => navigate("/")}
            >
              Login
            </span>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;