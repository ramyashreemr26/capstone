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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get("/claims");
      setClaims(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/claims/${id}/${action}`);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} claim`);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      SUBMITTED: "info",
      UNDER_REVIEW: "warning",
      APPROVED: "success",
      REJECTED: "error",
      SETTLED: "success",
    };
    return statusColors[status] || "default";
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
              Claims
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
              Manage and review insurance claims
            </Typography>
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
          ) : claims.length === 0 ? (
            <Paper sx={{ padding: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#666" }}>
                No claims found
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
                      Claim Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Policy Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Claim Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Submitted Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell>{c.claimNumber}</TableCell>
                      <TableCell>{c.policyId || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={c.status}
                          color={getStatusColor(c.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${(c.claimAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {c.submittedDate
                          ? new Date(c.submittedDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {c.status === "SUBMITTED" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => updateStatus(c._id, "review")}
                          >
                            Review
                          </Button>
                        )}

                        {c.status === "UNDER_REVIEW" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => updateStatus(c._id, "approve")}
                              sx={{ mr: 1 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => updateStatus(c._id, "reject")}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {c.status === "APPROVED" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            onClick={() => updateStatus(c._id, "settle")}
                          >
                            Settle
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

export default ClaimsList;