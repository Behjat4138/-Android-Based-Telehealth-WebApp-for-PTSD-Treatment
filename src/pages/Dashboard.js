import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Dashboard({ user, setUser, setPage }) {

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="dashboard">
      
      <div className="top-bar">
        <h1>Hello, {user.displayName || "User"} 👋</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="card-container">

        <div className="card">
          <h3>🧠 AI Therapist</h3>
          <p>Conversational support coming soon.</p>
        </div>

        <div className="card">
          <h3>📋 PTSD Screening</h3>
          <p>Assess your symptoms securely.</p>
        </div>

        <div className="card">
          <h3>📚 Resources</h3>
          <p>Guided coping strategies.</p>
        </div>

        <div 
          className="card"
          style={{ cursor: "pointer" }}
          onClick={() => setPage("mood")}
        >
          <h3>📊 Mood Tracker</h3>
          <p>Track how you're feeling daily.</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;