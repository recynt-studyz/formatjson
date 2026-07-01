import { ImageResponse } from 'next/og'

export const size = { width: 48, height: 48 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#60a5fa',
            fontFamily: 'monospace',
            letterSpacing: -2,
            textShadow: '0 0 8px rgba(96,165,250,0.6)',
          }}
        >
          {'{}'}
        </span>
      </div>
    ),
    { ...size }
  )
}
