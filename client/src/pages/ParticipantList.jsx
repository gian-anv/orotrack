import { useList, useDelete } from "@refinedev/core";
import { Link } from "react-router";

export default function ParticipantList() {
  const { result, query } = useList({
    resource: "participants",
    pagination: { mode: "off" },
  });
  const { mutate: deleteParticipant } = useDelete();

  function handleDelete(id) {
    if (window.confirm("Delete this participant?")) {
      deleteParticipant({ resource: "participants", id });
    }
  }

  if (query.isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Participants</h1>
      <Link to="/participants/create" className="button">Add participant</Link>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Age group</th>
            <th>Target sounds</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {result.data.map((participant) => (
            <tr key={participant.id}>
              <td>{participant.code}</td>
              <td>{participant.age_group}</td>
              <td>{participant.target_sounds || "-"}</td>
              <td>
                <Link to={`/participants/edit/${participant.id}`}>Edit</Link>{" "}
                <button className="danger" onClick={() => handleDelete(participant.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
