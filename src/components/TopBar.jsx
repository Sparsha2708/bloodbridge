import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
export default function TopBar({ title, right }) {
  const nav = useNavigate()
  return (
    <div className="top">
      <button className="iconbtn" onClick={() => nav(-1)} aria-label="Go back"><Icon n="back" /></button>
      <h3>{title}</h3>{right}
    </div>
  )
}
