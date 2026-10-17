const loginWith = async (page, username, password) => {
  await page.getByRole('link', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('link', { name: 'create new' }).click()
  await page.getByLabel('title').fill(title)
  await page.getByLabel('author').fill(author)
  await page.getByLabel('url').fill(url)
  await page.getByRole('button', { name: 'create' }).click()

  // after creating a blog the app shows the list of blogs: wait until the new blog is in it
  await page.getByRole('link', { name: title }).waitFor()
}

const openBlog = async (page, title) => {
  await page.getByRole('link', { name: title }).click()
  await page.getByRole('heading', { name: title }).waitFor()
}

module.exports = { loginWith, createBlog, openBlog }
