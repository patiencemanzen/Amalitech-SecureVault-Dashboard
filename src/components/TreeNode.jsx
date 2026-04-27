import { useEffect, useRef } from 'react'
import { getExtension, getFileIconMeta } from './fileUtils'

export default function TreeNode({
  node,
  depth,
  isExpanded,
  isSelected,
  isFocused,
  searchQuery,
  onToggle,
  onSelect,
  onContextMenu,
  onFocus,
}) {
  const rowRef = useRef(null)
  const isFolder = node.type === 'folder'
  const { icon, color } = getFileIconMeta(node)

  // Scroll into view when keyboard-focused
  useEffect(() => {
    if (isFocused) rowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [isFocused])

  // Highlight matching substring in name
  function renderName(name) {
    if (!searchQuery) return <span>{name}</span>
    const idx = name.toLowerCase().indexOf(searchQuery.toLowerCase())
    if (idx === -1) return <span>{name}</span>
    return (
      <span>
        {name.slice(0, idx)}
        <mark className="bg-cyan-500/25 text-cyan-300 rounded-sm not-italic">
          {name.slice(idx, idx + searchQuery.length)}
        </mark>
        {name.slice(idx + searchQuery.length)}
      </span>
    )
  }

  const handleClick = () => {
    onFocus(node.id)
    if (isFolder) onToggle(node.id)
    else onSelect(node)
  }

  return (
    <div
      ref={rowRef}
      role={isFolder ? 'treeitem' : 'option'}
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-selected={isSelected}
      data-nodeid={node.id}
      onClick={handleClick}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, node) }}
      onFocus={() => onFocus(node.id)}
      tabIndex={-1}
      className={[
        'flex items-center gap-1.5 py-[5px] pr-3 rounded cursor-pointer select-none group',
        'text-xs transition-colors duration-75 outline-none',
        // indent via padding
        isSelected
          ? 'bg-vault-600 border-l-2 border-cyan-400 text-slate-100'
          : 'border-l-2 border-transparent hover:bg-vault-700 text-slate-400 hover:text-slate-200',
        isFocused && !isSelected ? 'ring-1 ring-inset ring-cyan-500/40' : '',
      ].join(' ')}
      style={{ paddingLeft: `${depth * 16 + 10}px` }}
    >
      {/* Chevron (folders) or spacer (files) */}
      <span
        className={[
          'flex-shrink-0 w-3 h-3 flex items-center justify-center',
          'text-slate-600 group-hover:text-slate-400 transition-transform duration-150',
          isFolder && isExpanded ? 'rotate-90' : '',
        ].join(' ')}
      >
        {isFolder ? (
          <svg viewBox="0 0 10 10" fill="currentColor" className="w-2.5 h-2.5">
            <polygon points="2,1 9,5 2,9" />
          </svg>
        ) : null}
      </span>

      {/* Folder SVG icon or file emoji */}
      {isFolder ? (
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 ${isExpanded ? 'text-cyan-400' : 'text-cyan-600'} transition-colors`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          {isExpanded ? (
            <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          ) : (
            <path
              fillRule="evenodd"
              d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v1H2V8a2 2 0 010-.172V6zm0 3.5V14a2 2 0 002 2h12a2 2 0 002-2V9.5H2z"
              clipRule="evenodd"
            />
          )}
        </svg>
      ) : (
        <span className={`flex-shrink-0 text-[13px] ${color}`}>{icon}</span>
      )}

      {/* Name */}
      <span className="flex-1 truncate font-mono leading-none">
        {renderName(node.name)}
        {isFolder && node.children?.length === 0 && (
          <span className="ml-2 text-slate-700 text-[10px]">empty</span>
        )}
      </span>

      {/* File size badge */}
      {!isFolder && node.size && (
        <span className="flex-shrink-0 text-[10px] text-slate-700 group-hover:text-slate-500 transition-colors tabular-nums">
          {node.size}
        </span>
      )}

      {/* Folder item count badge (only when collapsed) */}
      {isFolder && !isExpanded && node.children?.length > 0 && (
        <span className="flex-shrink-0 text-[10px] text-slate-700 tabular-nums">
          {node.children.length}
        </span>
      )}
    </div>
  )
}
