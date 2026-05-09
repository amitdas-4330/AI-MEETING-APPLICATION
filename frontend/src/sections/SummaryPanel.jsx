import "../styles/panels.css";
import jsPDF from "jspdf";

function SummaryPanel({ summary, loading }) {

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFont("Helvetica", "Normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(summary || "No summary available", 180);

    doc.text("AI Meeting Summary", 10, 10);
    doc.text(lines, 10, 20);

    doc.save("meeting-summary.pdf");
  };

  return (
    <div className="panel summary-panel">

      <div className="panel-header">
        <h3>🤖 AI Summary</h3>

        {summary && (
          <button onClick={downloadPDF} className="pdf-btn">
            ⬇ Download PDF
          </button>
        )}
      </div>

      <div className="panel-body">

        {loading ? (
          <p>⏳ Generating summary...</p>
        ) : summary ? (

          <ul className="summary-list">
            {summary
              .split("\n")
              .filter(line => line.trim() !== "")
              .map((item, index) => (
                <li key={index} className="summary-item">
                  {item}
                </li>
              ))}
          </ul>

        ) : (
          <p>Your AI summary will appear here...</p>
        )}

      </div>

    </div>
  );
}

export default SummaryPanel;