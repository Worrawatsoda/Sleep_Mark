import React from 'react'

export function OfflineIndicator({ show, lastUpdated }) {
  if (!show) return null

  const timeStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="flex items-center gap-2 px-3 py-2 mt-3 bg-amber-50 border border-amber-200/80 rounded-xl">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
      <p className="text-xs text-amber-700">
        Offline — showing cached data
        {timeStr && <span className="text-amber-500"> · last at {timeStr}</span>}
      </p>
    </div>
  )
}
