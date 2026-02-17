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
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const steps = ["General", "Coverage", "Review"];

const CreatePolicy = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeStep, setActiveStep] = useState(0);

  const [form, setForm] = useState({
    policyNumber: "",
    insuredName: "",
    coverageAmount: "",
    premium: "",
    retentionLimit: "",
    type: "PROPERTY",
    effectiveFrom: "",
    duration: "",
    effectiveUntil: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...form, [name]: value };
    if ((name === "effectiveFrom" || name === "duration") && updated.effectiveFrom && updated.duration) {
      const fromDate = new Date(updated.effectiveFrom);
      const until = new Date(fromDate);
      until.setDate(until.getDate() + parseInt(updated.duration));
      updated.effectiveUntil = until.toISOString().split("T")[0];
    }
    setForm(updated);
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!form.policyNumber.trim()) newErrors.policyNumber = "Policy number is required";
      if (!form.insuredName.trim()) newErrors.insuredName = "Insured name is required";
      if (!form.effectiveFrom) newErrors.effectiveFrom = "Effective from is required";
      if (!form.duration || form.duration <= 0) newErrors.duration = "Duration is required";
    }
    if (step === 1) {
      if (!form.coverageAmount || form.coverageAmount <= 0) newErrors.coverageAmount = "Valid coverage amount is required";
      if (!form.premium || form.premium <= 0) newErrors.premium = "Valid premium is required";
      if (form.retentionLimit === "" || form.retentionLimit < 0) newErrors.retentionLimit = "Retention limit is required";
    }
    return newErrors;
  };

  const next = () => {
    const v = validateStep(activeStep);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const back = () => setActiveStep((s) => Math.max(0, s - 1));

  const saveDraft = async () => {
    try {
      setLoading(true);
      const res = await api.post("/policies", form);
      setSuccess("Policy saved as DRAFT");
      setTimeout(() => navigate(`/policies/${res.data.policy._id}`), 800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save policy");
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async () => {
    try {
      setLoading(true);
      const res = await api.post("/policies", form);
      await api.put(`/policies/${res.data.policy._id}/submit`);
      setSuccess("Policy submitted for approval");
      setTimeout(() => navigate(`/policies`), 800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit policy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", py: 4, minHeight: "100vh" }}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button onClick={() => navigate("/policies")} sx={{ mr: 2 }}>
            ← Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
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
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Policy Number" name="policyNumber" value={form.policyNumber} onChange={handleChange} error={!!errors.policyNumber} helperText={errors.policyNumber} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Insured Name" name="insuredName" value={form.insuredName} onChange={handleChange} error={!!errors.insuredName} helperText={errors.insuredName} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Type" name="type" select value={form.type} onChange={handleChange} disabled={loading}>
                  <MenuItem value="PROPERTY">Property</MenuItem>
                  <MenuItem value="LIABILITY">Liability</MenuItem>
                  <MenuItem value="MARINE">Marine</MenuItem>
                  <MenuItem value="CASUALTY">Casualty</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Effective From" name="effectiveFrom" type="date" value={form.effectiveFrom} onChange={handleChange} error={!!errors.effectiveFrom} helperText={errors.effectiveFrom} InputLabelProps={{ shrink: true }} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Duration (Days)" name="duration" type="number" value={form.duration} onChange={handleChange} error={!!errors.duration} helperText={errors.duration} inputProps={{ min: "1" }} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Effective Until" type="date" value={form.effectiveUntil} InputLabelProps={{ shrink: true }} disabled sx={{ backgroundColor: "#f5f5f5" }} />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Coverage Amount" name="coverageAmount" type="number" value={form.coverageAmount} onChange={handleChange} error={!!errors.coverageAmount} helperText={errors.coverageAmount} inputProps={{ step: "0.01", min: "0" }} disabled={loading} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Premium Amount" name="premium" type="number" value={form.premium} onChange={handleChange} error={!!errors.premium} helperText={errors.premium} inputProps={{ step: "0.01", min: "0" }} disabled={loading} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Retention Limit" name="retentionLimit" type="number" value={form.retentionLimit} onChange={handleChange} error={!!errors.retentionLimit} helperText={errors.retentionLimit} inputProps={{ step: "0.01", min: "0" }} disabled={loading} />
              </Grid>
            </Grid>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Review</Typography>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                <Grid item xs={12}><strong>Policy Number:</strong> {form.policyNumber || "-"}</Grid>
                <Grid item xs={12}><strong>Insured:</strong> {form.insuredName || "-"}</Grid>
                <Grid item xs={12}><strong>Type:</strong> {form.type}</Grid>
                <Grid item xs={12}><strong>From:</strong> {form.effectiveFrom || "-"}</Grid>
                <Grid item xs={12}><strong>Until:</strong> {form.effectiveUntil || "-"}</Grid>
                <Grid item xs={12}><strong>Coverage:</strong> ${form.coverageAmount || 0}</Grid>
                <Grid item xs={12}><strong>Premium:</strong> ${form.premium || 0}</Grid>
                <Grid item xs={12}><strong>Retention:</strong> ${form.retentionLimit || 0}</Grid>
              </Grid>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/policies")}>Cancel</Button>
            {activeStep > 0 && <Button variant="text" onClick={back}>Back</Button>}
            {activeStep < 2 && <Button variant="contained" onClick={next} sx={{ ml: "auto" }}>Next</Button>}
            {activeStep === 2 && (
              <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
                <Button variant="outlined" onClick={saveDraft} disabled={loading}>{loading ? <CircularProgress size={20} /> : "Save Draft"}</Button>
                <Button variant="contained" onClick={submitForApproval} disabled={loading} sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>{loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Submit for Approval"}</Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreatePolicy;