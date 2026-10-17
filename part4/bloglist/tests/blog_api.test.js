const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const login = async (username, password) => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)

  return response.body.token
}

let token

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = await new User({ username: 'root', name: 'Superuser', passwordHash }).save()

    const blogs = await Blog.insertMany(
      helper.initialBlogs.map(blog => ({ ...blog, user: user._id }))
    )
    user.blogs = blogs.map(blog => blog._id)
    await user.save()

    token = await login('root', 'sekret')
  })

  describe('fetching blogs', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned, without needing a token', async () => {
      const response = await api.get('/api/blogs')

      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('the unique identifier of a blog is named id', async () => {
      const response = await api.get('/api/blogs')

      for (const blog of response.body) {
        assert.ok(blog.id)
        assert.strictEqual(blog._id, undefined)
        assert.strictEqual(blog.__v, undefined)
      }
    })

    test('each blog includes information about its creator', async () => {
      const response = await api.get('/api/blogs')

      for (const blog of response.body) {
        assert.strictEqual(blog.user.username, 'root')
        assert.strictEqual(blog.user.name, 'Superuser')
        assert.strictEqual(blog.user.passwordHash, undefined)
      }
    })

    test('users are listed together with their blogs', async () => {
      const response = await api.get('/api/users')

      assert.strictEqual(response.body[0].blogs.length, helper.initialBlogs.length)
      assert.ok(response.body[0].blogs[0].title)
    })
  })

  describe('addition of a new blog', () => {
    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    }

    test('succeeds with valid data and a valid token', async () => {
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const saved = blogsAtEnd.find(blog => blog.title === newBlog.title)
      assert.strictEqual(saved.author, newBlog.author)
      assert.strictEqual(saved.url, newBlog.url)
      assert.strictEqual(saved.likes, newBlog.likes)
    })

    test('designates the user of the token as the creator', async () => {
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      const root = await User.findOne({ username: 'root' })
      assert.strictEqual(response.body.user, root._id.toString())
      assert(root.blogs.map(id => id.toString()).includes(response.body.id))
    })

    test('fails with status code 401 if the token is missing', async () => {
      const result = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      assert(result.body.error)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 401 if the token is invalid', async () => {
      await api
        .post('/api/blogs')
        .set('Authorization', 'Bearer thisisnotavalidtoken')
        .send(newBlog)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('likes defaults to 0 when missing', async () => {
      const { likes, ...blogWithoutLikes } = newBlog
      assert.ok(likes)

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutLikes)
        .expect(201)

      assert.strictEqual(response.body.likes, 0)
    })

    test('fails with status code 400 if title is missing', async () => {
      const { title, ...blogWithoutTitle } = newBlog
      assert.ok(title)

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutTitle)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const { url, ...blogWithoutUrl } = newBlog
      assert.ok(url)

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogWithoutUrl)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 for the creator', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const ids = blogsAtEnd.map(blog => blog.id)
      assert(!ids.includes(blogToDelete.id))

      const root = await User.findOne({ username: 'root' })
      assert(!root.blogs.map(id => id.toString()).includes(blogToDelete.id))
    })

    test('fails with status code 401 without a token', async () => {
      const blogsAtStart = await helper.blogsInDb()

      await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 403 for a user who is not the creator', async () => {
      await api
        .post('/api/users')
        .send({ username: 'other', name: 'Other User', password: 'salainen' })
        .expect(201)
      const otherToken = await login('other', 'salainen')

      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${blogsAtStart[0].id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('fails with status code 400 if id is invalid', async () => {
      await api
        .delete('/api/blogs/not-a-valid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('updating a blog', () => {
    test('succeeds in changing the number of likes', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send({ ...blogToUpdate, likes: blogToUpdate.likes + 10 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)

      const blogsAtEnd = await helper.blogsInDb()
      const updated = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
      assert.strictEqual(updated.likes, blogToUpdate.likes + 10)
      assert.strictEqual(updated.title, blogToUpdate.title)
    })

    test('fails with status code 404 if the blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api
        .put(`/api/blogs/${validNonexistingId}`)
        .send({ title: 'x', url: 'https://example.com', likes: 1 })
        .expect(404)
    })

    test('fails with status code 400 if id is invalid', async () => {
      await api
        .put('/api/blogs/not-a-valid-id')
        .send({ title: 'x', url: 'https://example.com', likes: 1 })
        .expect(400)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
