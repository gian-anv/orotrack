import { Refine, Authenticated } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router";
import authProvider from "./providers/authProvider.js";
import dataProvider from "./providers/dataProvider.js";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ParticipantList from "./pages/participants/ParticipantList.jsx";
import ParticipantCreate from "./pages/participants/ParticipantCreate.jsx";
import ParticipantEdit from "./pages/participants/ParticipantEdit.jsx";
import Upload from "./pages/uploads/Upload.jsx";
import AttemptList from "./pages/attempts/AttemptList.jsx";
import UserList from "./pages/users/UserList.jsx";
import UserCreate from "./pages/users/UserCreate.jsx";
import Trends from "./pages/trends/Trends.jsx";
import Help from "./pages/Help.jsx";

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
          { name: "users", list: "/users", create: "/users/create" },
        ]}
        options={{ disableTelemetry: true }}
      >
        <Routes>
          <Route path="/help" element={<Help />} />

          <Route
            element={
              <Authenticated key="protected" fallback={<Navigate to="/login" />}>
                <Layout />
              </Authenticated>
            }
          >
            <Route index element={<Home />} />
            <Route path="/participants" element={<ParticipantList />} />
            <Route path="/participants/create" element={<ParticipantCreate />} />
            <Route path="/participants/edit/:id" element={<ParticipantEdit />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/attempts" element={<AttemptList />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<UserCreate />} />
            <Route path="/trends" element={<Trends />} />
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
