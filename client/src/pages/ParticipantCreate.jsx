import { useForm } from "@refinedev/core";
import { Link } from "react-router";

export default function ParticipantCreate() {
  const { onFinish, formLoading, mutation } = useForm({
    resource: "participants",
    action: "create",
    redirect: "list",
  });

  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    onFinish(values);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Add participant</h1>
      <label>Code <input name="code" placeholder="PT-0142" required /></label>
      <label>Age group <input name="age_group" placeholder="7-9" required /></label>
      <label>Target sounds <input name="target_sounds" placeholder="/r/, /s/" required /></label>
      <button type="submit" disabled={formLoading}>Save</button>{" "}
      <Link to="/participants">Cancel</Link>
      {mutation.error && <p>{mutation.error.message}</p>}
    </form>
  );
}
