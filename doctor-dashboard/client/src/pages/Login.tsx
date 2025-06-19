import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation, Link as RouterLink, Location } from 'react-router-dom';
import { User } from '../types/user';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { LockOutlined, EmailOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../services/auth';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const navigate = useNavigate();
  const location: Location = useLocation();
  const from: string = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (rememberMe) {
      const savedEmail = localStorage.getItem('savedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [rememberMe]);

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setFormError('');
    
    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setFormError('');

    setLoading(true);

    try {
      // Save email to localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
      }
      
      // Call the login function from auth context
      await login(email, password);
      setShowSuccess(true);
      
    } catch (err: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle form submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const form = e.currentTarget.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }
  };

  // Show success message and then redirect
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate, from]);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
        p: 2,
        transition: 'opacity 0.5s ease-in-out',
        opacity: showSuccess ? 0.9 : 1
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            borderRadius: 3, 
            px: { xs: 3, sm: 6 }, 
            py: { xs: 4, sm: 6 }, 
            width: '100%',
            maxWidth: 450
          }}
        >
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              Welcome Back!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your dashboard
            </Typography>
          </Box>
          
          {formError && (
            <Fade in={!!formError}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {formError}
              </Alert>
            </Fade>
          )}
          
          <Fade in={showSuccess}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Login successful! Redirecting...
            </Alert>
          </Fade>
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color={emailError ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 1,
                  '&.Mui-error fieldset': {
                    borderColor: 'error.main',
                  }
                }
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color={passwordError ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      tabIndex={-1} // Prevent tab focus on the icon
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 1,
                  '&.Mui-error fieldset': {
                    borderColor: 'error.main',
                  }
                }
              }}
              sx={{ mb: 1 }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    value="remember" 
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                }
                label="Remember me"
              />
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #0d47a1 90%)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary" component="span">
                Don't have an account?{' '}
              </Typography>
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                Sign up
              </Link>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton 
              sx={{ 
                border: '1px solid #e0e0e0',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <img src="/google.svg" alt="Google" width={24} height={24} />
            </IconButton>
            <IconButton 
              sx={{ 
                border: '1px solid #e0e0e0',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <img src="/microsoft.svg" alt="Microsoft" width={24} height={24} />
            </IconButton>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
