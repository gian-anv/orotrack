import { useLogout, usePermissions } from "@refinedev/core";
import { NavLink, Outlet } from "react-router";
import Logo from "./Logo.jsx";

export default function Layout() {
  const { mutate: logout } = useLogout();
  const { data: role } = usePermissions({});

  return (
    <div>
      <nav>
        <Logo />
        <div>
          {role === "admin" && <NavLink to="/users">Users</NavLink>}
          {role === "user" && (
            <>
              <NavLink to="/participants">Participants</NavLink>
              <NavLink to="/upload">Upload</NavLink>
              <NavLink to="/attempts">Attempts</NavLink>
            </>
          )}
        </div>
        <button onClick={() => logout()}>Sign out</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
