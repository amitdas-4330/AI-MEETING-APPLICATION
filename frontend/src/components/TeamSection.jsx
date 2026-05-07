import "../styles/team.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useState } from "react";

function TeamSection() {
  const [selectedDev, setSelectedDev] = useState(null);

  const team = [
    {
      name: "Amit Baran Das",
      role: "MERN Stack Developer",
      img: "/images/amit.jpg",
      git: "https://github.com/amitdas-4330",
      link: "https://www.linkedin.com/in/amitbarandas2a",
      about: "Full Stack Developer specialized in React, Node, MongoDB."
    },
    {
      name: "Subhadip Patra",
      role: "Software Developer",
      img: "/images/subha.jpeg",
      git: "https://github.com/",
      link: "https://linkedin.com/",
      about: "Strong in Java, DSA and backend systems."
    },
    {
      name: "Animesh Dolui",
      role: "Software Engineer",
      img: "/images/Animesh.jpeg",
      git: "https://github.com/",
      link: "https://linkedin.com/",
      about: "Backend + AI enthusiast working on intelligent systems."
    },
    {
      name: "Ashutosh Kumar Jha",
      role: "Software Engineer",
      img: "/images/asutosh.jpeg",
      git: "https://github.com/",
      link: "https://linkedin.com/",
      about: "Problem solver with strong DSA and C++."
    }
  ];

  return (
    <div className="footer-section" id="team">

      <h2>👨‍💻 Group-15 Team Members</h2>

      <p className="team-intro">
        We are Group-15 — a team of passionate developers building intelligent
        AI-powered solutions using modern web technologies.
      </p>

      <div className="dev-container">
        {team.map((dev, i) => (
          <div
            className="dev-card"
            key={i}
            onClick={() => setSelectedDev(dev)}
          >
            <img src={dev.img} alt={dev.name} />
            <h3>{dev.name}</h3>
            <p>{dev.role}</p>

            <div className="socials">
              <a
                href={dev.git}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <FaGithub />
              </a>

              <a
                href={dev.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedDev && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedDev(null)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selectedDev.img} alt="" />
            <h2>{selectedDev.name}</h2>
            <h4>{selectedDev.role}</h4>
            <p>{selectedDev.about}</p>

            <div className="modal-links">
              <a href={selectedDev.git} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={selectedDev.link} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>

            <button onClick={() => setSelectedDev(null)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default TeamSection;