import { useState } from "react";
import { useList } from "@refinedev/core";

function uniqueValues(rows, field) {
  return [...new Set(rows.map((row) => row[field]))].sort();
}

export default function AttemptList() {
  const { result, query } = useList({ resource: "attempts", pagination: { mode: "off" } });
  const [participant, setParticipant] = useState("");
  const [exercise, setExercise] = useState("");
  const [validity, setValidity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  if (query.isLoading) return <p>Loading...</p>;

  const attempts = result.data ?? [];
  const visible = attempts.filter((attempt) => {
    const day = attempt.timestamp.slice(0, 10);
    return (
      (participant === "" || attempt.participant_code === participant) &&
      (exercise === "" || attempt.exercise === exercise) &&
      (validity === "" || attempt.input_validity === validity) &&
      (fromDate === "" || day >= fromDate) &&
      (toDate === "" || day <= toDate)
    );
  });

  function resetFilters() {
    setParticipant("");
    setExercise("");
    setValidity("");
    setFromDate("");
    setToDate("");
  }

  return (
    <div>
      <h1>Attempts</h1>

      <div className="filters">
        <label>
          Participant
          <select value={participant} onChange={(event) => setParticipant(event.target.value)}>
            <option value="">All participants</option>
            {uniqueValues(attempts, "participant_code").map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Exercise
          <select value={exercise} onChange={(event) => setExercise(event.target.value)}>
            <option value="">All exercises</option>
            {uniqueValues(attempts, "exercise").map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Input validity
          <select value={validity} onChange={(event) => setValidity(event.target.value)}>
            <option value="">All</option>
            {uniqueValues(attempts, "input_validity").map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          From
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </label>
        <button onClick={resetFilters}>Reset</button>
      </div>

      <p>Showing {visible.length} of {attempts.length} attempts</p>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Participant</th>
            <th>Exercise</th>
            <th>Result</th>
            <th>Confidence</th>
            <th>Input validity</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((attempt) => (
            <tr key={attempt.id} className={attempt.input_validity === "valid" ? "" : "invalid"}>
              <td>{attempt.timestamp}</td>
              <td>{attempt.participant_code}</td>
              <td>{attempt.exercise}</td>
              <td>{attempt.result ?? "-"}</td>
              <td>{attempt.confidence_score.toFixed(2)}</td>
              <td>{attempt.input_validity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
