import { usePermissions } from "@refinedev/core";
import { Navigate } from "react-router";

export default function Home() {
  const { data: role, isLoading } = usePermissions({});
  if (isLoading) return <p>Loading...</p>;
  return <Navigate to={role === "admin" ? "/users" : "/participants"} />;
}
