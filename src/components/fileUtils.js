// ── File type helpers ──────────────────────────────────────────────────────

export function getExtension(name) {
  const parts = name.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

const EXT_ICONS = {
  pdf:        { icon: '📄', color: 'text-red-400' },
  docx:       { icon: '📝', color: 'text-blue-400' },
  doc:        { icon: '📝', color: 'text-blue-400' },
  xlsx:       { icon: '📊', color: 'text-green-400' },
  xls:        { icon: '📊', color: 'text-green-400' },
  png:        { icon: '🖼', color: 'text-purple-400' },
  jpg:        { icon: '🖼', color: 'text-purple-400' },
  jpeg:       { icon: '🖼', color: 'text-purple-400' },
  svg:        { icon: '🖼', color: 'text-purple-400' },
  gif:        { icon: '🖼', color: 'text-purple-400' },
  txt:        { icon: '📃', color: 'text-slate-400' },
  yaml:       { icon: '⚙️', color: 'text-yellow-400' },
  yml:        { icon: '⚙️', color: 'text-yellow-400' },
  json:       { icon: '⚙️', color: 'text-yellow-400' },
  ttf:        { icon: '🔤', color: 'text-pink-400' },
  otf:        { icon: '🔤', color: 'text-pink-400' },
  mp4:        { icon: '🎬', color: 'text-cyan-400' },
  zip:        { icon: '📦', color: 'text-orange-400' },
  js:         { icon: '📜', color: 'text-yellow-300' },
  ts:         { icon: '📜', color: 'text-blue-300' },
  gitignore:  { icon: '🔒', color: 'text-slate-500' },
}

export function getFileIconMeta(node) {
  if (node.type === 'folder') {
    return { icon: null, color: 'text-cyan-400' } // handled by SVG in component
  }
  const ext = getExtension(node.name)
  return EXT_ICONS[ext] ?? { icon: '📎', color: 'text-slate-400' }
}

/**
 * Tree traversal 
 * 
 * Recursively flatten only the visible nodes (folders must be in expandedIds).
 * Returns array of { node, depth }.
 */
export function flattenVisible(nodes, expandedIds, depth = 0) {
  const result = []
  for (const node of nodes) {
    result.push({ node, depth })
    if (node.type === 'folder' && expandedIds.has(node.id) && node.children?.length) {
      result.push(...flattenVisible(node.children, expandedIds, depth + 1))
    }
  }
  return result
}

/**
 * Filter the tree by search query.
 * Keeps only paths that lead to a match.
 * Returns { filtered, autoExpand } where autoExpand is a Set of folder IDs to open.
 */
export function filterTree(nodes, query) {
  if (!query.trim()) return { filtered: nodes, autoExpand: new Set() }

  const autoExpand = new Set()
  const q = query.toLowerCase()

  function filterNode(node) {
    const matches = node.name.toLowerCase().includes(q)

    if (node.type === 'file') return matches ? node : null

    // Folder — recurse into children
    const filteredChildren = (node.children ?? []).map(filterNode).filter(Boolean)
    if (matches || filteredChildren.length > 0) {
      if (filteredChildren.length > 0) autoExpand.add(node.id)
      return { ...node, children: filteredChildren }
    }
    return null
  }

  return {
    filtered: nodes.map(filterNode).filter(Boolean),
    autoExpand,
  }
}

/**
 * Build the path from root to a target node.
 * Returns an array of node objects from root → target.
 */
export function buildPath(nodes, targetId) {
  function dfs(nodes, path) {
    for (const node of nodes) {
      const newPath = [...path, node]
      if (node.id === targetId) return newPath
      if (node.children) {
        const found = dfs(node.children, newPath)
        if (found) return found
      }
    }
    return null
  }
  return dfs(nodes, []) ?? []
}

/**
 * Collect all descendant folder IDs (for Expand All).
 */
export function collectDescendantFolderIds(node) {
  const ids = new Set()
  function walk(n) {
    if (n.type === 'folder') {
      ids.add(n.id)
      ;(n.children ?? []).forEach(walk)
    }
  }
  walk(node)
  return ids
}

/**
 * Count direct + recursive files and folders inside a folder node.
 */
export function countContents(node) {
  let files = 0
  let folders = 0
  for (const child of node.children ?? []) {
    if (child.type === 'file') {
      files++
    } else {
      folders++
      const inner = countContents(child)
      files += inner.files
      folders += inner.folders
    }
  }
  return { files, folders }
}

/**
 * Count total items in the entire tree (for status bar).
 */
export function countAll(nodes) {
  let files = 0, folders = 0
  function walk(n) {
    if (n.type === 'file') files++
    else { folders++; (n.children ?? []).forEach(walk) }
  }
  nodes.forEach(walk)
  return { files, folders }
}
