import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material'

const BlogList = ({ blogs }) => (
  <div>
    <Typography variant="h4" component="h2" sx={{ marginTop: 3, marginBottom: 2 }}>
      blogs
    </Typography>

    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>title</TableCell>
            <TableCell>author</TableCell>
            <TableCell>likes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {blogs.map(blog => (
            <TableRow key={blog.id}>
              <TableCell>
                <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
              </TableCell>
              <TableCell>{blog.author}</TableCell>
              <TableCell>{blog.likes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </div>
)

export default BlogList
