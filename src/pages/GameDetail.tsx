import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button, Card, Divider, Icon, CodeBlock } from 'animal-island-ui'
import { loadGame } from '../utils/content'
import type { GameData } from '../types'
import { useIsMobile } from '../utils/responsive'
import { usePageView } from '../utils/usePageView'
import { PageViewCounter } from '../components/ViewCounter'

const statusLabels: Record<string, string> = {
  released: '已发布',
  developing: '开发中',
  prototype: '原型阶段',
}

const statusColors: Record<string, string> = {
  released: '#8ac68a',
  developing: '#f7cd67',
  prototype: '#b77dee',
}

export default function GameDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [game, setGame] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

  usePageView(slug ? `/games/${slug}` : undefined)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    loadGame(slug)
      .then(setGame)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? 60 : 80, color: 'var(--text-muted)' }}>
        加载中...
      </div>
    )
  }

  if (!game) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? 60 : 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏝️</div>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 20 }}>这个作品还没有被发现...</p>
        <Link to="/games">
          <Button type="primary">返回作品列表</Button>
        </Link>
      </div>
    )
  }

  const { meta, content } = game

  return (
    <div>
      {meta.cover ? (
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: isMobile ? 340 : 480,
          margin: isMobile ? '-20px -16px 24px' : '-32px -40px 24px',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${meta.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.5) saturate(1.05)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 100%)',
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            padding: isMobile ? '40px 20px 24px' : '60px 40px 32px',
            minHeight: isMobile ? 340 : 480,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
            <Link to="/games" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16, alignSelf: 'flex-start' }}>
              <Button type="link">
                ← 返回作品列表
              </Button>
            </Link>
            <h1 style={{
              fontSize: isMobile ? 24 : 30,
              fontWeight: 900,
              color: '#fff',
              margin: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {meta.title}
            </h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 10,
                background: statusColors[meta.status] || '#8ac68a',
                color: '#fff',
                fontWeight: 600,
              }}>
                {statusLabels[meta.status] || meta.status}
              </span>
              {meta.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 10, lineHeight: 1.6, maxWidth: 600 }}>
              {meta.summary}
            </p>
          </div>
        </div>
      ) : (
        <div>
          <Link to="/games" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
            <Button type="link">
              ← 返回作品列表
            </Button>
          </Link>
          <Card
          color={meta.status === 'released' ? 'app-green' : meta.status === 'developing' ? 'app-yellow' : 'purple'}
          style={{ padding: isMobile ? 20 : 28, marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: 'inherit', margin: 0 }}>{meta.title}</h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 10,
                  background: statusColors[meta.status] || '#8ac68a',
                  color: '#fff',
                  fontWeight: 600,
                }}>
                  {statusLabels[meta.status] || meta.status}
                </span>
                {meta.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 12,
                    padding: '3px 10px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.3)',
                    color: 'inherit',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'inherit', opacity: 0.85, marginTop: 8, lineHeight: 1.6 }}>
                {meta.summary}
              </p>
            </div>
          </div>
        </Card>
        </div>
      )}

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
        <PageViewCounter pageKey={`/games/${slug}`} />
      </div>
    </div>
  )
}
