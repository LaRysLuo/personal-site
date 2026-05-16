import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useIsMobile } from '../utils/responsive'

export default function SiteFooter() {
  const { theme } = useTheme()
  const isMobile = useIsMobile()

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      background: theme === 'dark'
        ? 'linear-gradient(180deg, var(--bg-secondary) 0%, #111827 100%)'
        : 'linear-gradient(180deg, var(--bg-secondary) 0%, #e8e2d6 100%)',
      padding: isMobile ? '24px 16px 20px' : '32px 40px 24px',
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        flexWrap: 'wrap',
        gap: isMobile ? 16 : 24,
      }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>
            🏝️ 悠月的小世界
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 240 }}>
            独立游戏开发者 · 像素艺术爱好者
            <br />
            用代码编织故事
          </p>
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 24 : 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>浏览</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link to="/games" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>游戏作品</Link>
              <Link to="/blog" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>博文</Link>
              <Link to="/friends" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>友情链接</Link>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>工具</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link to="/ai-search" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>AI 搜索</Link>
              <a href="https://github.com/guokaigdg/animal-island-ui" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
                animal-island-ui
              </a>
            </div>
          </div>
        </div>
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: 11,
        color: 'var(--text-muted)',
        marginTop: 24,
        paddingTop: 16,
        borderTop: '1px solid var(--border-color)',
        opacity: 0.7,
      }}>
        &copy; {new Date().getFullYear()} 悠月的小世界 · Built with ❤️
      </div>
    </footer>
  )
}
