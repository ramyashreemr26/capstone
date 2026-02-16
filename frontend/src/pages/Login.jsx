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
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    // Validation
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                textAlign: "center",
                color: "#333",
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#666",
              }}
            >
              Sign in to your insurance management account
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={!!emailError}
              helperText={emailError}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              error={!!error}
              helperText={error}
              disabled={loading}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                padding: "10px",
                borderRadius: 1,
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "#666",
              mt: 2,
            }}
          >
            Demo Credentials: admin@example.com / password123
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;