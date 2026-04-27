import { useState, useCallback, useEffect } from "react";
import rawData from "./data.json";
import FileExplorer from "./components/FileExplorer";
import PropertiesPanel from "./components/PropertiesPanel";
import ContextMenu from "./components/ContextMenu";
import { SearchBar, KeyboardHint } from "./components/SearchBar";
import { buildPath, countAll } from "./components/fileUtils";

const { files: totalFiles, folders: totalFolders } = countAll(rawData);

export default function App() {
  const [selected, setSelected] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [clock, setClock] = useState(new Date());

  // Live clock for the status bar
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Toast helper
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Context menu actions
  const handleContextMenu = useCallback((e, node, expandAll, collapseAll) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node,
      expandAll,
      collapseAll,
    });
  }, []);

  const handleCopyPath = useCallback(
    (node) => {
      const path = buildPath(rawData, node.id);
      const pathStr = path.map((n) => n.name).join(" › ");
      navigator.clipboard
        .writeText(pathStr)
        .then(() => showToast(`Path copied: ${pathStr}`))
        .catch(() => showToast("Clipboard unavailable "));
      setContextMenu(null);
    },
    [showToast],
  );

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ── Render
  return (
    <div className="h-screen flex flex-col scanlines overflow-hidden bg-vault-900">
      {/* ── Top header bar  */}
      <header className="h-11 flex-shrink-0 flex items-center gap-0 bg-vault-800 border-b border-vault-600 z-10">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 border-r border-vault-600 h-full">
          <svg
            className="w-4 h-4 text-cyan-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
            Secure Vault
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 px-4 max-w-xs">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Status indicators */}
        <div className="ml-auto flex items-center gap-4 px-4 text-[10px] text-slate-700 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            AES-256
          </span>
          <span className="hidden sm:block">
            {totalFiles} files · {totalFolders} folders
          </span>
          <span className="hidden md:block text-slate-800">
            {clock.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>
      </header>

      {/* ── Main layout  */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left accent strip */}
        <div className="w-1 bg-gradient-to-b from-cyan-500/30 via-cyan-500/10 to-transparent flex-shrink-0" />

        {/* ── File tree panel  */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-vault-600">
          {/* Panel header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-vault-600 flex-shrink-0">
            <div className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 text-slate-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                File Explorer
              </span>
            </div>
            {searchQuery && (
              <span className="text-[10px] text-cyan-600 font-mono">
                Filtering: "{searchQuery}"
              </span>
            )}
          </div>

          {/* Tree */}
          <FileExplorer
            data={rawData}
            searchQuery={searchQuery}
            selectedId={selected?.id}
            focusedId={focusedId}
            onSelect={setSelected}
            onFocusChange={setFocusedId}
            onContextMenu={handleContextMenu}
          />

          {/* Keyboard shortcuts hint */}
          <KeyboardHint />
        </div>

        {/* ── Properties panel  */}
        <div className="w-64 flex-shrink-0 bg-vault-800 overflow-hidden">
          <PropertiesPanel node={selected} allData={rawData} />
        </div>
      </div>

      {/* ── Context menu  */}
      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onCopyPath={handleCopyPath}
          onExpandAll={() => {}}
          onCollapseAll={() => {}}
        />
      )}

      {/* ── Toast notification  */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 bg-vault-800 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono px-4 py-2.5 rounded-lg shadow-2xl z-[9999] toast-in max-w-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
