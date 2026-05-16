import { Link } from 'react-router-dom'
import { Button } from 'animal-island-ui'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏝️</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 8 }}>
        404 · 迷路了？
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>
        这片海域还没有被探索过...
      </p>
      <Link to="/">
        <Button type="primary" size="large">
          回到首页
        </Button>
      </Link>
    </div>
  )
}
