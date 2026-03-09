import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function MoodTracker({ user, setPage }) {

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [moods, setMoods] = useState([]);

  const moodMap = {
    Happy: 5,
    Neutral: 3,
    Sad: 2,
    Anxious: 1
  };

  const saveMood = async () => {
    if (!mood) return alert("Select a mood");

    await addDoc(collection(db, "moods"), {
      userId: user.uid,
      date,
      mood,
      note
    });

    alert("Mood saved!");
    setMood("");
    setNote("");
    fetchMoods();
  };

  const fetchMoods = async () => {
    const q = query(
      collection(db, "moods"),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => doc.data());
    setMoods(data);
  };

  useEffect(() => {
    fetchMoods();
  }, []);

  const chartData = {
    labels: moods.map(m => m.date),
    datasets: [
      {
        label: "Mood Level",
        data: moods.map(m => moodMap[m.mood]),
        borderColor: "#667eea"
      }
    ]
  };

  return (
    <div className="dashboard">

      <div className="top-bar">
        <h1>Mood Tracker</h1>
        <button onClick={() => setPage("dashboard")}>Back</button>
      </div>

      <div className="card">

        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>Mood</label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        >
          <option value="">Select Mood</option>
          <option>Happy</option>
          <option>Neutral</option>
          <option>Sad</option>
          <option>Anxious</option>
        </select>

        <label>Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write how you're feeling..."
        />

        <button onClick={saveMood}>
          Save Mood
        </button>

      </div>

      {moods.length > 0 && (
        <div className="card" style={{ marginTop: "40px" }}>
          <h3>Mood Trend</h3>
          <Line data={chartData} />
        </div>
      )}

    </div>
  );
}

export default MoodTracker;