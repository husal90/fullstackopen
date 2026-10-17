import { TextField, Button, Typography } from '@mui/material'

const LoginForm = ({
  handleSubmit,
  username,
  handleUsernameChange,
  password,
  handlePasswordChange,
}) => (
  <div>
    <Typography variant="h4" component="h2" sx={{ marginTop: 3 }}>
      Log in to application
    </Typography>
    <form onSubmit={handleSubmit}>
      <div>
        <TextField
          label="username"
          margin="normal"
          value={username}
          onChange={handleUsernameChange}
        />
      </div>
      <div>
        <TextField
          label="password"
          type="password"
          margin="normal"
          value={password}
          onChange={handlePasswordChange}
        />
      </div>
      <Button type="submit" variant="contained" style={{ marginTop: 10 }}>
        login
      </Button>
    </form>
  </div>
)

export default LoginForm
