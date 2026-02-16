import { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 260;

const Sidebar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", roles: ["ADMIN", "UNDERWRITER", "CLAIMS_ADJUSTER", "REINSURANCE_MANAGER"] },
    { label: "Policies", path: "/policies", roles: ["UNDERWRITER", "ADMIN"] },
    { label: "Claims", path: "/claims", roles: ["CLAIMS_ADJUSTER"] },
    { label: "Treaties", path: "/treaties", roles: ["REINSURANCE_MANAGER"] },
    { label: "Users", path: "/users", roles: ["ADMIN"] },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Drawer */}
      <Drawer
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ padding: 3, textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
            }}
          >
            IMS
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Insurance Management
          </Typography>
        </Box>

        <Divider sx={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }} />

        <List sx={{ paddingTop: 2 }}>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: isActive(item.path)
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                  borderRight: isActive(item.path)
                    ? "3px solid white"
                    : "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? "white" : "rgba(255, 255, 255, 0.7)",
                    minWidth: 40,
                  }}
                >
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    color: "white",
                    "& .MuiTypography-root": {
                      fontWeight: isActive(item.path) ? 600 : 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top AppBar */}
        <AppBar
          position="static"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Insurance Management System
            </Typography>
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                textTransform: "none",
                fontSize: "0.95rem",
              }}
            >
              {user?.email}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                Role: <strong>{user?.role}</strong>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
