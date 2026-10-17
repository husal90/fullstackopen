import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const blog = {
  id: '5a43fde2cbd20b12a2c34e91',
  title: 'The Joel Test: 12 Steps to Better Code',
  author: 'Joel Spolsky',
  url: 'https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/',
  likes: 7,
  user: {
    id: '5a43e6b6c37f3d065eaaa581',
    username: 'mluukkai',
    name: 'Matti Luukkainen',
  },
}

describe('<Blog />', () => {
  test('by default renders the title and author but not the url or likes', () => {
    render(<Blog blog={blog} />)

    expect(screen.getByText(/The Joel Test: 12 Steps to Better Code/)).toBeDefined()
    expect(screen.getByText(/Joel Spolsky/)).toBeDefined()

    expect(screen.queryByText(blog.url)).toBeNull()
    expect(screen.queryByText(/likes/)).toBeNull()
  })

  test('shows the url and likes after the view button has been clicked', async () => {
    const user = userEvent.setup()
    render(<Blog blog={blog} />)

    await user.click(screen.getByText('view'))

    expect(screen.getByText(blog.url)).toBeDefined()
    expect(screen.getByText(/likes 7/)).toBeDefined()
    expect(screen.getByText('Matti Luukkainen')).toBeDefined()
  })

  test('hides the details again when the hide button is clicked', async () => {
    const user = userEvent.setup()
    render(<Blog blog={blog} />)

    await user.click(screen.getByText('view'))
    await user.click(screen.getByText('hide'))

    expect(screen.queryByText(blog.url)).toBeNull()
  })

  test('calls the like handler twice when the like button is clicked twice', async () => {
    const user = userEvent.setup()
    const likeBlog = vi.fn()
    render(<Blog blog={blog} likeBlog={likeBlog} />)

    await user.click(screen.getByText('view'))

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(likeBlog.mock.calls).toHaveLength(2)
  })

  test('shows the remove button only when the user is allowed to remove', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Blog blog={blog} canRemove={false} />)

    await user.click(screen.getByText('view'))
    expect(screen.queryByText('remove')).toBeNull()

    rerender(<Blog blog={blog} canRemove={true} />)
    expect(screen.getByText('remove')).toBeDefined()
  })
})
