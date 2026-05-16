import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button, Card, Divider, Icon, CodeBlock } from 'animal-island-ui'
import { loadBlogPost } from '../utils/content'
import type { BlogData } from '../types'
import { useIsMobile } from '../utils/responsive'
import { usePageView } from '../utils/usePageView'
import { PageViewCounter } from '../components/ViewCounter'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogData | null>(null)
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  usePageView(slug ? `/blog/${slug}` : undefined)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    loadBlogPost(slug)
      .then(setPost)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? 60 : 80, color: 'var(--text-muted)' }}>
        加载中...
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? 60 : 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 20 }}>这篇文章好像消失了...</p>
        <Link to="/blog">
          <Button type="primary">返回文章列表</Button>
        </Link>
      </div>
    )
  }

  const { meta, content } = post
  const dateStr = new Date(meta.date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <Link to="/blog" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
        <Button type="link">
          ← 返回文章列表
        </Button>
      </Link>

      <Card style={{ padding: isMobile ? 16 : 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="icon-chat" size={20} />
          <span style={{ fontSize: 13, color: '#a0936e' }}>{dateStr}</span>
        </div>
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: '#725d42', margin: '0 0 8px' }}>
          {meta.title}
        </h1>
        {meta.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {meta.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 8,
                background: 'rgba(183,198,229,0.3)',
                color: 'var(--text-primary)',
              }}>
                #{tag}
              </span>
            ))}
            <PageViewCounter pageKey={`/blog/${slug}`} />
          </div>
        )}
      </Card>

      <Divider type="wave-yellow" />

      <div className="markdown-content" style={{ marginTop: 20 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const isBlock = className?.startsWith('language-')
              if (isBlock) {
                return (
                  <CodeBlock
                    code={String(children).replace(/\n$/, '')}
                  />
                )
              }
              return <code className={className} {...props}>{children}</code>
            },
            pre({ children }) {
              return <>{children}</>
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
        <PageViewCounter pageKey={`/blog/${slug}`} />
      </div>
    </div>
  )
}
