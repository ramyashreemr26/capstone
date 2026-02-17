import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [policy, setPolicy] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/policies/${id}`);
      setPolicy(res.data);
      try {
        const audit = await api.get(`/policies/${id}/audit`);
        setLogs(audit.data);
      } catch (auditErr) {
        // If audit logs fail to load, continue without them
        console.warn("Failed to load audit logs:", auditErr.message);
        setLogs([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load policy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [id]);

  const submitPolicy = async () => {
    try {
      await api.put(`/policies/${id}/submit`);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit policy");
    }
  };

  const approvePolicy = async () => {
    try {
      await api.put(`/policies/${id}/approve`);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve policy");
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container maxWidth="md">
      <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
    </Container>
  );

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', py: 4, minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button onClick={() => navigate('/policies')} sx={{ mr: 2 }}>← Back</Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Policy Details</Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">{policy.policyNumber} — {policy.insuredName}</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip label={policy.status} color={policy.status === 'ACTIVE' || policy.status === 'APPROVED' ? 'success' : 'default'} />
            <Typography>Type: {policy.type}</Typography>
            <Typography>Coverage: ${policy.coverageAmount?.toLocaleString() || 0}</Typography>
            <Typography>Retention: ${policy.retentionLimit?.toLocaleString() || 0}</Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            {user?.role === 'UNDERWRITER' && policy.status === 'DRAFT' && (
              <Button variant="contained" onClick={submitPolicy} sx={{ mr: 2 }}>Submit for Approval</Button>
            )}

            {user?.role === 'ADMIN' && policy.status === 'PENDING_APPROVAL' && (
              <Button variant="contained" color="success" onClick={approvePolicy}>Approve</Button>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Audit Trail</Typography>
          <List>
            {logs.length === 0 && <ListItem><ListItemText primary="No audit logs" /></ListItem>}
            {logs.map((l) => (
              <Box key={l._id}>
                <ListItem>
                  <ListItemText primary={l.action} secondary={`${l.performedBy?.name || 'system'} — ${new Date(l.createdAt).toLocaleString()}`} />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default PolicyDetails;
