import { useRef } from 'react'

/**
 * SearchBar
 */
export function SearchBar({ value, onChange }) {
  const inputRef = useRef(null)

  return (
    <div className="relative flex items-center">
      {/* Search icon */}
      <svg
        className="absolute left-3 w-3.5 h-3.5 text-slate-600 pointer-events-none"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clipRule="evenodd"
        />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search vault..."
        className={[
          'w-full pl-8 pr-8 py-1.5 text-xs font-mono',
          'bg-vault-700 border border-vault-600 rounded',
          'text-slate-200 placeholder-slate-700',
          'focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20',
          'transition-colors',
        ].join(' ')}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => { onChange(''); inputRef.current?.focus() }}
          className="absolute right-2 text-slate-600 hover:text-slate-300 transition-colors text-sm leading-none"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}

/**
 * KeyboardHint
 */
export function KeyboardHint() {
  const keys = [
    { key: '↑↓', desc: 'Navigate' },
    { key: '→',  desc: 'Expand' },
    { key: '←',  desc: 'Collapse' },
    { key: '↵',  desc: 'Select' },
  ]
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border-t border-vault-600">
      {keys.map((k) => (
        <div key={k.key} className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 text-[9px] font-mono bg-vault-600 border border-vault-500 rounded text-slate-400">
            {k.key}
          </kbd>
          <span className="text-[9px] text-slate-700">{k.desc}</span>
        </div>
      ))}
    </div>
  )
}
