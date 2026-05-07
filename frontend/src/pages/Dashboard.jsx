import { useState } from "react";

import MeetingRecorder from "../sections/MeetingRecorder";
import TranscriptPanel from "../sections/TranscriptPanel";
import SummaryPanel from "../sections/SummaryPanel";

import TeamSection from "../components/TeamSection";
import Footer from "../components/Footer";

import "../styles/dashboard.css";

function Dashboard() {

  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  return (
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

      {/* SUMMARY (IMPORTANT FIX) */}
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
  );
}

export default Dashboard;