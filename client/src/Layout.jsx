import { useLogout } from "@refinedev/core";
import { NavLink, Outlet } from "react-router";
import Logo from "./Logo.jsx";

export default function Layout() {
  const { mutate: logout } = useLogout();

  return (
    <div>
      <nav>
        <Logo />
        <div>
          <NavLink to="/participants">Participants</NavLink>
          <NavLink to="/upload">Upload</NavLink>
          <NavLink to="/attempts">Attempts</NavLink>
        </div>
        <button onClick={() => logout()}>Sign out</button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
