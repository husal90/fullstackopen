const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((favorite, blog) =>
    blog.likes > favorite.likes ? blog : favorite
  )
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const counts = new Map()
  for (const blog of blogs) {
    counts.set(blog.author, (counts.get(blog.author) || 0) + 1)
  }

  const [author, count] = [...counts.entries()].reduce((top, entry) =>
    entry[1] > top[1] ? entry : top
  )

  return { author, blogs: count }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const likes = new Map()
  for (const blog of blogs) {
    likes.set(blog.author, (likes.get(blog.author) || 0) + blog.likes)
  }

  const [author, total] = [...likes.entries()].reduce((top, entry) =>
    entry[1] > top[1] ? entry : top
  )

  return { author, likes: total }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
