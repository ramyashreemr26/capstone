import { useEffect, useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TreatyList = () => {
  const [treaties, setTreaties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();

  const [form, setForm] = useState({
    treatyName: "",
    reinsurerName: "",
    sharePercentage: "",
    retentionLimit: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchTreaties = async () => {
    try {
      setLoading(true);
      const res = await api.get("/treaties");
      setTreaties(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load treaties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreaties();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.treatyName.trim()) newErrors.treatyName = "Treaty name is required";
    if (!form.reinsurerName.trim()) newErrors.reinsurerName = "Reinsurer name is required";
    if (!form.sharePercentage || form.sharePercentage <= 0 || form.sharePercentage > 100) {
      newErrors.sharePercentage = "Share percentage must be between 0 and 100";
    }
    if (!form.retentionLimit || form.retentionLimit <= 0) {
      newErrors.retentionLimit = "Retention limit is required";
    }
    return newErrors;
  };

  const createTreaty = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      await api.post("/treaties", form);
      setSuccess("Treaty created successfully!");
      setForm({ treatyName: "", reinsurerName: "", sharePercentage: "", retentionLimit: "" });
      setOpenDialog(false);
      fetchTreaties();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create treaty");
    }
  };

  const deleteTreaty = async (id) => {
    try {
      await api.delete(`/treaties/${id}`);
      fetchTreaties();
      setSuccess("Treaty deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete treaty");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
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
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#333" }}
              >
                Reinsurance Treaties
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                Manage reinsurance agreements and partnerships
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              + New Treaty
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
          ) : treaties.length === 0 ? (
            <Paper sx={{ padding: 4, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#666", mb: 2 }}>
                No treaties found
              </Typography>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                + Create First Treaty
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Treaty Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Reinsurer Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Share %
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      Retention Limit
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {treaties.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>{t.treatyName}</TableCell>
                      <TableCell>{t.reinsurerName}</TableCell>
                      <TableCell>{t.sharePercentage}%</TableCell>
                      <TableCell>${(t.retentionLimit || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deleteTreaty(t._id)}
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

        {/* Create Treaty Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Treaty</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treaty Name"
                name="treatyName"
                value={form.treatyName}
                onChange={handleInputChange}
                error={!!formErrors.treatyName}
                helperText={formErrors.treatyName}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reinsurer Name"
                name="reinsurerName"
                value={form.reinsurerName}
                onChange={handleInputChange}
                error={!!formErrors.reinsurerName}
                helperText={formErrors.reinsurerName}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Share Percentage"
                name="sharePercentage"
                type="number"
                value={form.sharePercentage}
                onChange={handleInputChange}
                error={!!formErrors.sharePercentage}
                helperText={formErrors.sharePercentage}
                inputProps={{ step: "0.1", min: "0", max: "100" }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Retention Limit"
                name="retentionLimit"
                type="number"
                value={form.retentionLimit}
                onChange={handleInputChange}
                error={!!formErrors.retentionLimit}
                helperText={formErrors.retentionLimit}
                inputProps={{ step: "0.01", min: "0" }}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={createTreaty}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default TreatyList;