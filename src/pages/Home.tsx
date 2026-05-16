import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Divider, Time, Icon } from 'animal-island-ui'
import { loadGameList, loadBlogList } from '../utils/content'
import type { GameMeta, BlogMeta } from '../types'
import { useIsMobile } from '../utils/responsive'

export default function Home() {
  const [games, setGames] = useState<GameMeta[]>([])
  const [posts, setPosts] = useState<BlogMeta[]>([])
  const isMobile = useIsMobile()

  useEffect(() => {
    loadGameList().then(setGames)
    loadBlogList().then(setPosts)
  }, [])

  const recentGames = games.slice(0, 2)
  const recentPosts = posts.slice(0, 2)

  return (
    <div>
      <div style={{
        position: 'relative',
        minHeight: isMobile ? 360 : 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: isMobile ? '40px 16px 36px' : '60px 20px 48px',
        overflow: 'hidden',
        margin: isMobile ? '-20px -16px 8px' : '-32px -40px 8px',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${import.meta.env.BASE_URL}images/Gemini_Generated_Image_6ie5uk6ie5uk6ie5.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.6) saturate(1.1)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
        }} />
        <div style={{
          width: isMobile ? 90 : 110,
          height: isMobile ? 90 : 110,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid rgba(255,255,255,0.7)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1,
          marginBottom: 18,
        }}>
          <img
            src={`${import.meta.env.BASE_URL}images/resu_01.png`}
            alt="悠月"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
        <h1 style={{
          fontSize: isMobile ? 26 : 32,
          fontWeight: 900,
          color: '#ffffff',
          marginBottom: 4,
          letterSpacing: 1,
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1,
        }}>悠月</h1>
        <p style={{
          fontSize: isMobile ? 13 : 15,
          color: 'rgba(255,255,255,0.85)',
          marginBottom: 4,
          textShadow: '0 1px 4px rgba(0,0,0,0.25)',
          position: 'relative',
          zIndex: 1,
        }}>
          独立游戏开发者 · 像素艺术爱好者 · 用代码编织故事
        </p>
        <p style={{
          fontSize: isMobile ? 13 : 14,
          color: 'rgba(255,255,255,0.7)',
          fontStyle: 'italic',
          marginBottom: 24,
          textShadow: '0 1px 4px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 1,
        }}>
          「在小小的世界里，创造大大的冒险」
        </p>
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}>
          <Link to="/games">
            <Button type="primary" size={isMobile ? 'middle' : 'large'}>
              浏览游戏作品
            </Button>
          </Link>
          <Link to="/blog">
            <Button type="primary" size={isMobile ? 'middle' : 'large'}>
              阅读博文
            </Button>
          </Link>
          <Link to="/friends">
            <Button type="primary" size={isMobile ? 'middle' : 'large'}>
              友情链接
            </Button>
          </Link>
        </div>
        <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
          <Time />
        </div>
      </div>

      <Divider type="wave-yellow" />

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? 20 : 24,
        marginBottom: 32,
      }}>
        <div>
          <div style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Icon name="icon-chat" size={isMobile ? 20 : 22} />
            <span>最新博文</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: 14,
                  borderRadius: 12,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{post.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{post.summary}</p>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/blog">
              <Button type="link">查看全部文章 →</Button>
            </Link>
          </div>
        </div>

        <div>
          <div style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Icon name="icon-critterpedia" size={isMobile ? 20 : 22} />
            <span>近期游戏作品</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recentGames.map((game) => {
              const cardImg = game.featuredCover || game.cardCover || game.cover
              return (
                <Link key={game.slug} to={`/games/${game.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}>
                    {cardImg && (
                      <div style={{
                        width: isMobile ? 90 : 110,
                        minWidth: isMobile ? 90 : 110,
                        aspectRatio: '1.75 / 1',
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundImage: `url(${cardImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
                      }} />
                    )}
                    <div style={{
                      flex: 1,
                      padding: '8px 0 8px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}>
                      <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: 'var(--text-primary)' }}>{game.title}</div>
                      <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {game.summary}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/games">
              <Button type="link">查看全部作品 →</Button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Link to="/ai-search">
          <Button type="dashed" icon={<Icon name="icon-diy" size={18} />}>
            🤖 AI 搜索全站内容
          </Button>
        </Link>
      </div>
    </div>
  )
}
