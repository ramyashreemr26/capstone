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
  Paper,
  CircularProgress,
  Alert,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Grid,
} from "@mui/material";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AllocationsList = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [policyFilter, setPolicyFilter] = useState(null); // Changed to object
  const [policies, setPolicies] = useState([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPolicies = async () => {
    try {
      setPoliciesLoading(true);
      const res = await api.get("/policies");
      setPolicies(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load policies");
    } finally {
      setPoliciesLoading(false);
    }
  };

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      let url = "/allocations";
      if (policyFilter && policyFilter._id) {
        url = `/allocations/policy/${policyFilter._id}`;
      }
      const res = await api.get(url);
      setAllocations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load allocations");
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchAllocations();
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [policyFilter]);

  const calculateTotalCeded = () => {
    if (!Array.isArray(allocations)) return 0;
    return allocations.reduce((sum, a) => sum + (a.cededAmount || 0), 0);
  };

  const calculateTotalRetained = () => {
    if (!Array.isArray(allocations)) return 0;
    return allocations.reduce((sum, a) => sum + (a.retainedAmount || 0), 0);
  };

  const getChartData = () => {
    const ceded = calculateTotalCeded();
    const retained = calculateTotalRetained();
    return [
      { name: "Ceded", value: ceded },
      { name: "Retained", value: retained },
    ];
  };

  // Validation: Check for unallocated exposure per policy
  const validateAllocations = () => {
    if (!Array.isArray(allocations) || !allocations.length || !policyFilter) return null;

    const groupedByPolicy = {};
    allocations.forEach((alloc) => {
      const policyId = alloc.policyId?._id;
      if (!groupedByPolicy[policyId]) {
        groupedByPolicy[policyId] = {
          totalCeded: 0,
          totalRetained: 0,
          policyNumber: alloc.policyId?.policyNumber,
          coverageAmount: alloc.policyId?.coverageAmount,
        };
      }
      groupedByPolicy[policyId].totalCeded += alloc.cededAmount || 0;
      groupedByPolicy[policyId].totalRetained += alloc.retainedAmount || 0;
    });

    const warnings = [];
    Object.entries(groupedByPolicy).forEach(([policyId, data]) => {
      const totalAllocated = data.totalCeded + data.totalRetained;
      if (totalAllocated < (data.coverageAmount || 0)) {
        const unallocated = (data.coverageAmount || 0) - totalAllocated;
        warnings.push({
          policyNumber: data.policyNumber,
          unallocatedAmount: unallocated,
        });
      }
    });

    return warnings.length > 0 ? warnings : null;
  };

  const validationWarnings = validateAllocations();

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
              Reinsurance Allocations
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
              View risk allocations to treaties
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/treaties")}
          >
            Manage Treaties
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Validation Alerts */}
        {validationWarnings && validationWarnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Unallocated Exposure Detected:
            </Typography>
            {validationWarnings.map((warning, idx) => (
              <Typography key={idx} variant="body2" sx={{ mt: 0.5 }}>
                Policy {warning.policyNumber}: ${warning.unallocatedAmount.toLocaleString()} unallocated
              </Typography>
            ))}
          </Alert>
        )}

        {/* Filter Section */}
        <Paper sx={{ padding: 2, mb: 3 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            <Autocomplete
              options={policies}
              getOptionLabel={(option) => `${option.policyNumber} - ${option.insuredName || "N/A"}`}
              value={policyFilter}
              onChange={(e, newValue) => setPolicyFilter(newValue)}
              loading={policiesLoading}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Policy"
                  placeholder="Search policy number or insured name"
                  size="small"
                />
              )}
            />
            <Button
              variant="outlined"
              onClick={() => setPolicyFilter(null)}
              sx={{ mb: 0.5 }}
            >
              Reset
            </Button>
          </Box>
        </Paper>

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
        ) : !Array.isArray(allocations) || allocations.length === 0 ? (
          <Paper sx={{ padding: 4, textAlign: "center" }}>
            <Typography variant="h6" sx={{ color: "#666" }}>
              {policyFilter ? "No allocations found for this policy" : "No allocations found"}
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Summary Cards and Chart */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#666" }}>
                    Total Allocations
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
                    {allocations.length}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#666" }}>
                    Total Ceded Amount
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#764ba2" }}>
                    ${calculateTotalCeded().toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="caption" sx={{ color: "#666" }}>
                    Total Retained Amount
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
                    ${calculateTotalRetained().toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "120px" }}>
                  <Box sx={{ width: "100%", height: "100%" }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <PieChart>
                        <Pie
                          data={getChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#764ba2" />
                          <Cell fill="#667eea" />
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Allocations Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Policy Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Treaty Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reinsurer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Share %</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Ceded Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>Retained Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allocations.map((alloc) => (
                    <TableRow key={alloc._id}>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {alloc.policyId?.policyNumber || "N/A"}
                      </TableCell>
                      <TableCell>{alloc.treatyId?.treatyName || "N/A"}</TableCell>
                      <TableCell>{alloc.treatyId?.reinsurerName || "N/A"}</TableCell>
                      <TableCell>{alloc.percentage}%</TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                        ${(alloc.cededAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ textAlign: "right" }}>
                        ${(alloc.retainedAmount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AllocationsList;
