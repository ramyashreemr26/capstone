import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Button,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  TextField,
  Grid,
} from "@mui/material";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, userName: "" });
  const [statusDialog, setStatusDialog] = useState({ open: false, userId: null, userName: "", currentStatus: null });
  const [roleDialog, setRoleDialog] = useState({ open: false, userId: null, userName: "", oldRole: "", newRole: "" });
  const [roleSelectValue, setRoleSelectValue] = useState({});
  const [createDialog, setCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "UNDERWRITER" });
  const [createErrors, setCreateErrors] = useState({});
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      setRoleSelectValue({ ...roleSelectValue, [id]: undefined });
      fetchUsers();
      setSuccess("User role updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/status`);
      await fetchUsers();
      setSuccess(`User ${currentStatus ? "deactivated" : "activated"} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteUser = async () => {
    try {
      await api.delete(`/admin/users/${deleteDialog.userId}`);
      fetchUsers();
      setSuccess("User deleted successfully!");
      setDeleteDialog({ open: false, userId: null, userName: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const validateCreateForm = () => {
    const newErrors = {};
    if (!newUser.name.trim()) newErrors.name = "Name is required";
    if (!newUser.email.trim()) newErrors.email = "Email is required";
    if (!newUser.password || newUser.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const createNewUser = async () => {
    const newErrors = validateCreateForm();
    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors);
      return;
    }

    try {
      await api.post("/admin/users", {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });
      setSuccess("User created successfully!");
      setCreateDialog(false);
      setNewUser({ name: "", email: "", password: "", role: "UNDERWRITER" });
      setCreateErrors({});
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      ADMIN: "error",
      UNDERWRITER: "primary",
      CLAIMS_ADJUSTER: "info",
      REINSURANCE_MANAGER: "warning",
    };
    return roleColors[role] || "default";
  };

  const getStatusColor = (active) => {
    return active ? "success" : "error";
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
      <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#333" }}
              >
                User Management
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                Manage user accounts and roles
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setCreateDialog(true)}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              + Create User
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Paper sx={{ padding: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#666" }}>
                No users found
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Current Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Change Role</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          color={getRoleColor(u.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.active ? "Active" : "Inactive"}
                          color={getStatusColor(u.active)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={roleSelectValue[u._id] || u.role}
                          size="small"
                          onChange={(e) => {
                            setRoleSelectValue({ ...roleSelectValue, [u._id]: e.target.value });
                            setRoleDialog({
                              open: true,
                              userId: u._id,
                              userName: u.name,
                              oldRole: u.role,
                              newRole: e.target.value,
                            });
                          }}
                        >
                          <MenuItem value="ADMIN">ADMIN</MenuItem>
                          <MenuItem value="UNDERWRITER">UNDERWRITER</MenuItem>
                          <MenuItem value="CLAIMS_ADJUSTER">
                            CLAIMS_ADJUSTER
                          </MenuItem>
                          <MenuItem value="REINSURANCE_MANAGER">
                            REINSURANCE_MANAGER
                          </MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color={u.active ? "warning" : "success"}
                          onClick={() =>
                            setStatusDialog({
                              open: true,
                              userId: u._id,
                              userName: u.name,
                              currentStatus: u.active,
                            })
                          }
                          sx={{ mr: 1 }}
                        >
                          {u.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              userId: u._id,
                              userName: u.name,
                            })
                          }
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null, userName: "" })}>
          <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteDialog.userName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null, userName: "" })}>
            Cancel
          </Button>
          <Button onClick={deleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, userId: null, userName: "", currentStatus: null })}>
        <DialogTitle>{statusDialog.currentStatus ? "Deactivate User" : "Activate User"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to <strong>{statusDialog.currentStatus ? "deactivate" : "activate"}</strong> <strong>{statusDialog.userName}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, userId: null, userName: "", currentStatus: null })}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              toggleUserStatus(statusDialog.userId, statusDialog.currentStatus);
              setStatusDialog({ open: false, userId: null, userName: "", currentStatus: null });
            }} 
            color={statusDialog.currentStatus ? "warning" : "success"}
            variant="contained"
          >
            {statusDialog.currentStatus ? "Deactivate" : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={roleDialog.open} onClose={() => {
        setRoleSelectValue({ ...roleSelectValue, [roleDialog.userId]: roleDialog.oldRole });
        setRoleDialog({ open: false, userId: null, userName: "", oldRole: "", newRole: "" });
      }}>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change <strong>{roleDialog.userName}</strong>'s role from <strong>{roleDialog.oldRole}</strong> to <strong>{roleDialog.newRole}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setRoleSelectValue({ ...roleSelectValue, [roleDialog.userId]: roleDialog.oldRole });
            setRoleDialog({ open: false, userId: null, userName: "", oldRole: "", newRole: "" });
          }}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              updateRole(roleDialog.userId, roleDialog.newRole);
              setRoleDialog({ open: false, userId: null, userName: "", oldRole: "", newRole: "" });
            }} 
            variant="contained"
          >
            Change Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={newUser.name}
                onChange={(e) => {
                  setNewUser({ ...newUser, name: e.target.value });
                  if (createErrors.name) setCreateErrors({ ...createErrors, name: "" });
                }}
                error={!!createErrors.name}
                helperText={createErrors.name}
                placeholder="Enter user's full name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newUser.email}
                onChange={(e) => {
                  setNewUser({ ...newUser, email: e.target.value });
                  if (createErrors.email) setCreateErrors({ ...createErrors, email: "" });
                }}
                error={!!createErrors.email}
                helperText={createErrors.email}
                placeholder="Enter email address"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => {
                  setNewUser({ ...newUser, password: e.target.value });
                  if (createErrors.password) setCreateErrors({ ...createErrors, password: "" });
                }}
                error={!!createErrors.password}
                helperText={createErrors.password || "Minimum 6 characters"}
                placeholder="Enter password"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Assign Role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <MenuItem value="UNDERWRITER">Underwriter</MenuItem>
                <MenuItem value="CLAIMS_ADJUSTER">Claims Adjuster</MenuItem>
                <MenuItem value="REINSURANCE_MANAGER">Reinsurance Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialog(false);
            setNewUser({ name: "", email: "", password: "", role: "UNDERWRITER" });
            setCreateErrors({});
          }}>
            Cancel
          </Button>
          <Button
            onClick={createNewUser}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      </Container>
    </Box>
  );
};

export default UserList;