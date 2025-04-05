import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Box, Button, TextField, Typography } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface InputData{
  username:string;
  password:string;
}

function Login () {
  const [input, setInput] = useState<InputData>({
  username: '',
  password: '',
})
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const handleChange = (event:React.ChangeEvent<HTMLInputElement> )=> {
    const name = event.target.name
    const value = event.target.value
    console.log(name, value)
    setInput(input => ({ ...input, [name]: value }))
  }

  // useEffect(() => {
  //   axios.post()
  // })

  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev) // Toggle visibility
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
        navigate('/login')
      })
      .catch(error => {
        if (error.response) {
          // The server responded with a status other than 2xx
          console.error('Error response:', error.response)
        } else if (error.request) {
          // No response was received from the server
          console.error('Error request:', error.request)
        } else {
          // Something else triggered the error
          console.error('Error message:', error.message)
        }
        setError('Incorrect Credentials')
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
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,  // Assuming backend sends user_id
          username: input['username']
        }));
        navigate('/login');  // You might want to change this to '/home' or '/dashboard'
      })
      .catch(error => {
        if (error.response) {
          console.error('Error response:', error.response);
        } else if (error.request) {
          console.error('Error request:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
        setError('Incorrect Credentials');
      });
  }

  return (
    <div
      style={{
        backgroundImage: 'url(bg4.jpg)',
        backgroundSize: 'cover', // Make the image cover the entire container
        backgroundPosition: 'center', // Center the image
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center', // Horizontally center the card
        alignItems: 'center'
      }}
    >
      <Card
        sx={{
          maxWidth: '30%',
          minHeight: '50%',
          marginLeft: '1000px',
          bgcolor: '#fff59d'
        }}
      >
        <CardContent>
          <Typography variant='h4' fontFamily='-moz-initial'>
            Login Form
          </Typography>
          {error ? (
            <Typography variant='h5' color='red' marginTop='35px'>
              {error}{' '}
            </Typography>
          ) : (
            ''
          )}

          <form>
            <Box sx={{ padding: '20px' , textAlign:'left' }}>
              <label>
                {' '}
                <Typography
                  variant='h6'
                  sx={{ paddingTop: '35px', fontWeight: 525 }}
                >
                  Username
                </Typography>{' '}
              </label>
              <TextField
                type='text'
                name='username'
                value={input?.username ?? ''}
                onChange={handleChange}
                style={{ width: '100%', height: '45px' }}
              />
              <label>
                {' '}
                <Typography
                  variant='h6'
                  sx={{ paddingTop: '50px', fontWeight: 525 }}
                >
                  {' '}
                  Password{' '}
                </Typography>
              </label>
              <TextField
                name='password'
                type={!showPassword ? 'password' : 'text'}
                value={input?.password ?? ''}
                onChange={handleChange}
                style={{ width: '100%', height: '45px' }}
                variant='outlined'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleClickShowPassword} edge='end'>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Box
                display='flex'
                justifyContent='space-between' // Align buttons on the same line with space between
                style={{
                  marginTop: '50px',
                  width: '100%'
                }}
              >
                <Button
                  variant='contained'
                  style={{
                    // marginTop: '10px',/
                    marginLeft: '180px',
                    textAlign: 'center'
                  }}
                  onClick={onLogin}
                >
                  {' '}
                  LOGIN
                </Button>
                <Button
                  variant='contained'
                  style={{
                    // marginTop: '10px',
                    marginRight: '200px',
                    marginLeft: '20px',
                    textAlign: 'center'
                  }}
                  onClick={onSignup}
                >
                  {' '}
                  SIGNUP
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
