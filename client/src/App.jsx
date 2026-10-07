import { Refine, Authenticated } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import authProvider from "./authProvider.js";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Refine
        authProvider={authProvider}
        routerProvider={routerProvider}
        options={{ disableTelemetry: true }}
      >
        <Routes>
          <Route
            element={
              <Authenticated key="protected" fallback={<Navigate to="/login" />}>
                <Outlet />
              </Authenticated>
            }
          >
            <Route index element={<Home />} />
          </Route>

          <Route
            element={
              <Authenticated key="public" fallback={<Outlet />}>
                <Navigate to="/" />
              </Authenticated>
            }
          >
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}
