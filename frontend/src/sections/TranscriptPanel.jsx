import { useEffect, useRef } from "react";
import "../styles/panels.css";

function TranscriptPanel({ transcript = "", loading = false }) {

  const contentRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop =
        contentRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="panel transcript-panel">

      <div className="panel-header">
        <h3>🎤 Transcript</h3>

        {loading && <span className="live-dot"></span>}
      </div>

      <div ref={contentRef} className="panel-body">

        {loading
          ? "⏳ Processing audio..."
          : transcript
          ? transcript
          : "Your transcript will appear here..."}

      </div>

    </div>
  );
}

export default TranscriptPanel;