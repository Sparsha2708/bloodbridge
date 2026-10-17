import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Drop from './Drop'
import Icon from './Icon'
import StatusPill from './StatusPill'
export default function RequestCard({ to, title, place, text, group, status, children }) {
  const inner = (
    <>
      <div className="person">
        <Avatar name={title} />
        <div className="who"><b>{title}</b><span className="loc"><Icon n="pin" />{place}</span></div>
        <Drop group={group} />
      </div>
      {text && <p className="cardtext">{text}</p>}
      <div className="cardfoot"><StatusPill status={status} /><span className="row-actions">{children}</span></div>
    </>
  )
  return to ? <Link to={to} className="card shadow">{inner}</Link> : <div className="card shadow">{inner}</div>
}
