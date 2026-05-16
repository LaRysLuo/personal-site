import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cursor, Icon } from 'animal-island-ui'
import { useTheme } from '../context/ThemeContext'
import SiteFooter from './SiteFooter'
import { useIsMobile } from '../utils/responsive'

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
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    el.classList.add('theme-transition')
    const timer = setTimeout(() => el.classList.remove('theme-transition'), 400)
    return () => clearTimeout(timer)
  }, [theme])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const isActive = (path: string) =>
    path === '/' ? activePath === '/' : activePath.startsWith(path)

  const sidebar = (
    <aside style={{
      width: isMobile ? '100%' : SIDEBAR_WIDTH,
      minWidth: isMobile ? '100%' : SIDEBAR_WIDTH,
      height: isMobile ? '100dvh' : '100%',
      background: 'var(--bg-secondary)',
      borderRight: isMobile ? 'none' : '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: isMobile ? 'none' : '2px 0 16px rgba(0,0,0,0.04)',
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{
          padding: isMobile ? '16px 20px' : '28px 20px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}>
          <Icon name="icon-map" size={isMobile ? 24 : 28} bounce />
          <div>
            <div style={{
              fontWeight: 900,
              fontSize: isMobile ? 15 : 16,
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
        padding: isMobile ? '8px 12px' : '12px 8px',
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
  )

  return (
    <Cursor>
      <div ref={rootRef} style={{
        display: 'flex',
        height: '100dvh',
        overflow: 'hidden',
        background: `var(--bg-primary)`,
        backgroundImage: `var(--bg-pattern)`,
      }}>
        {isMobile ? (
          <>
            {sidebarOpen && (
              <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
              }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.4)',
                }} onClick={() => setSidebarOpen(false)} />
                <div style={{
                  width: '75%',
                  maxWidth: 300,
                  height: '100dvh',
                  overflow: 'auto',
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                }}>
                  {sidebar}
                </div>
              </div>
            )}

            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100dvh',
            }}>
              <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                flexShrink: 0,
              }}>
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 22,
                    padding: 4,
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                >
                  ☰
                </button>
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)' }}>悠月的小世界</span>
                </Link>
                <button
                  onClick={toggle}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 20,
                    padding: 4,
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </header>

              <main style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  padding: '20px 16px',
                  flex: 1,
                }}>
                  <div className="page-enter">
                    {children}
                  </div>
                </div>
                <SiteFooter />
              </main>

              <nav style={{
                display: 'flex',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                flexShrink: 0,
              }}>
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        padding: '6px 0 8px',
                        textDecoration: 'none',
                        color: active ? '#889df0' : 'var(--text-muted)',
                        fontSize: 10,
                        fontWeight: active ? 700 : 500,
                        borderTop: active ? '2px solid #889df0' : '2px solid transparent',
                      }}
                    >
                      <Icon name={item.icon as any} size={18} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </>
        ) : (
          <>
            {sidebar}
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
          </>
        )}
      </div>
    </Cursor>
  )
}
