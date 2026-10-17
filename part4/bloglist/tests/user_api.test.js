const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  describe('creating users', () => {
    test('succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.passwordHash, undefined)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      assert(usernames.includes(newUser.username))
    })

    test('stores a hash, not the clear text password', async () => {
      await api
        .post('/api/users')
        .send({ username: 'hashed', name: 'Hash Test', password: 'salainen' })
        .expect(201)

      const user = await User.findOne({ username: 'hashed' })
      assert.notStrictEqual(user.passwordHash, 'salainen')
      assert(await bcrypt.compare('salainen', user.passwordHash))
    })

    test('fails with status code 400 if username is already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const result = await api
        .post('/api/users')
        .send({ username: 'root', name: 'Superuser', password: 'salainen' })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      assert(result.body.error.includes('expected `username` to be unique'))

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('fails with status code 400 if username is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const result = await api
        .post('/api/users')
        .send({ name: 'No Username', password: 'salainen' })
        .expect(400)

      assert(result.body.error)
      assert.strictEqual((await helper.usersInDb()).length, usersAtStart.length)
    })

    test('fails with status code 400 if password is missing', async () => {
      const usersAtStart = await helper.usersInDb()

      const result = await api
        .post('/api/users')
        .send({ username: 'nopassword', name: 'No Password' })
        .expect(400)

      assert(result.body.error)
      assert.strictEqual((await helper.usersInDb()).length, usersAtStart.length)
    })

    test('fails with status code 400 if username is shorter than 3 characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const result = await api
        .post('/api/users')
        .send({ username: 'ab', name: 'Short Name', password: 'salainen' })
        .expect(400)

      assert(result.body.error.includes('at least 3 characters'))
      assert.strictEqual((await helper.usersInDb()).length, usersAtStart.length)
    })

    test('fails with status code 400 if password is shorter than 3 characters', async () => {
      const usersAtStart = await helper.usersInDb()

      const result = await api
        .post('/api/users')
        .send({ username: 'shortpass', name: 'Short Pass', password: 'pw' })
        .expect(400)

      assert(result.body.error.includes('at least 3 characters'))
      assert.strictEqual((await helper.usersInDb()).length, usersAtStart.length)
    })
  })

  describe('listing users', () => {
    test('returns the users without password hashes', async () => {
      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.length, 1)
      assert.strictEqual(response.body[0].username, 'root')
      assert.strictEqual(response.body[0].passwordHash, undefined)
      assert.deepStrictEqual(response.body[0].blogs, [])
    })
  })

  describe('logging in', () => {
    test('succeeds with the right credentials and returns a token', async () => {
      const response = await api
        .post('/api/login')
        .send({ username: 'root', password: 'sekret' })
        .expect(200)

      assert.ok(response.body.token)
      assert.strictEqual(response.body.username, 'root')
    })

    test('fails with status code 401 with a wrong password', async () => {
      const response = await api
        .post('/api/login')
        .send({ username: 'root', password: 'wrong' })
        .expect(401)

      assert.strictEqual(response.body.error, 'invalid username or password')
    })

    test('fails with status code 401 with an unknown username', async () => {
      await api
        .post('/api/login')
        .send({ username: 'nobody', password: 'sekret' })
        .expect(401)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
