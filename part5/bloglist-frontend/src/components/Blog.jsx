import { useState } from 'react'

const Blog = ({ blog, likeBlog, removeBlog, canRemove }) => {
  const [detailsVisible, setDetailsVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  return (
    <div style={blogStyle}>
      <div>
        {blog.title} {blog.author}{' '}
        <button onClick={() => setDetailsVisible(!detailsVisible)}>
          {detailsVisible ? 'hide' : 'view'}
        </button>
      </div>
      {detailsVisible && (
        <div>
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}{' '}
            <button onClick={() => likeBlog(blog)}>like</button>
          </div>
          <div>{blog.user?.name}</div>
          {canRemove && (
            <button onClick={() => removeBlog(blog)}>remove</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
