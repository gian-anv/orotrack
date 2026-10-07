import { Refine, Authenticated } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import authProvider from "./authProvider.js";
import dataProvider from "./dataProvider.js";
import Layout from "./Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ParticipantList from "./pages/ParticipantList.jsx";
import ParticipantCreate from "./pages/ParticipantCreate.jsx";
import ParticipantEdit from "./pages/ParticipantEdit.jsx";
import Upload from "./pages/Upload.jsx";
import AttemptList from "./pages/AttemptList.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Refine
        authProvider={authProvider}
        dataProvider={dataProvider}
        routerProvider={routerProvider}
        resources={[
          {
            name: "participants",
            list: "/participants",
            create: "/participants/create",
            edit: "/participants/edit/:id",
          },
          { name: "uploads", list: "/upload" },
          { name: "attempts", list: "/attempts" },
        ]}
        options={{ disableTelemetry: true }}
      >
        <Routes>
          <Route
            element={
              <Authenticated key="protected" fallback={<Navigate to="/login" />}>
                <Layout />
              </Authenticated>
            }
          >
            <Route index element={<Navigate to="/participants" />} />
            <Route path="/participants" element={<ParticipantList />} />
            <Route path="/participants/create" element={<ParticipantCreate />} />
            <Route path="/participants/edit/:id" element={<ParticipantEdit />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/attempts" element={<AttemptList />} />
          </Route>

          <Route
            element={
              <Authenticated key="public" fallback={<Outlet />}>
                <Navigate to="/" />
              </Authenticated>
            }
          >
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}
