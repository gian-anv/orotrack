import { useForm } from "@refinedev/core";
import { Link, useParams } from "react-router";

export default function ParticipantEdit() {
  const { id } = useParams();
  const { onFinish, formLoading, query, mutation } = useForm({
    resource: "participants",
    action: "edit",
    id,
    redirect: "list",
  });

  const participant = query?.data?.data;
  if (!participant) return <p>Loading...</p>;

  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    onFinish(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit participant</h1>
      <label>Code <input name="code" defaultValue={participant.code} required /></label>
      <label>Age group <input name="age_group" defaultValue={participant.age_group} required /></label>
      <label>Target sounds (optional) <input name="target_sounds" defaultValue={participant.target_sounds} /></label>
      <button type="submit" disabled={formLoading}>Save</button>{" "}
      <Link to="/participants">Cancel</Link>
      {mutation.error && <p>{mutation.error.message}</p>}
    </form>
  );
}
