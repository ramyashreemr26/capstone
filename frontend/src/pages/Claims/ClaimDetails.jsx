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

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/claims`);
      const found = res.data.find((c) => c._id === id);
      setClaim(found || null);
      setLogs([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load claim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    const iv = setInterval(fetch, 4000);
    return () => clearInterval(iv);
  }, [id]);

  const doAction = async (action) => {
    try {
      await api.put(`/claims/${id}/${action}`);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
  );

  if (error) return (
    <Container maxWidth="md"><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>
  );

  if (!claim) return (
    <Container maxWidth="md"><Alert severity="info" sx={{ mt: 4 }}>Claim not found</Alert></Container>
  );

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', py: 4, minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button onClick={() => navigate('/claims')} sx={{ mr: 2 }}>← Back</Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Claim Details</Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6">{claim.claimNumber} — {claim.claimAmount && `$${claim.claimAmount.toLocaleString()}`}</Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip label={claim.status} color={claim.status === 'APPROVED' || claim.status === 'SETTLED' ? 'success' : 'default'} />
            <Typography>Policy: {claim.policyId?.policyNumber || 'N/A'}</Typography>
            <Typography>Submitted: {claim.createdAt ? new Date(claim.createdAt).toLocaleString() : 'N/A'}</Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            {claim.status === 'SUBMITTED' && user?.role === 'CLAIMS_ADJUSTER' && (
              <Button variant="contained" onClick={() => doAction('review')} sx={{ mr: 2 }}>Move to Review</Button>
            )}
            {claim.status === 'UNDER_REVIEW' && user?.role === 'CLAIMS_ADJUSTER' && (
              <>
                <Button variant="contained" color="success" onClick={() => doAction('approve')} sx={{ mr: 2 }}>Approve</Button>
                <Button variant="contained" color="error" onClick={() => doAction('reject')}>Reject</Button>
              </>
            )}
            {claim.status === 'APPROVED' && user?.role === 'CLAIMS_ADJUSTER' && (
              <Button variant="contained" color="info" onClick={() => doAction('settle')}>Settle</Button>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Lifecycle Timeline</Typography>
          <List>
            <ListItem><ListItemText primary="SUBMITTED" secondary={claim.createdAt ? new Date(claim.createdAt).toLocaleString() : ''} /></ListItem>
            {claim.reviewedBy && <ListItem><ListItemText primary="UNDER_REVIEW" secondary={claim.updatedAt ? new Date(claim.updatedAt).toLocaleString() : ''} /></ListItem>}
            {claim.status === 'APPROVED' && <ListItem><ListItemText primary="APPROVED" secondary={claim.updatedAt ? new Date(claim.updatedAt).toLocaleString() : ''} /></ListItem>}
            {claim.status === 'SETTLED' && <ListItem><ListItemText primary="SETTLED" secondary={claim.updatedAt ? new Date(claim.updatedAt).toLocaleString() : ''} /></ListItem>}
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default ClaimDetails;
