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
  MenuItem,
} from "@mui/material";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClaim, setNewClaim] = useState({ claimNumber: "", policyId: "", claimAmount: "" });
  const [claimErrors, setClaimErrors] = useState({});
  const [policies, setPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [success, setSuccess] = useState("");
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

  const fetchPolicies = async () => {
    try {
      setPoliciesLoading(true);
      const res = await api.get("/policies");
      // keep only ACTIVE policies for claims
      setPolicies(res.data.filter((p) => p.status === "ACTIVE"));
    } catch (err) {
      // don't block claims listing on policies failure
    } finally {
      setPoliciesLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
  }, []);

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/claims/${id}/${action}`);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} claim`);
    }
  };

  const validateNewClaim = () => {
    const errs = {};
    if (!newClaim.claimNumber.trim()) errs.claimNumber = "Claim number is required";
    if (!newClaim.policyId) errs.policyId = "Policy is required";
    if (!newClaim.claimAmount || Number(newClaim.claimAmount) <= 0) errs.claimAmount = "Valid claim amount is required";
    return errs;
  };

  const createClaim = async () => {
    const errs = validateNewClaim();
    if (Object.keys(errs).length > 0) {
      setClaimErrors(errs);
      return;
    }

    try {
      setPoliciesLoading(true);
      await api.post("/claims", {
        claimNumber: newClaim.claimNumber,
        policyId: newClaim.policyId,
        claimAmount: Number(newClaim.claimAmount),
      });
      setSuccess("Claim created successfully");
      setCreateDialogOpen(false);
      setNewClaim({ claimNumber: "", policyId: "", claimAmount: "" });
      setClaimErrors({});
      fetchClaims();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create claim");
    } finally {
      setPoliciesLoading(false);
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
          <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
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
            {user?.role === "CLAIMS_ADJUSTER" && (
              <Button variant="contained" onClick={() => setCreateDialogOpen(true)} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                + Create Claim
              </Button>
            )}
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {/* Create Claim Dialog */}
          <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Claim</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
                <TextField
                  label="Claim Number"
                  value={newClaim.claimNumber}
                  onChange={(e) => setNewClaim({ ...newClaim, claimNumber: e.target.value })}
                  error={!!claimErrors.claimNumber}
                  helperText={claimErrors.claimNumber}
                />

                <TextField
                  select
                  label="Policy"
                  value={newClaim.policyId}
                  onChange={(e) => setNewClaim({ ...newClaim, policyId: e.target.value })}
                  error={!!claimErrors.policyId}
                  helperText={claimErrors.policyId}
                >
                  {policies.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.policyNumber} - {p.insuredName}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Claim Amount"
                  type="number"
                  value={newClaim.claimAmount}
                  onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                  error={!!claimErrors.claimAmount}
                  helperText={claimErrors.claimAmount}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={createClaim} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                Create
              </Button>
            </DialogActions>
          </Dialog>

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
                      <TableCell>
                        <Button variant="text" onClick={() => navigate(`/claims/${c._id}`)}>
                          {c.claimNumber}
                        </Button>
                      </TableCell>
                      <TableCell>{c.policyId?.policyNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={c.status}
                          color={getStatusColor(c.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${(c.claimAmount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString()
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