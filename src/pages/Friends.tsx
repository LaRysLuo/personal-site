import { Link } from 'react-router-dom'
import { Icon, Card, Divider } from 'animal-island-ui'
import { useIsMobile } from '../utils/responsive'
import { usePageView } from '../utils/usePageView'

const FRIENDS = [
  {
    name: 'animal-island-ui',
    url: 'https://github.com/guokaigdg/animal-island-ui',
    desc: '《动物森友会》风格的 React 组件库，本网站就是基于它构建的。',
    color: 'app-green' as const,
  },
  {
    name: 'ac-site-template',
    url: 'https://github.com/yunxinz/ac-site-template',
    desc: '动森主题个人网站模板，同样基于 animal-island-ui 构建。',
    color: 'app-blue' as const,
  },
  {
    name: 'HiKid',
    url: 'https://github.com/xiaochong/hi-kid',
    desc: '儿童教育 App，帮助孩子练习英语口语和听力。',
    color: 'app-yellow' as const,
  },
  {
    name: 'animal-island-blog',
    url: 'https://github.com/guokaigdg/animal-island-blog',
    desc: '动森风格博客，另一个基于 animal-island-ui 的有趣项目。',
    color: 'app-teal' as const,
  },
  {
    name: 'Pixel Joint',
    url: 'https://pixeljoint.com',
    desc: '像素艺术社区，汇集全球像素画家的作品展示和教程。',
    color: 'app-pink' as const,
  },
  {
    name: 'Lospec',
    url: 'https://lospec.com',
    desc: '像素艺术调色板资源库，提供大量精美的有限色板。',
    color: 'purple' as const,
  },
]

export default function Friends() {
  const isMobile = useIsMobile()

  usePageView('/friends')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Icon name="icon-helicopter" size={isMobile ? 24 : 28} bounce />
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: 'var(--text-primary)' }}>友情链接</h1>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
        一些有趣的项目和网站推荐
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {FRIENDS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <Card
              color={link.color}
              style={{
                padding: 20,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                height: '100%',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: isMobile ? 16 : 17, fontWeight: 700, color: 'inherit', marginBottom: 4 }}>
                {link.name}
              </div>
              <div style={{ fontSize: 12, color: 'inherit', opacity: 0.7, marginBottom: 8, wordBreak: 'break-all' }}>
                {link.url}
              </div>
              <Divider type="line-brown" />
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'inherit', opacity: 0.85, marginTop: 8 }}>
                {link.desc}
              </p>
            </Card>
          </a>
        ))}
      </div>

      <Divider type="line-brown" />

      <div style={{
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          🤝 交换友链
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          如果你也有独立游戏、技术博客或有趣的项目，欢迎联系我交换友链！
          <br />
          现在有了<Link to="/messages" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>留言板</Link>，欢迎去那里留言交流！
        </p>
      </div>
    </div>
  )
}
