import "../styles/sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const navigate = useNavigate();

  const meetings = [
    "Meeting with Team",
    "Client Discussion",
    "Project Planning"
  ];

  return (

    <>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        {/* MOBILE CLOSE BUTTON */}
        <button
          className="close-btn"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>

        {/* NEW MEETING BUTTON */}
        <button
          className="new-meeting-btn"
          onClick={() => {
            navigate("/recorder");
            setSidebarOpen(false);
          }}
        >
          + New Meeting
        </button>

        {/* HISTORY TITLE */}
        <h3 className="history-title">
          History
        </h3>

        {/* HISTORY LIST */}
        <div className="history-list">

          {meetings.map((item, index) => (

            <div
              key={index}
              className="history-item"
              onClick={() => setSidebarOpen(false)}
            >
              {item}
            </div>

          ))}

        </div>

      </div>

    </>

  );

}

export default Sidebar;