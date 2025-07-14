import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../api";
import "../styles/pages-css/dashboard.css";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { users } = await getUsers();
        setUsers(users || []);
      } catch (err) {
        setError(err || "Failed to load users");
        if (err === "Session expired. Please log in again.") nav("/login");
      }
    })();
  }, [nav]);

  return (
    <div className="dashboard">
      <div className="dashboard__ring dashboard__ring--one" />
      <div className="dashboard__ring dashboard__ring--two" />

      <div className="dashboard__card">
        <h2 className="dashboard__title">Dashboard</h2>
        {error && <p className="dashboard__error">{error}</p>}

        <div className="dashboard__table">
          {/* column headers */}
          <div className="dashboard__row dashboard__row--head">
            <span>Name</span>
            <span>Email</span>
            <span>Profession</span>
            <span className="dash-age">Age</span>
          </div>

          {/* data rows */}
          {users.map((u, i) => (
            <div key={u._id} className={`dashboard__row ${i % 2 ? "alt" : ""}`}>
              <span>{u.name}</span>
              <span className="dashboard__email">{u.email}</span>
              <span>{u.profession}</span>
              <span className="dash-age">{u.age}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
