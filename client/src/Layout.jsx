import { useLogout } from "@refinedev/core";
import { Link, Outlet } from "react-router";

export default function Layout() {
  const { mutate: logout } = useLogout();

  return (
    <div>
      <nav>
        <strong>Session Review</strong>{" "}
        <Link to="/participants">Participants</Link>{" "}
        <Link to="/upload">Upload</Link>{" "}
        <Link to="/attempts">Attempts</Link>{" "}
        <button onClick={() => logout()}>Sign out</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
