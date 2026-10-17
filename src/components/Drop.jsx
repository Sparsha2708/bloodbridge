export default function Drop({ group, size = 40 }) {
  return (
    <svg className="drop" width={size} height={size} viewBox="0 0 24 24" aria-label={`Blood group ${group}`}>
      <path d="M12 2C12 2 5 9.5 5 15a7 7 0 0 0 14 0c0-5.500-7-13-7-13z" fill="#e5174f" />
      <text x="12" y="16.5" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#fff" fontFamily="Poppins,sans-serif">{group}</text>
    </svg>
  )
}
