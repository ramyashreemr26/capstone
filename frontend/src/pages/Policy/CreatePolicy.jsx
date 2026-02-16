import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  MenuItem,
} from "@mui/material";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const CreatePolicy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    policyNumber: "",
    insuredName: "",
    coverageAmount: "",
    premium: "",
    retentionLimit: "",
    type: "PROPERTY",
    effectiveDate: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.policyNumber.trim()) newErrors.policyNumber = "Policy number is required";
    if (!form.insuredName.trim()) newErrors.insuredName = "Insured name is required";
    if (!form.coverageAmount || form.coverageAmount <= 0) newErrors.coverageAmount = "Valid coverage amount is required";
    if (!form.premium || form.premium <= 0) newErrors.premium = "Valid premium amount is required";
    if (!form.retentionLimit || form.retentionLimit <= 0) newErrors.retentionLimit = "Valid retention limit is required";
    if (!form.effectiveDate) newErrors.effectiveDate = "Effective date is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/policies", form);
      setSuccess("Policy created successfully!");
      setTimeout(() => navigate("/policies"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
      <Container maxWidth="md">
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Button
              onClick={() => navigate("/policies")}
              sx={{ mr: 2 }}
            >
              ← Back
            </Button>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "#333" }}
            >
              Create Policy
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Paper sx={{ padding: 4, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  name="policyNumber"
                  value={form.policyNumber}
                  onChange={handleChange}
                  error={!!errors.policyNumber}
                  helperText={errors.policyNumber}
                  placeholder="e.g., POL-2025-001"
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Insured Name"
                  name="insuredName"
                  value={form.insuredName}
                  onChange={handleChange}
                  error={!!errors.insuredName}
                  helperText={errors.insuredName}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Type"
                  name="type"
                  select
                  value={form.type}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <MenuItem value="PROPERTY">Property</MenuItem>
                  <MenuItem value="LIABILITY">Liability</MenuItem>
                  <MenuItem value="MARINE">Marine</MenuItem>
                  <MenuItem value="CASUALTY">Casualty</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Effective Date"
                  name="effectiveDate"
                  type="date"
                  value={form.effectiveDate}
                  onChange={handleChange}
                  error={!!errors.effectiveDate}
                  helperText={errors.effectiveDate}
                  InputLabelProps={{ shrink: true }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coverage Amount"
                  name="coverageAmount"
                  type="number"
                  value={form.coverageAmount}
                  onChange={handleChange}
                  error={!!errors.coverageAmount}
                  helperText={errors.coverageAmount}
                  inputProps={{ step: "0.01", min: "0" }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Premium Amount"
                  name="premium"
                  type="number"
                  value={form.premium}
                  onChange={handleChange}
                  error={!!errors.premium}
                  helperText={errors.premium}
                  inputProps={{ step: "0.01", min: "0" }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Retention Limit"
                  name="retentionLimit"
                  type="number"
                  value={form.retentionLimit}
                  onChange={handleChange}
                  error={!!errors.retentionLimit}
                  helperText={errors.retentionLimit}
                  inputProps={{ step: "0.01", min: "0" }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      flex: 1,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                      "Create Policy"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/policies")}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
    </Box>
  );
};

export default CreatePolicy;