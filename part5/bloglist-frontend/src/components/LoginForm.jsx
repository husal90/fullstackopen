const LoginForm = ({
  handleSubmit,
  username,
  handleUsernameChange,
  password,
  handlePasswordChange,
}) => (
  <div>
    <h2>Log in to application</h2>
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  </div>
)

export default LoginForm
