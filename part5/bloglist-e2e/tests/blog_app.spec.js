const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, blogLocator, likeBlog } = require('./helper')

const testUser = {
  name: 'Matti Luukkainen',
  username: 'mluukkai',
  password: 'salainen',
}

const otherUser = {
  name: 'Arto Hellas',
  username: 'hellas',
  password: 'secret',
}

const blogs = {
  first: {
    title: 'First blog by playwright',
    author: 'Ann Author',
    url: 'https://example.com/first',
  },
  second: {
    title: 'Second blog by playwright',
    author: 'Bob Writer',
    url: 'https://example.com/second',
  },
  third: {
    title: 'Third blog by playwright',
    author: 'Cid Poster',
    url: 'https://example.com/third',
  },
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', { data: testUser })
    await request.post('/api/users', { data: otherUser })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
    await expect(page.getByLabel('username')).toBeVisible()
    await expect(page.getByLabel('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)

      await expect(page.getByText(`${testUser.name} logged in`)).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, testUser.username, 'wrong')

      const errorDiv = page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText(`${testUser.name} logged in`)).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)
      await expect(page.getByText(`${testUser.name} logged in`)).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, blogs.first)

      await expect(blogLocator(page, blogs.first.title)).toBeVisible()
      await expect(page.locator('.success')).toContainText(
        `a new blog ${blogs.first.title} by ${blogs.first.author} added`
      )
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, blogs.first)
      })

      test('it can be liked', async ({ page }) => {
        const blog = blogLocator(page, blogs.first.title)

        await blog.getByRole('button', { name: 'view' }).click()
        await expect(blog.getByText('likes 0')).toBeVisible()

        await blog.getByRole('button', { name: 'like' }).click()
        await expect(blog.getByText('likes 1')).toBeVisible()
      })

      test('the user who added it can delete it', async ({ page }) => {
        page.once('dialog', async dialog => {
          expect(dialog.message()).toContain(blogs.first.title)
          await dialog.accept()
        })

        const blog = blogLocator(page, blogs.first.title)
        await blog.getByRole('button', { name: 'view' }).click()
        await blog.getByRole('button', { name: 'remove' }).click()

        await expect(blogLocator(page, blogs.first.title)).toHaveCount(0)

        // and it stays deleted after a reload
        await page.reload()
        await expect(blogLocator(page, blogs.first.title)).toHaveCount(0)
      })

      test('a user who did not add it does not see the delete button', async ({ page }) => {
        // the creator sees the button
        const blog = blogLocator(page, blogs.first.title)
        await blog.getByRole('button', { name: 'view' }).click()
        await expect(blog.getByRole('button', { name: 'remove' })).toBeVisible()

        // another user does not
        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, otherUser.username, otherUser.password)
        await expect(page.getByText(`${otherUser.name} logged in`)).toBeVisible()

        const sameBlog = blogLocator(page, blogs.first.title)
        await sameBlog.getByRole('button', { name: 'view' }).click()
        await expect(sameBlog.getByText(blogs.first.url)).toBeVisible()
        await expect(sameBlog.getByRole('button', { name: 'remove' })).toHaveCount(0)
      })
    })

    describe('and several blogs exist', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, blogs.first)
        await createBlog(page, blogs.second)
        await createBlog(page, blogs.third)
      })

      test('they are ordered by likes, most liked first', async ({ page }) => {
        // likes: first 1, second 3, third 2
        await likeBlog(page, blogs.first.title, 1)
        await likeBlog(page, blogs.second.title, 3)
        await likeBlog(page, blogs.third.title, 2)

        const titles = page.locator('.blog .blog-summary')
        await expect(titles).toHaveCount(3)
        await expect(titles.nth(0)).toContainText(blogs.second.title)
        await expect(titles.nth(1)).toContainText(blogs.third.title)
        await expect(titles.nth(2)).toContainText(blogs.first.title)

        // the order is also kept after a reload
        await page.reload()
        await expect(titles.nth(0)).toContainText(blogs.second.title)
        await expect(titles.nth(2)).toContainText(blogs.first.title)
      })
    })
  })
})
