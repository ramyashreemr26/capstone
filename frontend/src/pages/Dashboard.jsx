import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [policyData, setPolicyData] = useState(null);
  const [claimData, setClaimData] = useState(null);
  const [reData, setReData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [policiesRes, claimsRes, reRes] = await Promise.all([
          api.get("/dashboard/policies"),
          api.get("/dashboard/claims"),
          api.get("/dashboard/reinsurance"),
        ]);
        setPolicyData(policiesRes.data);
        setClaimData(claimsRes.data);
        setReData(reRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
      <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#333", mb: 1 }}
            >
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Welcome back, {user?.email}
            </Typography>
          </Box>

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
            <Grid container spacing={3}>
              {/* Policies Section */}
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Total Policies"
                  value={policyData?.total || 0}
                  subtitle={`${policyData?.active || 0} Active`}
                  color="#667eea"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Pending Approval"
                  value={policyData?.pending || 0}
                  subtitle="Awaiting approval"
                  color="#f97316"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Approved Policies"
                  value={policyData?.approved || 0}
                  subtitle="Active & approved"
                  color="#10b981"
                />
              </Grid>

              {/* Claims Section */}
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Total Claims"
                  value={claimData?.total || 0}
                  subtitle={`${claimData?.pending || 0} Pending`}
                  color="#3b82f6"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Under Review"
                  value={claimData?.underReview || 0}
                  subtitle="Being processed"
                  color="#a855f7"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Approved Claims"
                  value={claimData?.approved || 0}
                  subtitle="Settled successfully"
                  color="#06b6d4"
                />
              </Grid>

              {/* Reinsurance Section */}
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Total Treaties"
                  value={reData?.total || 0}
                  subtitle="Active reinsurance"
                  color="#ec4899"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Committed Capital"
                  value={`$${(reData?.capital || 0).toLocaleString()}`}
                  subtitle="Total coverage"
                  color="#14b8a6"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Active Partners"
                  value={reData?.partners || 0}
                  subtitle="Reinsurance partners"
                  color="#f59e0b"
                />
              </Grid>
            </Grid>
          )}
        </Container>
    </Box>
  );
};

export default Dashboard;