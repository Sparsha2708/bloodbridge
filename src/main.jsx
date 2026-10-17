import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { configured } from './lib/supabase'
import App from './App'
import './styles.css'

function Setup() {
  return (
    <div className="app"><div className="screen">
      <h1>One more step</h1>
      <p className="sub">BloodBridge can’t reach Supabase yet.</p>
      <p>1. Copy <b>.env.example</b> to a new file named <b>.env</b> in the project root.</p>
      <p>2. Paste your Supabase <b>Project URL</b> and <b>anon key</b> (Supabase dashboard, Project Settings, API).</p>
      <p>3. Stop the dev server and run <b>npm run dev</b> again.</p>
    </div></div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  configured
    ? <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>
    : <Setup />
)
