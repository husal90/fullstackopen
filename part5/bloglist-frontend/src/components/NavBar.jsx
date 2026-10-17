import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Button, Typography } from '@mui/material'

const hoverStyle = { '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }

const NavBar = ({ user, handleLogout }) => (
  <AppBar position="static">
    <Toolbar>
      <Button color="inherit" component={Link} to="/" sx={hoverStyle}>
        blogs
      </Button>
      {user && (
        <Button color="inherit" component={Link} to="/create" sx={hoverStyle}>
          create new
        </Button>
      )}

      <div style={{ flexGrow: 1 }} />

      {user ? (
        <>
          <Typography component="span" sx={{ marginRight: 2 }}>
            {user.name} logged in
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={hoverStyle}>
            logout
          </Button>
        </>
      ) : (
        <Button color="inherit" component={Link} to="/login" sx={hoverStyle}>
          login
        </Button>
      )}
    </Toolbar>
  </AppBar>
)

export default NavBar
