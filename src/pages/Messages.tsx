import { useState, useEffect, useCallback } from 'react'
import { Button, Input, Card, Divider, Icon } from 'animal-island-ui'
import { loadMessages, postMessage, fetchGitHubUser, type Message, type GitHubUser } from '../utils/messageStore'
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
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isMobile = useIsMobile()

  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null)
  const [githubInput, setGithubInput] = useState('')
  const [githubChecking, setGithubChecking] = useState(false)

  usePageView('/messages')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await loadMessages()
      setMessages(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCheckGithub = async () => {
    const username = githubInput.trim()
    if (!username) return
    setGithubChecking(true)
    setError('')
    try {
      const user = await fetchGitHubUser(username)
      setGithubUser(user)
      setGithubInput('')
    } catch {
      setError('GitHub 用户不存在，请检查用户名')
    } finally {
      setGithubChecking(false)
    }
  }

  const handleLogout = () => {
    setGithubUser(null)
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!githubUser) { setError('请先登录 GitHub'); return }
    if (!content.trim()) { setError('请填写留言内容'); return }
    if (content.trim().length > 2000) { setError('留言内容不能超过 2000 个字符'); return }

    setSubmitting(true)
    try {
      const msg = await postMessage({
        name: githubUser.name || githubUser.login,
        github: githubUser.login,
        avatar: githubUser.avatar_url,
        content: content.trim(),
        website: website.trim() || undefined,
      })
      setMessages([msg, ...messages])
      setContent('')
      setWebsite('')
      setSuccess('留言发布成功！已保存到仓库 📦')
      setTimeout(() => setSuccess(''), 4000)
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

          {!githubUser ? (
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              <Input
                placeholder="输入 GitHub 用户名以登录"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                size="large"
                style={{ flex: 1, minWidth: 200 }}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckGithub()}
              />
              <Button
                type="primary"
                onClick={handleCheckGithub}
                loading={githubChecking}
                disabled={!githubInput.trim() || githubChecking}
              >
                登录
              </Button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
            }}>
              <img
                src={githubUser.avatar_url}
                alt={githubUser.login}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '2px solid var(--border-color)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {githubUser.name || githubUser.login}
                </div>
                <a
                  href={githubUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
                >
                  @{githubUser.login}
                </a>
              </div>
              <Button type="link" onClick={handleLogout} style={{ fontSize: 12, padding: 0 }}>
                切换账号
              </Button>
            </div>
          )}

          {githubUser && (
            <>
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
                  disabled={!content.trim() || submitting}
                >
                  发布留言
                </Button>
              </div>
            </>
          )}

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {msg.avatar ? (
                      <img
                        src={msg.avatar}
                        alt={msg.name}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          border: '2px solid var(--border-color)',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #b7c6e5, #889df0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {msg.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {msg.github ? (
                          <a
                            href={`https://github.com/${msg.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            {msg.name}
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.4 }}>
                              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                          </a>
                        ) : (
                          msg.name
                        )}
                        {msg.website && msg.website !== `https://github.com/${msg.github}` && (
                          <a href={msg.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#889df0', textDecoration: 'none' }}>
                            🌐
                          </a>
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
