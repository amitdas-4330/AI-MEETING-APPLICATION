import "../styles/sidebar.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const meetings = [
    "Meeting with Team",
    "Client Discussion",
    "Project Planning"
  ];

  return (

    <div className="sidebar">

      {/* New Meeting Button */}

      <button
        className="new-meeting-btn"
        onClick={() => navigate("/recorder")}
      >

        + New Meeting

      </button>

      {/* History Title */}

      <h3 className="history-title">

        History

      </h3>

      {/* History List */}

      <div className="history-list">

        {meetings.map((item,index)=>(

          <div
            key={index}
            className="history-item"
          >

            {item}

          </div>

        ))}

      </div>

    </div>

  );

}

export default Sidebar;