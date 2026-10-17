import { Button, Card, CardContent, CardActions, Typography } from '@mui/material'

const BlogView = ({ blog, user, likeBlog, removeBlog }) => {
  // the blogs may not have been fetched from the backend yet
  if (!blog) {
    return null
  }

  // only logged-in users can like, only the creator can remove
  const canLike = Boolean(user)
  const canRemove = Boolean(user) && blog.user?.username === user.username

  return (
    <Card style={{ marginTop: 20 }}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {blog.title} {blog.author}
        </Typography>
        <Typography>
          <a href={blog.url}>{blog.url}</a>
        </Typography>
        <Typography>likes {blog.likes}</Typography>
        <Typography>added by {blog.user?.name}</Typography>
      </CardContent>
      <CardActions>
        {canLike && (
          <Button variant="contained" onClick={() => likeBlog(blog)}>
            like
          </Button>
        )}
        {canRemove && (
          <Button variant="outlined" color="error" onClick={() => removeBlog(blog)}>
            remove
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

export default BlogView
