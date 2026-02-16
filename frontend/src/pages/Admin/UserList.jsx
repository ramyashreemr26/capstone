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
} from "@mui/material";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, userName: "" });
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
      fetchUsers();
      setSuccess("User role updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
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

  const getRoleColor = (role) => {
    const roleColors = {
      ADMIN: "error",
      UNDERWRITER: "primary",
      CLAIMS_ADJUSTER: "info",
      REINSURANCE_MANAGER: "warning",
    };
    return roleColors[role] || "default";
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
      <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 3 }}>
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
                        <Select
                          defaultValue={u.role}
                          size="small"
                          onChange={(e) =>
                            updateRole(u._id, e.target.value)
                          }
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
      </Container>
    </Box>
  );
};

export default UserList;