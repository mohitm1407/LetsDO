import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Avatar, Box, Button, Container, Divider, Paper, TextField, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface InputData{
  username: string;
  password: string;
}

function Login () {
  const [input, setInput] = useState<InputData>({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { login, user } = useAuth()

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    setInput(input => ({ ...input, [name]: value }))
  }

  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  const onSignup = () => {
    axios
      .post('http://0.0.0.0:8001/signup/', {
        username: input['username'],
        password: input['password']
      })
      .then(response => {
        console.log(response)
        setError('')
        onLogin()
      })
      .catch(error => {
        if (error.response) {
          console.error('Error response:', error.response)
        } else if (error.request) {
          console.error('Error request:', error.request)
        } else {
          console.error('Error message:', error.message)
        }
        setError('Registration failed. Please try again.')
      })
  }

  const onLogin = () => {
    axios
      .post('http://0.0.0.0:8001/login/', {
        username: input['username'],
        password: input['password']
      })
      .then(response => {
        console.log(response);
        setError('');
        const userData = {
          id: response.data.user_id,
          username: input['username']
        };
        login(userData);
        navigate('/home');
      })
      .catch(error => {
        if (error.response) {
          console.error('Error response:', error.response);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        setError('Invalid username or password');
      });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin();
    } else {
      onSignup();
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Avatar 
              sx={{ 
                mb: 2, 
                bgcolor: '#1976d2',
                width: 56,
                height: 56,
                boxShadow: '0 0 20px rgba(25, 118, 210, 0.3)'
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography 
              component="h1" 
              variant="h4" 
              fontWeight="bold"
              color="#1976d2"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Typography>
            {error && (
              <Typography 
                color="error" 
                variant="body2" 
                sx={{ mt: 2, fontWeight: 500 }}
              >
                {error}
              </Typography>
            )}
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={input.username}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              id="password"
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              value={input.password}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2,
                boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                }
              }}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Typography>
              <Button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                sx={{ 
                  mt: 1,
                  color: '#1976d2',
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
