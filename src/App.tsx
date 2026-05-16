import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Games from './pages/Games'
import GameDetail from './pages/GameDetail'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Friends from './pages/Friends'
import AISearch from './pages/AISearch'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:slug" element={<GameDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/ai-search" element={<AISearch />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
