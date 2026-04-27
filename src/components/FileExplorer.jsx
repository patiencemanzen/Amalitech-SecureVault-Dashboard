import { useState, useMemo, useCallback, useRef } from 'react'
import TreeNode from './TreeNode'
import { flattenVisible, filterTree, collectDescendantFolderIds } from './fileUtils'

export default function FileExplorer({
  data,
  searchQuery,
  selectedId,
  focusedId,
  onSelect,
  onFocusChange,
  onContextMenu,
  externalExpandAll,   // { nodeId } trigger from context menu
  externalCollapseAll, // { nodeId } trigger from context menu
}) {
  const [expandedIds, setExpandedIds] = useState(new Set())
  const containerRef = useRef(null)

  // ── Filter tree by search 
  const { filtered, autoExpand } = useMemo(
    () => filterTree(data, searchQuery),
    [data, searchQuery]
  )

  // Effective expanded = user choices ∪ auto-expanded from search
  const effectiveExpanded = useMemo(() => {
    if (!searchQuery.trim()) return expandedIds
    return new Set([...expandedIds, ...autoExpand])
  }, [expandedIds, autoExpand, searchQuery])

  // ── Flat visible list for keyboard nav 
  const flatItems = useMemo(
    () => flattenVisible(filtered, effectiveExpanded),
    [filtered, effectiveExpanded]
  )

  // ── Toggle expand 
  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // Expand all descendants of a node (called from context menu)
  const expandAll = useCallback((node) => {
    const ids = collectDescendantFolderIds(node)
    setExpandedIds((prev) => new Set([...prev, ...ids]))
  }, [])

  // Collapse a folder and all its descendants
  const collapseAll = useCallback((node) => {
    const ids = collectDescendantFolderIds(node)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }, [])

  // Expose expand/collapse through refs (called from App via prop changes)
  // Simple approach: App passes the target node directly via prop
  // We handle it via a useMemo effect workaround — just expose functions via callback
  // Actually: we pass expandAll/collapseAll callbacks UP so App can give them to ContextMenu
  // But App needs to pass them down. Simplest: put context menu handling here.

  // ── Keyboard navigation 
  const handleKeyDown = useCallback(
    (e) => {
      const currentIdx = flatItems.findIndex((item) => item.node.id === focusedId)
      const current = flatItems[currentIdx]?.node

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (currentIdx === -1 && flatItems.length > 0) {
            onFocusChange(flatItems[0].node.id)
          } else if (currentIdx < flatItems.length - 1) {
            onFocusChange(flatItems[currentIdx + 1].node.id)
          }
          break

        case 'ArrowUp':
          e.preventDefault()
          if (currentIdx > 0) onFocusChange(flatItems[currentIdx - 1].node.id)
          break

        case 'ArrowRight':
          e.preventDefault()
          if (current?.type === 'folder' && !effectiveExpanded.has(current.id)) {
            setExpandedIds((prev) => new Set([...prev, current.id]))
          }
          break

        case 'ArrowLeft':
          e.preventDefault()
          if (current?.type === 'folder' && effectiveExpanded.has(current.id)) {
            setExpandedIds((prev) => {
              const next = new Set(prev)
              next.delete(current.id)
              return next
            })
          }
          break

        case 'Enter':
          e.preventDefault()
          if (!current) break
          if (current.type === 'file') onSelect(current)
          else toggleExpand(current.id)
          break

        default:
          break
      }
    },
    [flatItems, focusedId, effectiveExpanded, toggleExpand, onSelect, onFocusChange]
  )

  // ── Recursive renderer 
  function renderNodes(nodes, depth = 0) {
    return nodes.map((node) => (
      <div key={node.id} className="tree-indent">
        <TreeNode
          node={node}
          depth={depth}
          isExpanded={effectiveExpanded.has(node.id)}
          isSelected={node.id === selectedId}
          isFocused={node.id === focusedId}
          searchQuery={searchQuery}
          onToggle={toggleExpand}
          onSelect={onSelect}
          onContextMenu={(e, n) => onContextMenu(e, n, expandAll, collapseAll)}
          onFocus={onFocusChange}
        />
        {node.type === 'folder' &&
          effectiveExpanded.has(node.id) &&
          node.children?.length > 0 && (
            <div className="relative">
              {/* Vertical connector line */}
              <div
                className="absolute top-0 bottom-0 border-l border-vault-600"
                style={{ left: `${depth * 16 + 17}px` }}
              />
              {renderNodes(node.children, depth + 1)}
            </div>
          )}
      </div>
    ))
  }

  // ── Render 
  return (
    <div
      ref={containerRef}
      role="tree"
      aria-label="File Explorer"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex-1 overflow-y-auto py-2 outline-none focus:ring-1 focus:ring-inset focus:ring-cyan-500/20"
    >
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-xs gap-2">
          <span className="text-3xl opacity-40">🔍</span>
          <span>No results for <span className="text-cyan-700">"{searchQuery}"</span></span>
        </div>
      ) : (
        renderNodes(filtered)
      )}
    </div>
  )
}
