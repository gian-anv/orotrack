import { useList } from "@refinedev/core";

export default function AttemptList() {
  const { result, query } = useList({ resource: "attempts", pagination: { mode: "off" } });

  if (query.isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Attempts</h1>
      <p>{result.data.length} attempts</p>
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
          {result.data.map((attempt) => (
            <tr key={attempt.id}>
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
