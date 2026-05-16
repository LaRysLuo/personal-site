import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Card, Divider, Icon } from 'animal-island-ui'
import { fetchMessages, postMessage, type Message } from '../utils/messageAPI'
import { useIsMobile } from '../utils/responsive'
import { usePageView } from '../utils/usePageView'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`

  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isMobile = useIsMobile()

  usePageView('/messages')

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchMessages()
      setMessages(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!name.trim()) { setError('请填写昵称'); return }
    if (!content.trim()) { setError('请填写留言内容'); return }
    if (content.trim().length > 2000) { setError('留言内容不能超过 2000 个字符'); return }

    setSubmitting(true)
    try {
      const msg = await postMessage({
        name: name.trim(),
        content: content.trim(),
        website: website.trim() || undefined,
      })
      setMessages([msg, ...messages])
      setContent('')
      setWebsite('')
      setSuccess('留言发布成功！')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Icon name="icon-chat" size={isMobile ? 24 : 28} bounce />
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: 'var(--text-primary)' }}>留言板</h1>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
        留下你想说的话吧～ 对游戏、博文、或者本网站的任何想法都欢迎 ✨
      </p>

      <Card style={{ padding: isMobile ? 16 : 24, marginBottom: 24, background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            placeholder="你的昵称 *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="large"
            maxLength={50}
          />
          <Input
            placeholder="网站（可选）"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            size="large"
          />
          <textarea
            placeholder="写下你想说的话... *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            style={{
              width: '100%',
              minHeight: 100,
              padding: 12,
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {content.length}/2000
            </span>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!name.trim() || !content.trim() || submitting}
            >
              发布留言
            </Button>
          </div>
          {error && (
            <div style={{ fontSize: 13, color: '#fc736d', padding: '8px 12px', background: 'rgba(252,115,109,0.1)', borderRadius: 8 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ fontSize: 13, color: '#8ac68a', padding: '8px 12px', background: 'rgba(138,198,138,0.1)', borderRadius: 8 }}>
              {success}
            </div>
          )}
        </div>
      </Card>

      <Divider type="line-brown" />

      <div style={{ marginTop: 24 }}>
        <div style={{
          fontSize: isMobile ? 15 : 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>💬 全部留言</span>
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>
            {messages.length} 条
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            加载留言中...
          </div>
        ) : messages.length === 0 ? (
          <Card style={{ padding: 32, textAlign: 'center', background: 'var(--bg-card)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              还没有留言，来当第一个留言的人吧！
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg) => (
              <Card key={msg.id} style={{
                padding: isMobile ? 14 : 18,
                background: 'var(--bg-card)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                  flexWrap: 'wrap',
                  gap: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #b7c6e5, #889df0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {msg.website ? (
                          <a
                            href={msg.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'underline' }}
                          >
                            {msg.name}
                          </a>
                        ) : (
                          msg.name
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatDate(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: 'var(--markdown-text)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
