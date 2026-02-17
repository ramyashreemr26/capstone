import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Typography,
} from "@mui/material";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/policies");
      setPolicies(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const submitPolicy = async (id) => {
    try {
      await api.put(`/policies/${id}/submit`);
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit policy");
    }
  };

  const approvePolicy = async (id) => {
    try {
      await api.put(`/policies/${id}/approve`);
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve policy");
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      DRAFT: "default",
      PENDING_APPROVAL: "warning",
      APPROVED: "success",
      ACTIVE: "success",
      EXPIRED: "error",
    };
    return statusColors[status] || "default";
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#333" }}
            >
              Policies
            </Typography>
            {user?.role === "UNDERWRITER" && (
              <Button
                variant="contained"
                onClick={() => navigate("/policies/create")}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                Create Policy
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
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
          ) : policies.length === 0 ? (
            <Paper sx={{ padding: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#666" }}>
                No policies found
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Policy Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Premium Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      From
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Until
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <Button variant="text" onClick={() => navigate(`/policies/${p._id}`)}>
                          {p.policyNumber}
                        </Button>
                      </TableCell>
                      <TableCell>{p.type || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.status}
                          color={getStatusColor(p.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${(p.premium || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {p.effectiveFrom
                          ? new Date(p.effectiveFrom).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {p.effectiveUntil
                          ? new Date(p.effectiveUntil).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {user?.role === "UNDERWRITER" && p.status === "DRAFT" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => submitPolicy(p._id)}
                            sx={{ mr: 1 }}
                          >
                            Submit
                          </Button>
                        )}

                        {user?.role === "ADMIN" &&
                          p.status === "PENDING_APPROVAL" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => approvePolicy(p._id)}
                            >
                              Approve
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
    </Box>
  );
};

export default PolicyList;