import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  test('calls the event handler with the right details when a blog is created', async () => {
    const user = userEvent.setup()
    const createBlog = vi.fn()

    render(<BlogForm createBlog={createBlog} />)

    await user.type(screen.getByLabelText('title'), 'Testing a form')
    await user.type(screen.getByLabelText('author'), 'Test Author')
    await user.type(screen.getByLabelText('url'), 'https://example.com/form')
    await user.click(screen.getByText('create'))

    expect(createBlog.mock.calls).toHaveLength(1)
    expect(createBlog.mock.calls[0][0]).toEqual({
      title: 'Testing a form',
      author: 'Test Author',
      url: 'https://example.com/form',
    })
  })

  test('clears the fields after the blog has been created', async () => {
    const user = userEvent.setup()
    const createBlog = vi.fn().mockResolvedValue(true)

    render(<BlogForm createBlog={createBlog} />)

    const titleInput = screen.getByLabelText('title')
    await user.type(titleInput, 'Testing a form')
    await user.click(screen.getByText('create'))

    expect(titleInput).toHaveValue('')
  })
})
