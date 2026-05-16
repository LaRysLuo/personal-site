import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Input, Button, Card, Divider, Icon } from 'animal-island-ui'
import { getAIConfig, saveAIConfig, clearAIConfig, buildSiteContext, searchWithAI, type ContentItem } from '../utils/aiSearch'
import { loadGameList, loadBlogList, loadGame, loadBlogPost } from '../utils/content'
import type { AIConfig } from '../types'

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState<AIConfig>({ apiKey: '', baseUrl: '', model: '' })
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      const existing = getAIConfig()
      if (existing) {
        setConfig(existing)
        setSaved(true)
      }
      setQuery('')
      setAnswer('')
      setShowSettings(false)
    }
  }, [open])

  const handleSearch = useCallback(async () => {
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
      const aiConfig = saved ? config : getAIConfig()!
      const response = await searchWithAI(query, context, aiConfig)
      setAnswer(response)
    } catch (err: any) {
      setAnswer(`❌ 搜索出错：${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [query, saved, config])

  const handleSaveConfig = () => {
    if (!config.apiKey || !config.baseUrl || !config.model) return
    saveAIConfig(config)
    setSaved(true)
    setShowSettings(false)
  }

  const handleClearConfig = () => {
    clearAIConfig()
    setConfig({ apiKey: '', baseUrl: '', model: '' })
    setSaved(false)
  }

  const highlightLinks = (text: string) => {
    const parts = text.split(/(#\/[^\s,)\]]+)/g)
    return parts.map((part, i) => {
      if (part.startsWith('#/')) {
        return (
          <span
            key={i}
            style={{ color: '#889df0', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            onClick={() => {
              const path = part.slice(1)
              navigate(path)
              onClose()
            }}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={560}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="icon-diy" size={22} />
          <span>AI 智能搜索</span>
        </div>
      }
      typewriter={false}
      footer={null}
    >
      <div style={{ padding: '4px 0' }}>
        {!saved ? (
          <Card color="app-yellow" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#725d42', marginBottom: 8 }}>
              ⚙️ 首次使用请先配置 AI 模型
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Input
                placeholder="API Key (如 sk-xxx)"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                size="large"
                status={config.apiKey ? undefined : 'warning'}
              />
              <Input
                placeholder="API 地址 (如 https://api.deepseek.com)"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                size="large"
                status={config.baseUrl ? undefined : 'warning'}
              />
              <Input
                placeholder="模型名称 (如 deepseek-chat)"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                size="large"
                status={config.model ? undefined : 'warning'}
              />
              <Button
                type="primary"
                block
                onClick={handleSaveConfig}
                disabled={!config.apiKey || !config.baseUrl || !config.model}
              >
                保存并开始搜索
              </Button>
              <div style={{ fontSize: 11, color: '#a0936e', textAlign: 'center', marginTop: 4 }}>
                💡 支持 OpenAI / DeepSeek / 国内各大模型 API
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <Input
                  autoFocus
                  placeholder="问关于我网站的任何问题..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  size="large"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) handleSearch()
                  }}
                />
              </div>
              <Button type="primary" onClick={handleSearch} loading={loading}>
                搜索
              </Button>
              <Button
                type="default"
                onClick={() => setShowSettings(!showSettings)}
              >
                设置
              </Button>
            </div>

            {showSettings && (
              <Card color="app-yellow" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input
                    placeholder="API Key"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    size="middle"
                  />
                  <Input
                    placeholder="API 地址"
                    value={config.baseUrl}
                    onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                    size="middle"
                  />
                  <Input
                    placeholder="模型名称"
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    size="middle"
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="primary" onClick={handleSaveConfig}>保存</Button>
                    <Button type="dashed" onClick={handleClearConfig}>清除配置</Button>
                  </div>
                </div>
              </Card>
            )}

            {loading && (
              <Card style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#a0936e' }}>
                  🔍 正在思考中...
                </div>
              </Card>
            )}

            {answer && !loading && (
              <Card color="app-blue" style={{ padding: 16 }}>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: '#fff' }}>
                  {highlightLinks(answer)}
                </div>
              </Card>
            )}

            <Divider type="line-brown" />
            <div style={{ fontSize: 11, color: '#a0936e', textAlign: 'center' }}>
              🤖 AI 基于网站全部内容作答，如有不准确请以实际页面为准
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
