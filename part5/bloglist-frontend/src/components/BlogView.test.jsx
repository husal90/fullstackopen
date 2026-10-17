import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogView from './BlogView'

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

const creator = { username: 'mluukkai', name: 'Matti Luukkainen', token: 'token' }
const otherUser = { username: 'hellas', name: 'Arto Hellas', token: 'token' }

describe('<BlogView />', () => {
  describe('when the user is not logged in', () => {
    beforeEach(() => {
      render(<BlogView blog={blog} user={null} />)
    })

    test('shows the blog information and the number of likes', () => {
      expect(screen.getByText(/The Joel Test: 12 Steps to Better Code/)).toBeDefined()
      expect(screen.getByText(/Joel Spolsky/)).toBeDefined()
      expect(screen.getByText(blog.url)).toBeDefined()
      expect(screen.getByText('likes 7')).toBeDefined()
      expect(screen.getByText('added by Matti Luukkainen')).toBeDefined()
    })

    test('shows no buttons', () => {
      expect(screen.queryAllByRole('button')).toHaveLength(0)
    })
  })

  describe('when the user is logged in but is not the creator of the blog', () => {
    beforeEach(() => {
      render(<BlogView blog={blog} user={otherUser} />)
    })

    test('shows the like button', () => {
      expect(screen.getByRole('button', { name: 'like' })).toBeDefined()
    })

    test('does not show the delete button', () => {
      expect(screen.queryByRole('button', { name: 'remove' })).toBeNull()
      expect(screen.getAllByRole('button')).toHaveLength(1)
    })
  })

  describe('when the user is the creator of the blog', () => {
    test('shows both the like and the delete button', () => {
      render(<BlogView blog={blog} user={creator} />)

      expect(screen.getByRole('button', { name: 'like' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'remove' })).toBeDefined()
    })

    test('calls the like handler once for every click of the like button', async () => {
      const user = userEvent.setup()
      const likeBlog = vi.fn()
      render(<BlogView blog={blog} user={creator} likeBlog={likeBlog} />)

      const likeButton = screen.getByRole('button', { name: 'like' })
      await user.click(likeButton)
      await user.click(likeButton)

      expect(likeBlog.mock.calls).toHaveLength(2)
    })

    test('calls the remove handler with the blog when remove is clicked', async () => {
      const user = userEvent.setup()
      const removeBlog = vi.fn()
      render(<BlogView blog={blog} user={creator} removeBlog={removeBlog} />)

      await user.click(screen.getByRole('button', { name: 'remove' }))

      expect(removeBlog.mock.calls).toHaveLength(1)
      expect(removeBlog.mock.calls[0][0]).toBe(blog)
    })
  })

  test('renders nothing while the blog has not been loaded', () => {
    const { container } = render(<BlogView blog={undefined} user={creator} />)

    expect(container).toBeEmptyDOMElement()
  })
})
