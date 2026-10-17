import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Togglable from './Togglable'

describe('<Togglable />', () => {
  beforeEach(() => {
    render(
      <Togglable buttonLabel="show...">
        <div>togglable content</div>
      </Togglable>
    )
  })

  test('renders its children', () => {
    screen.getByText('togglable content')
  })

  test('at start the children are not displayed', () => {
    const element = screen.getByText('togglable content')
    expect(element).not.toBeVisible()
  })

  test('after clicking the button, children are displayed', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByText('show...'))

    expect(screen.getByText('togglable content')).toBeVisible()
  })

  test('toggled content can be closed', async () => {
    const user = userEvent.setup()
    await user.click(screen.getByText('show...'))
    await user.click(screen.getByText('cancel'))

    expect(screen.getByText('togglable content')).not.toBeVisible()
  })
})
