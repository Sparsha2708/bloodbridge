const COLORS = ['#e5174f', '#ff6b8b', '#7c5cff', '#2c9cdb', '#f2994a', '#27ae60']
export default function Avatar({ name = '?', size }) {
  const c = COLORS[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COLORS.length]
  return <div className={`avatar ${size === 'lg' ? 'lg' : ''}`} style={{ background: c }}>{name.trim()[0]?.toUpperCase()}</div>
}
