export default function Logo({ variant = 'dark', className = '' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-ink'

  return (
    <span className={`font-display font-bold text-xl tracking-tight ${textColor} ${className}`}>
      <span className="text-accent">B</span>
      <span className="opacity-40 mx-0.5">/</span>
      Trans
    </span>
  )
}
