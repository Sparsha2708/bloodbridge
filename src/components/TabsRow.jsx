export default function TabsRow({ tabs, value, onChange }) {
  return <div className="tabsrow" role="tablist">{tabs.map((t) => <button key={t} role="tab" className={value === t ? 'on' : ''} onClick={() => onChange(t)}>{t}</button>)}</div>
}
