import { useState } from 'react'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'

// UI only. TODO (Part 3): load/insert rows in a `messages` table and subscribe with supabase.channel() for realtime.
export default function Chat() {
  const [msgs, setMsgs] = useState([{ me: false, t: 'Hi, I can reach the hospital in 30 minutes.' }])
  const [t, setT] = useState('')
  const send = (e) => { e.preventDefault(); if (!t.trim()) return; setMsgs([...msgs, { me: true, t: t.trim() }]); setT('') }
  return (
    <>
      <TopBar title="Request chat" />
      <div className="note">Preview only. Messages aren’t saved until the chat backend is connected.</div>
      <div className="msgs">{msgs.map((m, i) => <div key={i} className={`bub ${m.me ? 'me' : 'them'}`}>{m.t}</div>)}</div>
      <form className="compose" onSubmit={send}>
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Type a message" aria-label="Message" />
        <button className="next" aria-label="Send"><Icon n="send" /></button>
      </form>
    </>
  )
}
