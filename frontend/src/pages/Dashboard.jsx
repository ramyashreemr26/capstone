import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [policyData, setPolicyData] = useState(null);
  const [claimData, setClaimData] = useState(null);
  const [reData, setReData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { user } = useAuth();

  const fetchData = async (start = "", end = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      const [policiesRes, claimsRes, reRes] = await Promise.all([
        api.get(`/dashboard/policies?${params.toString()}`),
        api.get(`/dashboard/claims?${params.toString()}`),
        api.get(`/dashboard/reinsurance?${params.toString()}`),
      ]);
      setPolicyData(policiesRes.data);
      setClaimData(claimsRes.data);
      setReData(reRes.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    fetchData("", "");
  };

  const handleApplyFilters = () => {
    fetchData(startDate, endDate);
  };

  const StatCard = ({ title, value, subtitle, color }) => (
    <Paper
      sx={{
        padding: 3,
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
        {title}
      </Typography>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: color, mb: 1 }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: "#999" }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${isNaN(value) ? 0 : value.toFixed(2)}%`;
  };

  const policyStatusData = policyData
    ? [
        { name: "Draft", value: policyData.draft, color: "#94a3b8" },
        {
          name: "Pending Approval",
          value: policyData.pending,
          color: "#f97316",
        },
        { name: "Active", value: policyData.active, color: "#10b981" },
        { name: "Rejected", value: policyData.rejected, color: "#ef4444" },
      ].filter((item) => item.value > 0)
    : [];

  const claimStatusData = claimData
    ? [
        { name: "Submitted", value: claimData.submitted, color: "#94a3b8" },
        {
          name: "Under Review",
          value: claimData.underReview,
          color: "#3b82f6",
        },
        { name: "Approved", value: claimData.approved, color: "#10b981" },
        { name: "Rejected", value: claimData.rejected, color: "#ef4444" },
        { name: "Settled", value: claimData.settled, color: "#06b6d4" },
      ].filter((item) => item.value > 0)
    : [];

  const reinsuranceData = reData
    ? [
        { name: "Ceded", value: reData.totalCeded, color: "#a855f7" },
        { name: "Retained", value: reData.totalRetained, color: "#3b82f6" },
      ].filter((item) => item.value > 0)
    : [];

  const metricsData = [
    {
      name: "Exposure",
      "Loss Ratio": claimData?.lossRatio || 0,
      "Claims Ratio": claimData?.claimsRatio || 0,
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#333", mb: 1 }}
          >
            Dashboard & Reporting
          </Typography>
          <Typography variant="body2" sx={{ color: "#666" }}>
            Welcome back, {user?.email}
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Filter by Date Range
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{ backgroundColor: "#667eea" }}
            >
              Apply Filters
            </Button>
            <Button variant="outlined" onClick={handleResetFilters}>
              Reset
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
        ) : (
          <>
            {/* Key Metrics Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Policies"
                  value={policyData?.total || 0}
                  subtitle={`${policyData?.active || 0} Active`}
                  color="#667eea"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Exposure"
                  value={formatCurrency(policyData?.totalExposure || 0)}
                  subtitle={`Coverage: ${formatCurrency(
                    policyData?.totalCoverage || 0
                  )}`}
                  color="#10b981"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Loss Ratio"
                  value={formatPercentage(claimData?.lossRatio || 0)}
                  subtitle={`Total Claims: ${formatCurrency(
                    claimData?.totalClaimAmount || 0
                  )}`}
                  color="#f97316"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Claims Ratio"
                  value={formatPercentage(claimData?.claimsRatio || 0)}
                  subtitle={`Settled: ${claimData?.settled || 0}`}
                  color="#06b6d4"
                />
              </Grid>
            </Grid>

            {/* Policy Metrics */}
            <Grid container spacing={3} sx={{ mb: 4, display: "flex", alignItems: "stretch" }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Policy Status Breakdown
                  </Typography>
                  {policyStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={policyStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {policyStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#999" }}>
                      No policy data available
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Policy Summary
                  </Typography>
                  <Box sx={{ space: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Total Policies:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#667eea" }}
                      >
                        {policyData?.total || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Active:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#10b981" }}
                      >
                        {policyData?.active || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Pending Approval:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#f97316" }}
                      >
                        {policyData?.pending || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Total Coverage:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#667eea" }}
                      >
                        {formatCurrency(policyData?.totalCoverage || 0)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">Total Exposure:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#10b981" }}
                      >
                        {formatCurrency(policyData?.totalExposure || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Claims Metrics */}
            <Grid container spacing={3} sx={{ mb: 4, display: "flex", alignItems: "stretch" }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Claims Status Breakdown
                  </Typography>
                  {claimStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={claimStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={8} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#999" }}>
                      No claims data available
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Claims Summary
                  </Typography>
                  <Box sx={{ space: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Total Claims:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#3b82f6" }}
                      >
                        {claimData?.total || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Approved:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#10b981" }}
                      >
                        {claimData?.approved || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Settled:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#06b6d4" }}
                      >
                        {claimData?.settled || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Loss Ratio:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#f97316" }}
                      >
                        {formatPercentage(claimData?.lossRatio || 0)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">Total Claim Amount:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#3b82f6" }}
                      >
                        {formatCurrency(claimData?.totalClaimAmount || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Reinsurance Metrics */}
            <Grid container spacing={3} sx={{ mb: 4, display: "flex", alignItems: "stretch" }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Ceded vs Retained Distribution
                  </Typography>
                  {reinsuranceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reinsuranceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) =>
                            `${name}: ${formatCurrency(value)}`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reinsuranceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#999" }}>
                      No reinsurance data available
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Reinsurance Summary
                  </Typography>
                  <Box sx={{ space: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Total Ceded:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#a855f7" }}
                      >
                        {formatCurrency(reData?.totalCeded || 0)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Total Retained:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#3b82f6" }}
                      >
                        {formatCurrency(reData?.totalRetained || 0)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Ceded/Retained Ratio:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#a855f7" }}
                      >
                        {formatPercentage(reData?.cededRetainedRatio || 0)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Typography variant="body2">Active Treaties:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#10b981" }}
                      >
                        {reData?.activeTreaties || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                      }}
                    >
                      <Typography variant="body2">Partners:</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#f97316" }}
                      >
                        {reData?.partnersCount || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;