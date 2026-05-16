import { useState, useEffect } from 'react'
import { Icon, Input } from 'animal-island-ui'
import BlogCard from '../components/BlogCard'
import { loadBlogList } from '../utils/content'
import type { BlogMeta } from '../types'
import { useIsMobile } from '../utils/responsive'

export default function Blog() {
  const [posts, setPosts] = useState<BlogMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const isMobile = useIsMobile()

  useEffect(() => {
    loadBlogList()
      .then(setPosts)
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? posts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : posts

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Icon name="icon-chat" size={isMobile ? 24 : 28} bounce />
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: 'var(--text-primary)' }}>博文</h1>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
        一些随想、开发日志和生活记录
      </p>

      <div style={{ marginBottom: 20, maxWidth: isMobile ? '100%' : 400 }}>
        <Input
          placeholder="搜索文章标题或标签..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          加载中...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          {search ? '没有找到匹配的文章' : '还没有文章，期待第一篇博文 ✨'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
