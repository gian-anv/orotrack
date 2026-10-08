import { useForm } from "@refinedev/core";
import { Link } from "react-router";

export default function UserCreate() {
  const { onFinish, formLoading, mutation } = useForm({
    resource: "users",
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
      <h1>Add user</h1>
      <label>Name <input name="name" required /></label>
      <label>Email <input name="email" type="email" required /></label>
      <label>Starting password <input name="password" type="password" minLength={8} required /></label>
      <button type="submit" disabled={formLoading}>Create account</button>{" "}
      <Link to="/users">Cancel</Link>
      {mutation.error && <p>{mutation.error.message}</p>}
    </form>
  );
}
