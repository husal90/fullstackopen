const loginWith = async (page, username, password) => {
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'create new blog' }).click()
  await page.getByLabel('title').fill(title)
  await page.getByLabel('author').fill(author)
  await page.getByLabel('url').fill(url)
  await page.getByRole('button', { name: 'create', exact: true }).click()

  // wait until the new blog is shown, so the next action starts from a settled page
  await blogLocator(page, title).waitFor()
}

const blogLocator = (page, title) => page.locator('.blog').filter({ hasText: title })

const likeBlog = async (page, title, times) => {
  const blog = blogLocator(page, title)

  if (await blog.getByRole('button', { name: 'view' }).count() > 0) {
    await blog.getByRole('button', { name: 'view' }).click()
  }

  for (let i = 1; i <= times; i++) {
    await blog.getByRole('button', { name: 'like' }).click()
    await blog.getByText(`likes ${i}`).waitFor()
  }
}

module.exports = { loginWith, createBlog, blogLocator, likeBlog }
