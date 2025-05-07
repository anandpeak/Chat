import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./partials/SignUp";
import Chat from "./page/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import NotFound from "./components/NotFound";
import Cookies from "js-cookie";

function App() {
  const isAuthenticated = !!Cookies.get("chatToken");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<SignUp />} />

        {/* Redirect based on authentication and pathname */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/chat" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirect from "/chat" to "/chat/{cId}/{jId}" */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Main chat route with cId and jId */}
        <Route
          path="/chat/:cId/:jId"
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
