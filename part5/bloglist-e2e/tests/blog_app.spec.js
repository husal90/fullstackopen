const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, openBlog } = require('./helper')

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

const blog = {
  title: 'A blog by playwright',
  author: 'Ann Author',
  url: 'https://example.com/playwright',
}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', { data: testUser })
    await request.post('/api/users', { data: otherUser })

    await page.goto('/')
  })

  test('the list of blogs is shown at the root', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with the correct username and password', async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)

      await expect(page.getByText(`${testUser.name} logged in`)).toBeVisible()
      // after logging in the user is directed to the list of blogs
      await expect(page).toHaveURL('/')
      await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    test('fails with a wrong password', async ({ page }) => {
      await loginWith(page, testUser.username, 'wrong')

      await expect(page.getByRole('alert')).toContainText('wrong username or password')
      await expect(page.getByText(`${testUser.name} logged in`)).not.toBeVisible()
    })

    test('logging out directs the user to the list of blogs', async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)
      await page.getByRole('button', { name: 'logout' }).click()

      await expect(page).toHaveURL('/')
      await expect(page.getByRole('link', { name: 'login' })).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, testUser.username, testUser.password)
      await expect(page.getByText(`${testUser.name} logged in`)).toBeVisible()
    })

    test('a blog can be created', async ({ page }) => {
      await createBlog(page, blog)

      await expect(page).toHaveURL('/')
      await expect(page.getByRole('link', { name: blog.title })).toBeVisible()
      await expect(page.getByRole('alert')).toContainText(
        `a new blog ${blog.title} by ${blog.author} added`
      )
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, blog)
      })

      test('the blog can be opened and liked', async ({ page }) => {
        await openBlog(page, blog.title)

        await expect(page.getByText(blog.url)).toBeVisible()
        await expect(page.getByText('likes 0')).toBeVisible()
        await expect(page.getByText(`added by ${testUser.name}`)).toBeVisible()

        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 1')).toBeVisible()
        await page.getByRole('button', { name: 'like' }).click()
        await expect(page.getByText('likes 2')).toBeVisible()
      })

      test('the blog can be deleted by the user who added it', async ({ page }) => {
        page.once('dialog', async dialog => {
          expect(dialog.message()).toContain(blog.title)
          await dialog.accept()
        })

        await openBlog(page, blog.title)
        await page.getByRole('button', { name: 'remove' }).click()

        // after deleting the user is directed to the list of blogs
        await expect(page).toHaveURL('/')
        await expect(page.getByRole('link', { name: blog.title })).toHaveCount(0)
      })

      test('a blog view is kept when the page is reloaded', async ({ page }) => {
        await openBlog(page, blog.title)
        await page.reload()

        await expect(page.getByRole('heading', { name: blog.title })).toBeVisible()
        await expect(page.getByRole('button', { name: 'remove' })).toBeVisible()
      })

      test('another user can like the blog but cannot delete it', async ({ page }) => {
        await page.getByRole('button', { name: 'logout' }).click()
        await loginWith(page, otherUser.username, otherUser.password)
        await expect(page.getByText(`${otherUser.name} logged in`)).toBeVisible()

        await openBlog(page, blog.title)

        await expect(page.getByRole('button', { name: 'like' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'remove' })).toHaveCount(0)
      })

      test('a user who has not logged in cannot like the blog', async ({ page }) => {
        await page.getByRole('button', { name: 'logout' }).click()

        await openBlog(page, blog.title)

        await expect(page.getByText('likes 0')).toBeVisible()
        await expect(page.getByRole('button', { name: 'like' })).toHaveCount(0)
        await expect(page.getByRole('button', { name: 'remove' })).toHaveCount(0)
      })
    })
  })
})
