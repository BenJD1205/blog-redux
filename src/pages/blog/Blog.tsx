import CreatePost from './components/createPost'
import PostList from './components/postList'

export default function Blog() {
  return (
    <div className='p-5'>
      <CreatePost />
      <PostList />
    </div>
  )
}
