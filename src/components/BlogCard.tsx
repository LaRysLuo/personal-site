import { Link } from 'react-router-dom'
import { Card, Divider } from 'animal-island-ui'
import type { BlogMeta } from '../types'

export default function BlogCard({ post }: { post: BlogMeta }) {
  const dateStr = new Date(post.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        color={post.cover ? 'app-blue' : 'default'}
        style={{
          padding: 20,
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          height: '100%',
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'inherit', opacity: 0.7 }}>{dateStr}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'inherit', marginBottom: 4 }}>
          {post.title}
        </div>
        <Divider type="line-brown" />
        {post.summary && (
          <p style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: 'inherit',
            opacity: 0.8,
            marginTop: 8,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {post.summary}
          </p>
        )}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.35)',
                color: 'inherit',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>
    </Link>
  )
}
