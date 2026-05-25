import React from 'react'

const DEFAULT_CUE = 'Connect your SLEEPMARK device to begin monitoring your sleep environment.'
const OPTIMAL_CUE = 'Your sleep environment is well-optimised. Good night!'

export function WellnessCue({ cue, score }) {
  const text = cue || (score >= 85 ? OPTIMAL_CUE : DEFAULT_CUE)
  const isOptimal = score >= 85

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background:   'linear-gradient(135deg, #E8F7F2 0%, #F5FBF8 100%)',
        borderColor:  '#1D9E75' + '33',
      }}
    >
      <div className="flex gap-3 items-start">
        {/* Moon icon badge */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isOptimal ? '#1D9E75' : '#085041' }}
        >
          <MoonIcon />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[10px] font-bold text-[#085041] tracking-[0.14em] uppercase">
            Sleep Tip
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
