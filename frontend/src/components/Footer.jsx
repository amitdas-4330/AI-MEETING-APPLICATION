import "../styles/footer.css";

function Footer() {
  return (
    <div className="footer-extra" id="about">

      {/* Glow background */}
      <div className="footer-glow"></div>

      {/* Top Banner */}
      <div className="footer-banner">
        <h2>🚀 AI Meeting Assistant</h2>
        <p>Turn conversations into structured knowledge instantly</p>

        <p className="footer-subtext">
          Built for students, developers & professionals to save time using AI automation.
        </p>
      </div>

      <div className="footer-grid">

        {/* About */}
        <div className="footer-col">
          <h3>About</h3>

          <p>Turn every meeting into structured intelligence.</p>

          <ul className="about-list">
            <li>AI converts speech into clean transcripts</li>
            <li>Generates smart AI summaries automatically</li>
            <li>Extracts key action points from meetings</li>
            <li>Works for meetings, lectures & interviews</li>
            <li>Improves productivity and saves time</li>
          </ul>
        </div>

        {/* Features */}
        <div className="footer-col">
          <h3>Features</h3>
          <ul>
            <li>🔐 Secure Login & Authentication</li>
            <li>🎤 Audio to Text Conversion</li>
            <li>🌐 Multi-language Support</li>
            <li>🧑‍🤝‍🧑 Speaker Detection</li>
            <li>🧠 AI-Powered Summaries</li>
            <li>📌 Action Item Extraction</li>
            <li>📂 Meeting History Storage</li>
          </ul>
        </div>

        {/* Tech Stack */}
        <div className="footer-col">
          <h3>Tech Stack</h3>
          <ul>
            <li>⚛️ React (Vite) + CSS</li>
            <li>🟢 Node.js + Express</li>
            <li>🍃 MongoDB</li>
            <li>🐍 Flask (AI Service)</li>
            <li>🎙 Whisper AI</li>
            <li>🤖 OpenAI API</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h3>Contact</h3>
          <p>📧 amitbarandas2@.com</p>
          <p>📞 +91 9641134330</p>
          <p>📍 India</p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li>Upload</li>
            <li>History</li>
            <li>Dashboard</li>
            <li>About Project</li>
          </ul>
        </div>

        {/* Connect */}
        <div className="footer-col">
          <h3>Connect</h3>
          <p>🔗 GitHub</p>
          <p>💼 LinkedIn</p>
        </div>

      </div>

      {/* Feature Highlights */}
      <div className="footer-highlights">
        <div className="highlight-card">⚡ Fast Processing</div>
        <div className="highlight-card">🔐 Secure Data</div>
        <div className="highlight-card">🌍 Cloud Powered</div>
        <div className="highlight-card">🤖 AI Driven</div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        © 2026 AI Meeting Summarizer • Built with ❤️
        <br />
        <small>Version 1.0 | Status: Active 🚀</small>
      </div>

    </div>
  );
}

export default Footer;