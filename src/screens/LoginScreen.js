import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/material/styles';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useFirebase } from '../firebase/context';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  margin: 0,
  padding: 0,
  borderRadius: 0,
  boxShadow: 'none',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url(/loginbg.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 1
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, 
      rgba(33, 150, 243, 0.85), 
      rgba(76, 175, 80, 0.85))`,
    mixBlendMode: 'multiply',
    zIndex: 2
  }
}));

const LoginFormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(6),
  width: '100%',
  maxWidth: '460px',
  margin: theme.spacing(3),
  position: 'relative',
  zIndex: 3,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4),
    margin: theme.spacing(2),
  }
}));

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { auth } = useFirebase();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (email === 'admin@wango.com' && password === 'admin123') {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledPaper component="main">
      <LoginFormContainer>
            <Box sx={{ mb: 5, textAlign: 'center' }}>
              <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Wangu Holdings Logo" style={{ width: 64, height: 64, marginBottom: 8 }} />
              <Typography 
                variant="h5" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: 'primary.main',
                  fontFamily: 'Century Gothic',
                  fontWeight: 'bold',
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: 1.2
                }}
              >
                Wangu Holdings Limited<br />| M&E Platform
              </Typography>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  color: 'text.secondary',
                  fontFamily: 'Trebuchet MS',
                  fontWeight: 'bold',
                  letterSpacing: '1px'
                }}
              >
                Administrator Login
              </Typography>
            </Box>
        
        <Box 
          component="form" 
          onSubmit={handleLogin} 
          sx={{ 
            width: '100%', 
            maxWidth: '400px',
            mt: 1,
            mx: 'auto'
          }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& label': { 
                fontFamily: 'Trebuchet MS',
                fontSize: '1rem',
                ml: 4
              },
              '& input': { 
                fontFamily: 'Trebuchet MS',
                fontSize: '1rem',
                padding: '16px 14px',
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
                  transform: 'translateY(-1px)',
                }
              }
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 4,
              '& label': { 
                fontFamily: 'Trebuchet MS',
                fontSize: '1rem',
                ml: 4
              },
              '& input': { 
                fontFamily: 'Trebuchet MS',
                fontSize: '1rem',
                padding: '16px 14px',
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.2)',
                  transform: 'translateY(-1px)',
                }
              }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={(theme) => ({
              mt: 2,
              mb: 4,
              py: 2,
              fontFamily: 'Candara',
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '12px',
              background: `linear-gradient(45deg, 
                ${theme.palette.primary.main}, 
                ${theme.palette.secondary.main}
              )`,
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              letterSpacing: '0.5px',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                background: `linear-gradient(45deg, 
                  ${theme.palette.primary.dark}, 
                  ${theme.palette.secondary.dark}
                )`,
              },
              '&:active': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 16px rgba(33, 150, 243, 0.4)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            })}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: theme => `${theme.palette.primary.main}10`,
              border: '1px solid',
              borderColor: theme => `${theme.palette.primary.main}20`,
            }}
          >
            <Typography 
              variant="body2" 
              align="center"
              sx={{ 
                fontFamily: 'Trebuchet MS',
                color: 'text.secondary',
                fontSize: '0.9rem',
                '& span': {
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mx: 0.5
                }
              }}
            >
              System Administrator Credentials:<br />
              <span>admin@wango.com</span> / <span>admin123</span>
            </Typography>
          </Box>
        </Box>
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </LoginFormContainer>
    </StyledPaper>
  );
};

export default LoginScreen;
