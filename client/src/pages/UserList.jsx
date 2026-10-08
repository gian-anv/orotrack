import { useList, useDelete } from "@refinedev/core";
import { Link } from "react-router";

export default function UserList() {
  const { result, query } = useList({ resource: "users", pagination: { mode: "off" } });
  const { mutate: deleteUser } = useDelete();

  async function resetPassword(user) {
    const password = window.prompt(`New password for ${user.email} (at least 8 characters):`);
    if (!password) return;
    const response = await fetch(`/api/users/${user.id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ password }),
    });
    const body = await response.json();
    window.alert(response.ok ? "Password updated." : body.message);
  }

  function handleDelete(user) {
    if (window.confirm(`Delete ${user.email} and all of their participants, uploads, and attempts?`)) {
      deleteUser({ resource: "users", id: user.id });
    }
  }

  if (query.isLoading) return <p>Loading...</p>;
  if (query.isError) return <p>This page is for the admin only.</p>;

  const users = result.data ?? [];

  return (
    <div>
      <h1>Users</h1>
      <Link to="/users/create" className="button">Add user</Link>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Participants</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name || "-"}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.participant_count}</td>
              <td>
                {user.role === "admin" ? "-" : (
                  <>
                    <button className="plain" onClick={() => resetPassword(user)}>Reset password</button>{" "}
                    <button className="danger" onClick={() => handleDelete(user)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
