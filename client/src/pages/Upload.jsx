import { useState } from "react";
import { useList } from "@refinedev/core";

export default function Upload() {
  const [message, setMessage] = useState("");
  const participants = useList({ resource: "participants", pagination: { mode: "off" } });
  const uploads = useList({ resource: "uploads", pagination: { mode: "off" } });

  const participantRows = participants.result.data ?? [];
  const uploadRows = uploads.result.data ?? [];

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    setMessage("Uploading...");

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: new FormData(form),
    });
    const body = await response.json();

    if (response.ok) {
      setMessage(`Saved ${body.row_count} attempts.`);
      form.reset();
      uploads.query.refetch();
    } else {
      setMessage(body.message);
    }
  }

  return (
    <div>
      <h1>Upload session log</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Participant{" "}
          <select name="participant_id" required>
            <option value="">Select participant...</option>
            {participantRows.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.code}
              </option>
            ))}
          </select>
        </label>{" "}
        <label>
          CSV file <input type="file" name="file" accept=".csv" required />
        </label>{" "}
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}

      <h2>Uploaded files</h2>
      <table>
        <thead>
          <tr>
            <th>File name</th>
            <th>Participant</th>
            <th>Rows</th>
            <th>Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {uploadRows.map((upload) => (
            <tr key={upload.id}>
              <td>{upload.original_name}</td>
              <td>{upload.participant_code}</td>
              <td>{upload.row_count}</td>
              <td>{new Date(upload.uploaded_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
