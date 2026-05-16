import { useState, useEffect } from 'react'
import { Icon, Select } from 'animal-island-ui'
import GameCard from '../components/GameCard'
import { loadGameList } from '../utils/content'
import type { GameMeta } from '../types'
import { useIsMobile } from '../utils/responsive'
import { usePageView } from '../utils/usePageView'

export default function Games() {
  const [games, setGames] = useState<GameMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const isMobile = useIsMobile()

  usePageView('/games')

  useEffect(() => {
    loadGameList()
      .then(setGames)
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all'
    ? games
    : games.filter((g) => g.status === filter)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isMobile ? 16 : 24 }}>
        <Icon name="icon-critterpedia" size={isMobile ? 24 : 28} bounce />
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: 'var(--text-primary)' }}>游戏作品</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 14, color: '#a0936e' }}>
          共 {filtered.length} 个作品
        </p>
        <Select
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: '全部作品' },
            { key: 'released', label: '已发布' },
            { key: 'developing', label: '开发中' },
            { key: 'prototype', label: '原型阶段' },
          ]}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#a0936e' }}>
          加载中...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          暂无作品
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {filtered.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
