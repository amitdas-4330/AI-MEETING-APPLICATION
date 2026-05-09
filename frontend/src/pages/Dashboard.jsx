import { useState } from "react";

import MeetingRecorder from "../sections/MeetingRecorder";
import TranscriptPanel from "../sections/TranscriptPanel";
import SummaryPanel from "../sections/SummaryPanel";

import TeamSection from "../components/TeamSection";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

import "../styles/dashboard.css";

function Dashboard() {

  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // MOBILE SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (

    <div className="dashboard-layout">

      {/* =====================================================
          HAMBURGER TOGGLE
          - Sits OUTSIDE dashboard-main so it is never part
            of the content flow (no full-width stretching).
          - Uses position:fixed in CSS, pinned to left side
            of the navbar row.
          - 3 divs power the 3-line → X animation.
          - Class "open" is toggled to animate to X.
      ===================================================== */}
      <button
        className={`hamburger ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <div></div>
        <div></div>
        <div></div>
      </button>

      {/* MAIN */}
      <div className="dashboard-main">

        {/* SIDEBAR — overlay is handled inside Sidebar.jsx */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* CONTENT */}
        <div className="dashboard-content">

          {/* HOME */}
          <section id="home" className="section">
            <MeetingRecorder
              setTranscript={setTranscript}
              setSummary={setSummary}
              setLoading={setLoading}
            />
          </section>

          {/* TRANSCRIPT */}
          <section id="transcript" className="section">
            <TranscriptPanel
              transcript={transcript}
              loading={loading}
            />
          </section>

          {/* SUMMARY */}
          <section id="summary" className="section">
            <SummaryPanel
              summary={summary}
              loading={loading}
            />
          </section>

          {/* TEAM */}
          <section id="team" className="section">
            <TeamSection />
          </section>

          {/* ABOUT */}
          <section id="about" className="section">
            <Footer />
          </section>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;