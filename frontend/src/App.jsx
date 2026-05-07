import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Recorder from "./pages/Recorder";
import Transcript from "./pages/Transcript";
import Members from "./pages/Members";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./styles/dashboard.css";

import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {

  return (

    <Router>

      <Routes>

        {/* Login Page */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* Register Page */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard Layout */}

        <Route
          path="/dashboard"
          element={
            <div className="dashboard-layout">

              <Navbar />

              <div className="dashboard-main">

                <Sidebar />

                <Dashboard />

              </div>

            </div>
          }
        />

        {/* Recorder Page */}

        <Route
          path="/recorder"
          element={
            <div className="dashboard-layout">

              <Navbar />

              <div className="dashboard-main">

                <Sidebar />

                <Recorder />

              </div>

            </div>
          }
        />

        {/* Transcript Page */}

        <Route
          path="/transcript"
          element={
            <div className="dashboard-layout">

              <Navbar />

              <div className="dashboard-main">

                <Sidebar />

                <Transcript />

              </div>

            </div>
          }
        />

        {/* Members Page */}

        <Route
          path="/members"
          element={
            <div className="dashboard-layout">

              <Navbar />

              <div className="dashboard-main">

                <Sidebar />

                <Members />

              </div>

            </div>
          }
        />

      </Routes>

    </Router>

  );

}

export default App;