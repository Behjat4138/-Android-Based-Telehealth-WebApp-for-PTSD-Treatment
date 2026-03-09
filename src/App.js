import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";

function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <div>
        {isRegistering ? (
          <>
            <Register setUser={setUser} />
            <p className="switch-text" onClick={() => setIsRegistering(false)}>
              Already have an account? Login
            </p>
          </>
        ) : (
          <>
            <Login setUser={setUser} />
            <p className="switch-text" onClick={() => setIsRegistering(true)}>
              Create Account
            </p>
          </>
        )}
      </div>
    );
  }

  if (page === "mood") {
    return <MoodTracker user={user} setPage={setPage} />;
  }

  return <Dashboard user={user} setUser={setUser} setPage={setPage} />;
}

export default App;