import { buildPath, getExtension, getFileIconMeta, countContents } from './fileUtils'

export default function PropertiesPanel({ node, allData }) {
  if (!node) return <EmptyState />

  const path      = buildPath(allData, node.id)
  const pathStr   = path.map((n) => n.name).join(' › ')
  const ext       = getExtension(node.name)
  const { icon, color } = getFileIconMeta(node)
  const isFolder  = node.type === 'folder'
  const contents  = isFolder ? countContents(node) : null

  const rows = [
    { label: 'Name',     value: node.name, mono: true },
    { label: 'Type',     value: isFolder ? 'Folder' : (ext.toUpperCase() || 'File') },
    !isFolder && node.size && { label: 'Size', value: node.size },
    isFolder && {
      label: 'Contents',
      value: `${contents.files} file${contents.files !== 1 ? 's' : ''}, ${contents.folders} folder${contents.folders !== 1 ? 's' : ''}`,
    },
    { label: 'Location', value: pathStr, mono: true, wrap: true },
  ].filter(Boolean)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-vault-600">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">
          Properties
        </p>

        {/* Icon + name */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-vault-600 border border-vault-500 flex items-center justify-center flex-shrink-0">
            {isFolder ? (
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            ) : (
              <span className={`text-xl ${color}`}>{icon}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 leading-tight break-all">
              {node.name}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              {isFolder ? 'Folder' : ext.toUpperCase() + ' File'}
            </p>
          </div>
        </div>
      </div>

      {/* Property rows */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {rows.map((row, i) => (
          <div key={i}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">
              {row.label}
            </p>
            <p
              className={[
                'text-xs leading-relaxed',
                row.mono ? 'font-mono text-cyan-400/80' : 'text-slate-300',
                row.wrap ? 'break-all' : 'truncate',
              ].join(' ')}
              title={typeof row.value === 'string' ? row.value : undefined}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* Footer encryption badge */}
      <div className="px-4 py-3 border-t border-vault-600">
        <div className="flex items-center gap-2 text-[10px] text-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
          AES-256 encrypted at rest
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-4 border-b border-vault-600">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Properties
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
        <div className="w-10 h-10 rounded-lg bg-vault-700 border border-vault-600 flex items-center justify-center opacity-40">
          <svg className="w-5 h-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Select a file or folder<br />to view its properties
        </p>
      </div>
    </div>
  )
}
