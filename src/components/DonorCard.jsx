import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import Drop from './Drop'
import Icon from './Icon'
export default function DonorCard({ d, to, action }) {
  const body = (
    <div className="person">
      <Avatar name={d.full_name} />
      <div className="who"><b>{d.full_name}{d.id_verified ? ' ✓' : ''}</b>
        <span className="loc"><Icon n="pin" />{d.area ? d.area + ', ' : ''}{d.city}</span></div>
      <Drop group={d.blood_group} />
      {action}
    </div>
  )
  return to ? <Link className="card shadow" to={to}>{body}</Link> : <div className="card shadow">{body}</div>
}
