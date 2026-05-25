import React from 'react'
import { scoreTier } from '../utils/scoring.js'

export function ScoreRing({ score }) {
  const SIZE   = 188
  const STROKE = 14
  const R      = (SIZE - STROKE) / 2
  const CIRC   = 2 * Math.PI * R

  const tier   = scoreTier(score)
  const offset = CIRC - (Math.min(Math.max(score, 0), 100) / 100) * CIRC

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          style={{ transform: 'rotate(-90deg)' }}
          aria-label={`Sleep score ${score} — ${tier.label}`}
        >
          {/* Track ring */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="#ECECEC" strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={tier.color}
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1), stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Centred score label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: tier.color, transition: 'color 0.4s ease' }}
          >
            {score}
          </span>
          <span className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase">
            Score
          </span>
        </div>
      </div>

      {/* Tier pill */}
      <div
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ backgroundColor: tier.bg, color: tier.color }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
        {tier.label}
      </div>
    </div>
  )
}
