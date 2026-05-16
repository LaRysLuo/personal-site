import { Link } from 'react-router-dom'
import { Card, Divider } from 'animal-island-ui'
import type { GameMeta } from '../types'
import { ViewCountBadge } from './ViewCounter'

const statusColors: Record<string, string> = {
  released: '#8ac68a',
  developing: '#f7cd67',
  prototype: '#b77dee',
}

const statusLabels: Record<string, string> = {
  released: '已发布',
  developing: '开发中',
  prototype: '原型阶段',
}

function NormalCard({ game }: { game: GameMeta }) {
  return (
    <Link to={`/games/${game.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        color={game.status === 'released' ? 'app-green' : game.status === 'developing' ? 'app-yellow' : 'purple'}
        style={{
          padding: 20,
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'inherit' }}>{game.title}</div>
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 10,
            background: statusColors[game.status] || '#8ac68a',
            color: '#fff',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {statusLabels[game.status] || game.status}
          </span>
        </div>
        <Divider type={game.status === 'released' ? 'line-teal' : game.status === 'developing' ? 'line-yellow' : 'line-brown'} />
        <p style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: 'inherit',
          opacity: 0.85,
          marginTop: 8,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {game.summary}
        </p>
        {game.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
            {game.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.35)',
                color: 'inherit',
              }}>
                {tag}
              </span>
            ))}
            <ViewCountBadge pageKey={`/games/${game.slug}`} />
          </div>
        )}
      </Card>
    </Link>
  )
}

export default function GameCard({ game }: { game: GameMeta }) {
  const coverSrc = game.cardCover || game.cover
  if (!coverSrc) return <NormalCard game={game} />

  return (
    <Link to={`/games/${game.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        color={game.status === 'released' ? 'app-green' : game.status === 'developing' ? 'app-yellow' : 'purple'}
        style={{
          padding: 0,
          transition: 'transform 0.25s, box-shadow 0.25s',
          cursor: 'pointer',
          overflow: 'hidden',
          height: '100%',
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          backgroundImage: `url(${coverSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{game.title}</div>
              <span style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 10,
                background: statusColors[game.status] || '#8ac68a',
                color: '#fff',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                marginLeft: 8,
              }}>
                {statusLabels[game.status] || game.status}
              </span>
            </div>
            <p style={{
              fontSize: 12,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.85)',
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              {game.summary}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {game.tags.slice(0, 3).map((tag) => (
                <span key={tag} style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(4px)',
                }}>
                  {tag}
                </span>
              ))}
              <ViewCountBadge pageKey={`/games/${game.slug}`} />
              {game.steamUrl && (
                <div
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(game.steamUrl, '_blank', 'noopener,noreferrer')
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginLeft: 'auto',
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(27,188,213,0.85)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(27,188,213,1)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(27,188,213,0.85)' }}
                >
                  <span>🎮</span>
                  <span>Steam</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
