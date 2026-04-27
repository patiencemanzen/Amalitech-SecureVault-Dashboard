import { useEffect, useRef } from "react";

/**
 * ContextMenu — The Wildcard Feature
 */
export default function ContextMenu({
  menu,
  onClose,
  onCopyPath,
  onExpandAll,
  onCollapseAll,
}) {
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("contextmenu", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("contextmenu", handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const { x, y, node, expandAll, collapseAll } = menu;
  const isFolder = node.type === "folder";

  // Keep menu inside viewport
  const menuW = 200;
  const menuH = isFolder ? 124 : 48;
  const safeX = Math.min(x, window.innerWidth - menuW - 8);
  const safeY = Math.min(y, window.innerHeight - menuH - 8);

  const items = [
    {
      icon: "📋",
      label: "Copy Path",
      action: () => onCopyPath(node),
      shortcut: "",
    },
    isFolder && {
      icon: "📂",
      label: "Expand All",
      action: () => {
        expandAll(node);
        onClose();
      },
      shortcut: "",
    },
    isFolder && {
      icon: "📁",
      label: "Collapse",
      action: () => {
        collapseAll(node);
        onClose();
      },
      shortcut: "",
    },
  ].filter(Boolean);

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left: safeX, top: safeY, zIndex: 9000 }}
      className="bg-vault-800 border border-vault-600 rounded-lg shadow-2xl shadow-black/60 py-1 min-w-[180px] fade-in"
    >
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-vault-600">
        <p className="text-[10px] font-mono text-slate-600 truncate max-w-[160px]">
          {node.name}
        </p>
      </div>

      {/* Actions */}
      {items.map((item, i) => (
        <button
          key={i}
          onClick={item.action}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-vault-600 hover:text-white transition-colors text-left"
        >
          <span>{item.icon}</span>
          <span className="flex-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
