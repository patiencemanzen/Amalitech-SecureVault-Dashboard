# SecureVault — File Explorer Dashboard

A high-performance, keyboard-accessible file explorer built for enterprise law firms and banks. Features a recursive folder tree, real-time search, file properties inspection, and a right-click context menu — all in a dark "cyber-secure" aesthetic with zero third-party UI libraries.

**[Live Demo →](https://amalitechsecuredashboard.netlify.app/)**  
**[Design File (Figma) →](https://www.figma.com/design/IkPC8siGcp5IMAewtkhNt8/Amalitech---SecureVault?node-id=0-1&t=xHB00pWdu8tqAbRm-1)**

---

## Features at a Glance

| Feature | Status |
|---|---|
| Recursive folder tree (any depth) | ✅ |
| Expand / collapse folders | ✅ |
| File selection + Properties Panel | ✅ |
| Full keyboard navigation (↑↓→←↵) | ✅ |
| Real-time search with auto-expand | ✅ |
| Right-click context menu (Wildcard) | ✅ |
| Connector lines between tree levels | ✅ |
| Live status clock + item count | ✅ |

---

## Local Setup

```bash
git clone https://github.com/patiencemanzen/Amalitech-SecureVault-Dashboard
cd Amalitech-SecureVault-Dashboard

npm install
npm run dev       # → http://localhost:5173
npm run build     # Production build
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build | Vite |
| Styling | Tailwind CSS (custom components only — no UI library) |
| State | React `useState` / `useCallback` / `useMemo` |
| Deployment | Vercel |

---

## Recursive Strategy

The tree is rendered by a `renderNodes()` function inside `FileExplorer.jsx` that calls itself for each folder's `children` array:

```js
function renderNodes(nodes, depth = 0) {
  return nodes.map(node => (
    <div key={node.id}>
      <TreeNode depth={depth} ... />
      {node.type === 'folder' && isExpanded(node.id) && (
        <div>{renderNodes(node.children, depth + 1)}</div>
      )}
    </div>
  ))
}
```

React's own call stack handles the recursion. `depth` drives the `padding-left` indent of each row (`depth * 16px`). This approach works correctly at 2 levels or 200 levels — the UI never breaks because there are no hardcoded depth limits.

**Keyboard navigation** uses a companion `flattenVisible()` utility that converts the visible (expanded) tree into a flat ordered array. Arrow keys simply move an index through that array:

```js
// flattenVisible in fileUtils.js
function flattenVisible(nodes, expandedIds, depth = 0) {
  const result = []
  for (const node of nodes) {
    result.push({ node, depth })
    if (node.type === 'folder' && expandedIds.has(node.id))
      result.push(...flattenVisible(node.children, expandedIds, depth + 1))
  }
  return result
}
```

**Search** uses a `filterTree()` DFS that keeps only nodes on a path leading to a match, and returns a `Set` of folder IDs to auto-expand so matching files are never hidden inside closed folders.

---

## Wildcard Feature — Right-Click Context Menu

**What it is:** Right-clicking any file or folder opens a context menu with three actions:
- **Copy Path** — writes the full breadcrumb path (`Dept › Folder › File.pdf`) to the clipboard
- **Expand All** — recursively opens all sub-folders inside a folder
- **Collapse** — closes a folder and its descendants

**Why it matters:** In a law firm or bank, staff constantly reference file locations in emails, court filings, and audit trails. Today they manually navigate to a file, then type out the path by hand — introducing transcription errors. Copy Path makes this a single right-click, with zero error risk. Expand All lets senior partners instantly see every document inside a case folder before a hearing.

The menu positions itself with `Math.min(x, viewport - menuWidth)` calculations to stay fully on-screen regardless of where the user right-clicks.

---

## Bonus Feature — Real-Time Search with Auto-Expand

A search bar in the header filters the entire tree as you type. Files and folders whose names contain the query are shown; non-matching branches are hidden. Any folder that *contains* a matching descendant is automatically expanded and kept visible, so results are never buried. Matching text is highlighted with a cyan underlay inside the node name.

Press `/` anywhere on the page to focus the search bar without reaching for the mouse.

---

## Project Structure

```
src/
├── App.jsx                    # Root — wires all state together
├── data.json                  # Source file tree data
├── index.css                  # Tailwind + custom CSS (scanlines, toasts)
├── main.jsx                   # React entry
└── components/
    ├── FileExplorer.jsx       # Recursive renderer + keyboard nav
    ├── TreeNode.jsx           # Single file/folder row
    ├── PropertiesPanel.jsx    # Right-side metadata panel
    ├── ContextMenu.jsx        # Right-click menu (Wildcard feature)
    ├── SearchBar.jsx          # Search input + keyboard hint bar
    └── fileUtils.js           # All tree algorithms (flatten, filter, path, count)
```
