import React from 'react'

export function BluetoothConnect({ status, error, onConnect, onDisconnect }) {
  const connected = status === 'connected'
  const connecting = status === 'connecting'

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={connected ? onDisconnect : onConnect}
        disabled={connecting}
        aria-label={connected ? 'Disconnect BLE device' : 'Connect BLE device'}
        className={[
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 select-none',
          connected
            ? 'bg-[#E8F7F2] text-[#085041] border border-[#1D9E75]/40'
            : connecting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-[#1D9E75] text-white shadow-md active:scale-95',
        ].join(' ')}
      >
        <BluetoothIcon connected={connected} connecting={connecting} />
        <span className="whitespace-nowrap">
          {connecting ? 'Scanning…' : connected ? 'Connected' : 'Connect'}
        </span>
      </button>

      {error && (
        <p className="text-[11px] text-red-500 text-right max-w-[200px] leading-tight">{error}</p>
      )}
    </div>
  )
}

function BluetoothIcon({ connected, connecting }) {
  const color = connected ? '#085041' : connecting ? '#9CA3AF' : 'white'
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={connecting ? 'animate-pulse' : ''}
    >
      <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
    </svg>
  )
}
