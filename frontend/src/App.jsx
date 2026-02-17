import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PolicyList from "./pages/Policy/PolicyList";
import ClaimsList from "./pages/Claims/ClaimsList";
import ClaimDetails from "./pages/Claims/ClaimDetails";
import TreatyList from "./pages/Reinsurance/TreatyList";
import AllocationsList from "./pages/Reinsurance/AllocationsList";
import UserList from "./pages/Admin/UserList";
import CreatePolicy from "./pages/Policy/CreatePolicy";
import PolicyDetails from "./pages/Policy/PolicyDetails";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Sidebar>
                            <Dashboard />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/policies"
                element={
                    <ProtectedRoute roles={["UNDERWRITER", "ADMIN"]}>
                        <Sidebar>
                            <PolicyList />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/policies/create"
                element={
                    <ProtectedRoute roles={["UNDERWRITER"]}>
                        <Sidebar>
                            <CreatePolicy />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/policies/:id"
                element={
                    <ProtectedRoute>
                        <Sidebar>
                            <PolicyDetails />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/claims"
                element={
                    <ProtectedRoute roles={["CLAIMS_ADJUSTER"]}>
                        <Sidebar>
                            <ClaimsList />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/claims/:id"
                element={
                    <ProtectedRoute roles={["CLAIMS_ADJUSTER"]}>
                        <Sidebar>
                            <ClaimDetails />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/treaties"
                element={
                    <ProtectedRoute roles={["REINSURANCE_MANAGER"]}>
                        <Sidebar>
                            <TreatyList />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/allocations"
                element={
                    <ProtectedRoute roles={["REINSURANCE_MANAGER"]}>
                        <Sidebar>
                            <AllocationsList />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/users"
                element={
                    <ProtectedRoute roles={["ADMIN"]}>
                        <Sidebar>
                            <UserList />
                        </Sidebar>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;