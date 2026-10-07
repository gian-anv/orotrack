import { useLogout } from "@refinedev/core";

export default function Home() {
  const { mutate: logout } = useLogout();

  return (
    <div>
      <h1>Session Review</h1>
      <p>You are signed in.</p>
      <button onClick={() => logout()}>Sign out</button>
    </div>
  );
}
