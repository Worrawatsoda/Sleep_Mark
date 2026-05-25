import React from 'react'
import { AreaChart, Area, Tooltip, ResponsiveContainer, YAxis } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-2 py-1 shadow text-xs text-gray-600">
      Score: <strong className="text-[#1D9E75]">{payload[0].value}</strong>
    </div>
  )
}

export function ScoreHistory({ history }) {
  if (!history || history.length < 2) return null

  return (
    <div className="w-full" style={{ height: 60 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#1D9E75"
            strokeWidth={2}
            fill="url(#scoreGrad)"
            dot={false}
            activeDot={{ r: 3, fill: '#1D9E75' }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
