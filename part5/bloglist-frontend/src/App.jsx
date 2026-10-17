import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const LOCAL_STORAGE_KEY = 'loggedBlogappUser'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      const initialBlogs = await blogService.getAll()
      setBlogs(initialBlogs)
    }

    fetchBlogs()
  }, [])

  // restore a previous login from the local storage
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY)

    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON)
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [])

  const notify = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const loggedUser = await loginService.login({ username, password })

      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loggedUser))
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      notify('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
    blogService.setToken(null)
    setUser(null)
  }

  // returns true if the blog was created, so the form knows whether to clear itself
  const createBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject)

      setBlogs(blogs.concat({ ...createdBlog, user: { username: user.username, name: user.name } }))
      notify(`a new blog ${createdBlog.title} by ${createdBlog.author} added`)
      return true
    } catch (error) {
      notify(error.response?.data?.error ?? 'creating the blog failed', 'error')
      return false
    }
  }

  if (user === null) {
    return (
      <div>
        <Notification notification={notification} />
        <LoginForm
          handleSubmit={handleLogin}
          username={username}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          password={password}
          handlePasswordChange={({ target }) => setPassword(target.value)}
        />
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>

      <Notification notification={notification} />

      <p>
        {user.name} logged in{' '}
        <button onClick={handleLogout}>logout</button>
      </p>

      <BlogForm createBlog={createBlog} />

      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}

export default App
