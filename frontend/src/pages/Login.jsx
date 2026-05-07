import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await res.json();

      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || `Login failed (${res.status})`);
      }

      // success
      localStorage.setItem("token", data.token);

      alert("Login successful");

      navigate("/dashboard");

    } catch (err) {

      console.error("LOGIN ERROR:", err);
      alert(err.message || "Login failed");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="auth-container">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}
      <div className="auth-left">

        <div className="brand-badge">
          ⚡ AI Powered Meeting Assistant
        </div>

        <h1>
          Turn Meetings Into <span>Smart Insights</span>
        </h1>

        <p className="hero-desc">
          Record, transcribe, summarize, and organize your meetings
          automatically with next-generation AI technology.
        </p>

        {/* FEATURE LIST */}
        <div className="feature-list">

          <div className="feature-card">

            <div className="feature-icon">
              🎙️
            </div>

            <div>
              <h3>Real-Time Recording</h3>

              <p>
                Capture every important conversation with
                crystal-clear audio quality.
              </p>
            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              📝
            </div>

            <div>
              <h3>AI Transcription</h3>

              <p>
                Convert speech into highly accurate transcripts instantly.
              </p>
            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ⚡
            </div>

            <div>
              <h3>Smart Summaries</h3>

              <p>
                Get automatic meeting summaries and action points in seconds.
              </p>
            </div>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              🔒
            </div>

            <div>
              <h3>Secure & Private</h3>

              <p>
                Your recordings and transcripts stay safe and encrypted.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}
      <div className="auth-right">

        <div className="login-box">

          <h2>Login</h2>

          <p className="sub-text">
            Continue your AI journey
          </p>

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
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="switch-text">

            Don't have an account?

            <span
              className="switch-link"
              onClick={() => navigate("/register")}
            >
              Register
            </span>

          </p>

        </div>

      </div>

    </div>

  );
}

export default Login;