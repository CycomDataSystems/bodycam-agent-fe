import { motion } from 'motion/react'
import { transitions, cn } from '@cycomdatasystems/headwindui'

/**
 * Three-dot "assistant is thinking" indicator, shown before any tokens have
 * streamed in. Deliberately NOT Tailwind's `animate-pulse` — per the CityLaw
 * NG theming brief, every Headwind animation routes through shared Motion
 * presets that collapse to `{ duration: 0 }` under `prefers-reduced-motion:
 * reduce`. A raw CSS keyframe can't honour that, so this uses
 * `transitions.pulse` directly with a keyframe array whose first and last
 * values are the resting state.
 */
export function TypingIndicator() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Assistant is typing"
      className="flex items-center gap-1.5 px-1"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn('size-2 rounded-full bg-hw-text-muted')}
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ ...transitions.pulse, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}
