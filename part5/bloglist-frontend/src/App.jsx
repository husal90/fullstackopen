import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useMatch, useNavigate } from 'react-router-dom'
import { Container } from '@mui/material'
import BlogList from './components/BlogList'
import BlogView from './components/BlogView'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import NavBar from './components/NavBar'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const LOCAL_STORAGE_KEY = 'loggedBlogappUser'

// read synchronously, so a page reload does not briefly look like a logged-out user
const loadStoredUser = () => {
  const loggedUserJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY)
  return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(loadStoredUser)
  const [notification, setNotification] = useState(null)

  const navigate = useNavigate()

  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find(b => b.id === match.params.id) : null

  useEffect(() => {
    const fetchBlogs = async () => {
      const initialBlogs = await blogService.getAll()
      setBlogs(initialBlogs)
    }

    fetchBlogs()
  }, [])

  // keep the token used for requests in sync with the logged-in user
  useEffect(() => {
    blogService.setToken(user ? user.token : null)
  }, [user])

  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })

      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loggedUser))
      setUser(loggedUser)
      setUsername('')
      setPassword('')
      navigate('/')
    } catch {
      notify('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    setUser(null)
    navigate('/')
  }

  // returns true if the blog was created, so the form knows whether to clear itself
  const createBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject)

      setBlogs(blogs.concat(createdBlog))
      notify(`a new blog ${createdBlog.title} by ${createdBlog.author} added`)
      navigate('/')
      return true
    } catch (error) {
      notify(error.response?.data?.error ?? 'creating the blog failed', 'error')
      return false
    }
  }

  const likeBlog = async (blogToLike) => {
    try {
      const updatedBlog = await blogService.update(blogToLike.id, {
        user: blogToLike.user.id,
        likes: blogToLike.likes + 1,
        author: blogToLike.author,
        title: blogToLike.title,
        url: blogToLike.url,
      })

      setBlogs(blogs.map(b => b.id === blogToLike.id ? updatedBlog : b))
    } catch (error) {
      notify(error.response?.data?.error ?? 'liking the blog failed', 'error')
    }
  }

  const removeBlog = async (blogToRemove) => {
    if (!window.confirm(`Remove blog ${blogToRemove.title} by ${blogToRemove.author}?`)) {
      return
    }

    try {
      await blogService.remove(blogToRemove.id)
      setBlogs(blogs.filter(b => b.id !== blogToRemove.id))
      notify(`blog ${blogToRemove.title} removed`)
      navigate('/')
    } catch (error) {
      notify(error.response?.data?.error ?? 'removing the blog failed', 'error')
    }
  }

  const blogsByLikes = blogs.toSorted((a, b) => b.likes - a.likes)

  return (
    <Container>
      <NavBar user={user} handleLogout={handleLogout} />

      <Notification notification={notification} />

      <Routes>
        <Route path="/" element={<BlogList blogs={blogsByLikes} />} />
        <Route
          path="/blogs/:id"
          element={
            <BlogView
              blog={blog}
              user={user}
              likeBlog={likeBlog}
              removeBlog={removeBlog}
            />
          }
        />
        <Route
          path="/create"
          element={
            user
              ? <BlogForm createBlog={createBlog} />
              : <Navigate replace to="/login" />
          }
        />
        <Route
          path="/login"
          element={
            <LoginForm
              handleSubmit={handleLogin}
              username={username}
              handleUsernameChange={({ target }) => setUsername(target.value)}
              password={password}
              handlePasswordChange={({ target }) => setPassword(target.value)}
            />
          }
        />
      </Routes>
    </Container>
  )
}

export default App
