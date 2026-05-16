import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cursor, Icon } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext'
import SiteFooter from './SiteFooter'

const NAV_ITEMS = [
  { path: '/', label: '主页', icon: 'icon-miles' },
  { path: '/games', label: '游戏作品', icon: 'icon-critterpedia' },
  { path: '/blog', label: '博文', icon: 'icon-chat' },
  { path: '/friends', label: '友情链接', icon: 'icon-helicopter' },
]

const SIDEBAR_WIDTH = 220

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const activePath = location.pathname
  const { theme, toggle } = useTheme()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    el.classList.add('theme-transition')
    const timer = setTimeout(() => el.classList.remove('theme-transition'), 400)
    return () => clearTimeout(timer)
  }, [theme])

  const isActive = (path: string) =>
    path === '/' ? activePath === '/' : activePath.startsWith(path)

  return (
    <Cursor>
      <div ref={rootRef} style={{
        display: 'flex',
        height: '100dvh',
        overflow: 'hidden',
        background: `var(--bg-primary)`,
        backgroundImage: `var(--bg-pattern)`,
      }}>
        <aside style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '28px 20px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}>
              <Icon name="icon-map" size={28} bounce />
              <div>
                <div style={{
                  fontWeight: 900,
                  fontSize: 16,
                  color: 'var(--text-primary)',
                  letterSpacing: -0.3,
                  lineHeight: 1.2,
                }}>悠月的小世界</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Yuyue's World</div>
              </div>
            </div>
          </Link>

          <nav style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 600,
                    fontSize: 14,
                    color: active ? '#fff' : 'var(--text-secondary)',
                    background: active ? 'var(--nav-active-bg)' : 'transparent',
                    transition: 'all 0.2s',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left' as const,
                    fontFamily: 'inherit',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--nav-hover-bg)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icon name={item.icon as any} size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <Link
              to="/ai-search"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: isActive('/ai-search') ? 700 : 600,
                fontSize: 13,
                color: isActive('/ai-search') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/ai-search') ? 'var(--nav-active-bg)' : 'transparent',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/ai-search')) e.currentTarget.style.background = 'var(--nav-hover-bg)'
              }}
              onMouseLeave={(e) => {
                if (!isActive('/ai-search')) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon name="icon-diy" size={18} />
              <span>AI 搜索</span>
            </Link>

            <button
              onClick={toggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left' as const,
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--nav-hover-bg)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{theme === 'light' ? '🌙' : '☀️'}</span>
              <span>{theme === 'light' ? '暗色模式' : '亮色模式'}</span>
            </button>
          </div>
        </aside>

        <main style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '32px 40px',
            flex: 1,
          }}>
            <div className="page-enter">
              {children}
            </div>
          </div>
          <SiteFooter />
        </main>
      </div>
    </Cursor>
  )
}
