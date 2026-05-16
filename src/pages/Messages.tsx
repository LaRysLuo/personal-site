import { useEffect, useRef } from 'react'
import { Icon, Divider } from 'animal-island-ui'
import { useIsMobile } from '../utils/responsive'
import { usePageView } from '../utils/usePageView'

export default function Messages() {
  const isMobile = useIsMobile()
  const giscusRef = useRef<HTMLDivElement>(null)
  usePageView('/messages')

  useEffect(() => {
    const el = giscusRef.current
    if (!el) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'LaRysLuo/personal-site')
    script.setAttribute('data-repo-id', 'R_kgDOSe3efw')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDOSe3ef84C9Kk-')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'light')
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    el.appendChild(script)

    return () => {
      el.innerHTML = ''
    }
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Icon name="icon-chat" size={isMobile ? 24 : 28} bounce />
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: 'var(--text-primary)' }}>留言板</h1>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
        留下你想说的话吧～ 对游戏、博文、或者本网站的任何想法都欢迎 ✨
      </p>

      <div
        ref={giscusRef}
        style={{
          minHeight: 300,
          padding: isMobile ? 8 : 0,
        }}
      />

      <Divider type="line-brown" />

      <div style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: 32,
        lineHeight: 1.8,
      }}>
        <p>
          留言由 <a href="https://giscus.app" target="_blank" rel="noopener noreferrer"
            style={{ color: '#889df0', textDecoration: 'none' }}>Giscus</a> 驱动，
          需要 <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            style={{ color: '#889df0', textDecoration: 'none' }}>GitHub</a> 账号登录
        </p>
      </div>
    </div>
  )
}
