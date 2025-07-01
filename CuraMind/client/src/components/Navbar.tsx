import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { Logout, Person } from '@mui/icons-material';

const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
    handleClose();
  };

  const isAuthenticated = 'isAuthenticated' in auth ? auth.isAuthenticated : false;
  const user = 'user' in auth ? auth.user : null;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ 
          flexGrow: 1, 
          textDecoration: 'none',
          color: 'inherit',
          '&:hover': {
            textDecoration: 'none'
          }
        }}>
          Doctor Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && (
            <>
              <Button color="inherit" component={RouterLink} to="/appointments">
                Appointments
              </Button>
              <Button color="inherit" component={RouterLink} to={"/" + (user?.role || 'doctor')}>
                Dashboard
              </Button>
              
              <IconButton
                onClick={handleMenu}
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.[0]?.toUpperCase() || <Person />}
                </Avatar>
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem disabled>{user?.email}</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
          
          {!isAuthenticated && (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
