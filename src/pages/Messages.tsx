import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Card, Divider, Icon } from 'animal-island-ui'
import { loadMessages, postMessage, fetchGitHubUser, type Message, type GitHubUser } from '../utils/messageAPI'
import { useIsMobile } from '../utils/responsive'
import { usePageView } from '../utils/usePageView'

const GRADIENTS = [
  ['#b7c6e5', '#889df0'],
  ['#f5b7b1', '#e74c3c'],
  ['#a8e6cf', '#27ae60'],
  ['#fce4b3', '#f39c12'],
  ['#c9b8e8', '#8e44ad'],
  ['#b2dfdb', '#00897b'],
  ['#ffe0b2', '#e65100'],
  ['#d1c4e9', '#5e35b1'],
  ['#c8e6c9', '#2e7d32'],
  ['#b3e5fc', '#0277bd'],
  ['#f8bbd0', '#c2185b'],
  ['#bcaaa4', '#5d4037'],
  ['#c5cae9', '#283593'],
  ['#b2ebf2', '#00838f'],
  ['#f0f4c3', '#9e9d24'],
  ['#d7ccc8', '#4e342e'],
]

function hash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  if (h < 24) return `${h} 小时前`
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [user, setUser] = useState<GitHubUser | null>(null)
  const [loginInput, setLoginInput] = useState('')
  const [loginChecking, setLoginChecking] = useState(false)

  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isMobile = useIsMobile()
  usePageView('/messages')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await loadMessages()
      setMessages(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleLogin = async () => {
    const input = loginInput.trim()
    if (!input) return
    setLoginChecking(true)
    setError('')
    try {
      const u = await fetchGitHubUser(input)
      setUser(u)
      setLoginInput('')
    } catch {
      setError('GitHub 用户不存在')
    } finally {
      setLoginChecking(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) { setError('请先登录'); return }
    if (!content.trim()) { setError('请填写留言内容'); return }
    if (content.trim().length > 2000) { setError('留言不能超过 2000 字'); return }

    setSubmitting(true)
    setError('')
    try {
      const msg = await postMessage({
        name: user.name || user.login,
        github: user.login,
        avatar: user.avatar_url,
        content: content.trim(),
        website: website.trim() || undefined,
      })
      setMessages([msg, ...messages])
      setContent('')
      setWebsite('')
      setSuccess('留言发布成功 ✨')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const g = user ? GRADIENTS[hash(user.login) % GRADIENTS.length] : GRADIENTS[0]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Icon name="icon-chat" size={isMobile ? 24 : 28} bounce />
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: 'var(--text-primary)' }}>留言板</h1>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
        留下你想说的话吧～ 对游戏、博文、或者本网站的任何想法都欢迎 ✨
      </p>

      <Card style={{
        padding: isMobile ? 16 : 24,
        marginBottom: 24,
        background: 'var(--bg-card)',
        borderRadius: 16,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {!user ? (
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <Input
                placeholder="输入 GitHub 用户名"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                size="large"
                style={{ flex: 1, minWidth: 200 }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button
                type="primary"
                onClick={handleLogin}
                loading={loginChecking}
                disabled={!loginInput.trim()}
              >
                登录
              </Button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
            }}>
              <img
                src={user.avatar_url}
                alt={user.login}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '2px solid var(--border-color)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.name || user.login}
                </div>
                <a href={user.html_url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
                  @{user.login}
                </a>
              </div>
              <button onClick={() => setUser(null)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: 12, cursor: 'pointer', padding: '4px 8px',
                  borderRadius: 6,
                }}>
                切换
              </button>
            </div>
          )}

          {user && (
            <>
              <Input
                placeholder="网站（可选）"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                size="large"
              />
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <textarea
                  placeholder="写下你想说的话..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                  style={{
                    width: '100%',
                    minHeight: 110,
                    padding: 14,
                    border: 'none',
                    background: 'transparent',
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
                  padding: '8px 14px',
                  borderTop: '1px solid var(--border-color)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {content.length}/2000
                  </span>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={!content.trim() || submitting}
                  >
                    发布留言
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div style={{
            fontSize: 13, color: '#fc736d', padding: '8px 12px',
            background: 'rgba(252,115,109,0.1)', borderRadius: 8, marginTop: 12,
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            fontSize: 13, color: '#8ac68a', padding: '8px 12px',
            background: 'rgba(138,198,138,0.1)', borderRadius: 8, marginTop: 12,
          }}>
            {success}
          </div>
        )}
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
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            加载留言中...
          </div>
        ) : messages.length === 0 ? (
          <Card style={{
            padding: 40, textAlign: 'center', background: 'var(--bg-card)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>📝</div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              还没有留言，来当第一个留言的人吧！
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg) => {
              const g2 = GRADIENTS[hash(msg.github || msg.name) % GRADIENTS.length]
              return (
                <Card key={msg.id} style={{
                  padding: isMobile ? 14 : 16,
                  background: 'var(--bg-card)',
                  borderRadius: 16,
                }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {msg.avatar ? (
                      <img src={msg.avatar} alt={msg.name}
                        style={{
                          width: 38, height: 38, borderRadius: '50%',
                          border: '2px solid var(--border-color)', flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${g2[0]}, ${g2[1]})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 15, fontWeight: 700, flexShrink: 0,
                      }}>
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                      }}>
                        <a href={`https://github.com/${msg.github}`} target="_blank" rel="noopener noreferrer"
                          style={{
                            fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                            textDecoration: 'none',
                          }}>
                          {msg.name}
                        </a>
                        {msg.website && (
                          <a href={msg.website} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: '#889df0', textDecoration: 'none' }}>
                            🌐
                          </a>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {fmtDate(msg.createdAt)}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 14, lineHeight: 1.7, color: 'var(--markdown-text)',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 6,
                      }}>
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
