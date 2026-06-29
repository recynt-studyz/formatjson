import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Format & Validate JSON Instantly'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          fontFamily: 'monospace, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-4px',
            marginBottom: 28,
            fontFamily: 'monospace',
          }}
        >
          {'{}'}
        </div>

        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 20,
            maxWidth: 900,
          }}
        >
          Format &amp; Validate JSON Instantly
        </div>

        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.75)',
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          Free, private, no signup — runs in your browser
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {['Free', 'Private', 'Instant', 'No Signup'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 100,
                padding: '8px 22px',
                color: 'white',
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
