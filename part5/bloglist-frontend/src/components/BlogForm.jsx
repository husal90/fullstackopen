import { useState } from 'react'
import { TextField, Button, Typography } from '@mui/material'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = async (event) => {
    event.preventDefault()

    const created = await createBlog({ title, author, url })

    if (created) {
      setTitle('')
      setAuthor('')
      setUrl('')
    }
  }

  return (
    <div>
      <Typography variant="h4" component="h2" sx={{ marginTop: 3 }}>
        create new
      </Typography>
      <form onSubmit={addBlog}>
        <div>
          <TextField
            label="title"
            margin="normal"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          <TextField
            label="author"
            margin="normal"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          <TextField
            label="url"
            margin="normal"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
          />
        </div>
        <Button type="submit" variant="contained" style={{ marginTop: 10 }}>
          create
        </Button>
      </form>
    </div>
  )
}

export default BlogForm
