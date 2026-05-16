import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Card, Divider, Icon, Modal } from 'animal-island-ui'
import { getAIConfig, saveAIConfig, clearAIConfig, buildSiteContext, searchWithAI, type ContentItem } from '../utils/aiSearch'
import { loadGameList, loadBlogList, loadGame, loadBlogPost } from '../utils/content'
import type { AIConfig } from '../types'

const AUTH_KEY = 'animal-island-ai-auth'

function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true'
}

function setAuthed() {
  localStorage.setItem(AUTH_KEY, 'true')
}

export default function AISearch() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<AIConfig>({ apiKey: '', baseUrl: '', model: '' })
  const [saved, setSaved] = useState(false)
  const [editingConfig, setEditingConfig] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState(false)
  const [settingPassword, setSettingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const existing = getAIConfig()
    if (existing) {
      setConfig(existing)
      setSaved(true)
    }
  }, [])

  const loadAndSearch = async () => {
    if (!query.trim() || !saved) return
    setLoading(true)
    setAnswer('')

    try {
      const [gameList, blogList] = await Promise.all([loadGameList(), loadBlogList()])

      const items: ContentItem[] = []

      for (const g of gameList) {
        const full = await loadGame(g.slug)
        items.push({
          title: g.title,
          type: 'game',
          slug: g.slug,
          summary: g.summary,
          body: full?.content || '',
        })
      }

      for (const b of blogList) {
        const full = await loadBlogPost(b.slug)
        items.push({
          title: b.title,
          type: 'blog',
          slug: b.slug,
          summary: b.summary,
          body: full?.content || '',
        })
      }

      const context = buildSiteContext(items)
      const response = await searchWithAI(query, context, config)
      setAnswer(response)
    } catch (err: any) {
      setAnswer(`❌ 搜索出错：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConfig = () => {
    if (!config.apiKey || !config.baseUrl || !config.model) return
    saveAIConfig(config)
    setSaved(true)
    setEditingConfig(false)
  }

  const handleClearConfig = () => {
    clearAIConfig()
    setConfig({ apiKey: '', baseUrl: '', model: '' })
    setSaved(false)
  }

  const openSettings = () => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored === 'true') {
      setEditingConfig(true)
      return
    }
    setAuthOpen(true)
    setPassword('')
    setAuthError(false)
  }

  const handleAuth = () => {
    const storedPassword = localStorage.getItem('animal-island-ai-password')
    if (!storedPassword) {
      setSettingPassword(true)
      setNewPassword(password)
      setAuthError(false)
      return
    }
    if (password === storedPassword) {
      setAuthed()
      setAuthOpen(false)
      setEditingConfig(true)
    } else {
      setAuthError(true)
    }
  }

  const handleSetPassword = () => {
    if (!newPassword.trim()) return
    localStorage.setItem('animal-island-ai-password', newPassword)
    setAuthed()
    setAuthOpen(false)
    setSettingPassword(false)
    setEditingConfig(true)
  }

  const highlightLinks = (text: string) => {
    const parts = text.split(/(#\/[^\s,)\]]+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('#/')) {
        const path = part.slice(1)
        return (
          <span
            key={i}
            style={{ color: '#f0e68c', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            onClick={() => navigate(path)}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div>
      <Modal
        open={authOpen}
        onClose={() => { setAuthOpen(false); setSettingPassword(false) }}
        title={settingPassword ? '设置管理密码' : '管理员验证'}
        typewriter={false}
        footer={null}
      >
        {settingPassword ? (
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              首次配置，请设置一个管理密码。之后修改 AI 配置需要输入此密码。
            </p>
            <Input
              placeholder="输入新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="large"
              type="password"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSetPassword() }}
            />
            <div style={{ marginTop: 12 }}>
              <Button type="primary" block onClick={handleSetPassword} disabled={!newPassword.trim()}>
                确认设置
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              请输入管理密码以修改 AI 配置。
            </p>
            <Input
              placeholder="输入密码"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(false) }}
              size="large"
              type="password"
              status={authError ? 'error' : undefined}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAuth() }}
            />
            {authError && (
              <p style={{ fontSize: 12, color: '#fc736d', marginTop: 6 }}>密码错误，请重试</p>
            )}
            <div style={{ marginTop: 12 }}>
              <Button type="primary" block onClick={handleAuth} disabled={!password.trim()}>
                验证
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Icon name="icon-diy" size={28} bounce />
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)' }}>AI 智能搜索</h1>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
        用 AI 搜索网站的所有内容，快速找到你想要的游戏作品或文章
      </p>

      <Card style={{ padding: 24, marginBottom: 24, background: 'var(--bg-card)' }}>
        {!saved || editingConfig ? (
          <div>
            {editingConfig && (
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  修改 AI 配置
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
                  <Input
                    placeholder="API Key (如 sk-xxx)"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    size="large"
                  />
                  <Input
                    placeholder="API 地址 (如 https://api.deepseek.com)"
                    value={config.baseUrl}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    size="large"
                  />
                  <Input
                    placeholder="模型名称 (如 deepseek-chat)"
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    size="large"
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Button
                      type="primary"
                      onClick={handleSaveConfig}
                      disabled={!config.apiKey || !config.baseUrl || !config.model}
                    >
                      保存修改
                    </Button>
                    <Button type="default" onClick={() => setEditingConfig(false)}>
                      取消
                    </Button>
                    <Button type="dashed" onClick={handleClearConfig}>
                      清除配置
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!editingConfig && (
              <div style={{ textAlign: 'center', padding: 12 }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                  AI 搜索功能需要先配置 API 信息后才能使用
                </p>
                <Button type="primary" onClick={openSettings}>
                  管理员配置
                </Button>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
                  💡 支持 OpenAI / DeepSeek 等兼容接口，仅管理员可配置
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <Input
                  autoFocus
                  placeholder="问关于我网站的任何问题..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size="large"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) loadAndSearch()
                  }}
                />
              </div>
              <Button type="primary" onClick={loadAndSearch} loading={loading}>
                搜索
              </Button>
              <Button type="default" onClick={openSettings}>
                设置
              </Button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>试试问：</span>
              {['我的网站有哪些内容？', '有哪些游戏作品？', '最近的博文有哪些？'].map((q) => (
                <span
                  key={q}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 12,
                    background: 'rgba(183,198,229,0.2)',
                    color: '#889df0',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(183,198,229,0.4)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(183,198,229,0.2)'}
                  onClick={() => setQuery(q)}
                >
                  {q}
                </span>
              ))}
            </div>

            {loading && (
              <Card style={{ padding: 24, textAlign: 'center', background: 'var(--bg-card)' }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
                  🔍 AI 正在搜索网站内容...
                </div>
              </Card>
            )}

            {answer && !loading && (
              <Card color="app-blue" style={{ padding: 20, marginTop: 12, background: 'var(--bg-card)' }}>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: '#fff', whiteSpace: 'pre-wrap' }}>
                  {highlightLinks(answer)}
                </div>
              </Card>
            )}
          </div>
        )}
      </Card>

      <Divider type="line-brown" />

      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <p>💡 <strong>使用说明</strong></p>
        <ul style={{ paddingLeft: 20, marginTop: 4 }}>
          <li>AI 配置仅管理员可修改，需通过密码验证</li>
          <li>API Key 仅保存在你的浏览器本地，不会上传到任何服务器</li>
          <li>搜索时 AI 会分析网站所有游戏作品和文章内容，智能回答你的问题</li>
          <li>回答中的链接可以直接点击跳转</li>
        </ul>
      </div>
    </div>
  )
}
