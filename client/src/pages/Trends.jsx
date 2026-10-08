import { useEffect, useState } from "react";
import { useList } from "@refinedev/core";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#2a78d6", "#eb6834", "#4a3aa7", "#008300", "#c2477a", "#a86b00"];
const OTHER_COLOR = "#8a8a85";

function percent(value) {
  return value === null ? "-" : `${Math.round(value)}%`;
}

export default function Trends() {
  const [participantId, setParticipantId] = useState("");
  const [exercise, setExercise] = useState("");
  const [trend, setTrend] = useState(null);

  const participants = useList({ resource: "participants", pagination: { mode: "off" } });
  const participantRows = participants.result.data ?? [];

  useEffect(() => {
    if (participantId === "") {
      setTrend(null);
      return;
    }
    const query = exercise === "" ? "" : `?exercise=${encodeURIComponent(exercise)}`;
    fetch(`/api/trends/${participantId}${query}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((response) => response.json())
      .then((body) => setTrend(body.points ? body : null));
  }, [participantId, exercise]);

  const byDate = {};
  for (const point of trend?.points ?? []) {
    if (!byDate[point.session_date]) byDate[point.session_date] = { date: point.session_date };
    byDate[point.session_date][point.exercise] = Math.round(point.average_score);
  }
  const chartData = Object.values(byDate);
  const lines = exercise === "" ? trend?.exercises ?? [] : [exercise];

  function colorFor(name) {
    return COLORS[trend.exercises.indexOf(name)] ?? OTHER_COLOR;
  }

  return (
    <div>
      <h1>Practice trends</h1>

      <div className="filters">
        <label>
          Participant
          <select
            value={participantId}
            onChange={(event) => {
              setParticipantId(event.target.value);
              setExercise("");
            }}
          >
            <option value="">Select participant...</option>
            {participantRows.map((participant) => (
              <option key={participant.id} value={participant.id}>{participant.code}</option>
            ))}
          </select>
        </label>
        <label>
          Exercise
          <select value={exercise} onChange={(event) => setExercise(event.target.value)} disabled={!trend}>
            <option value="">All exercises</option>
            {(trend?.exercises ?? []).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      {trend && (
        <>
          <div className="stats">
            <div className="stat">
              <div className="label">Sessions logged</div>
              <div className="value">{trend.summary.sessions}</div>
            </div>
            <div className="stat">
              <div className="label">Average score</div>
              <div className="value">{percent(trend.summary.average_score)}</div>
            </div>
            <div className="stat">
              <div className="label">Invalid input rate</div>
              <div className="value">{percent(trend.summary.invalid_rate)}</div>
            </div>
          </div>

          <div className="card">
            <h2>Average score per session</h2>
            {chartData.length === 0 ? (
              <p>No valid attempts yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} stroke="#e3e1da" />
                  <XAxis dataKey="date" stroke="#6b6b66" />
                  <YAxis domain={[0, 100]} unit="%" stroke="#6b6b66" />
                  <Tooltip formatter={(value) => `${value}%`} itemStyle={{ color: "#1c1c1a" }} />
                  <Legend formatter={(name) => <span style={{ color: "#1c1c1a" }}>{name}</span>} />
                  {lines.map((name) => (
                    <Line
                      key={name}
                      dataKey={name}
                      stroke={colorFor(name)}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
            <p className="footnote">
              Each point is one day's average for that exercise. Attempts flagged as invalid input are left out.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
