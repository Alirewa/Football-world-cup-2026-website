import pino from 'pino'
import { env } from './env'

const isDev = env.NODE_ENV === 'development'

// PII redaction — these paths are NEVER logged
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'body.mobile',
  'body.nationalId',
  'body.national_id',
  'body.password',
  'body.code',
  '*.mobile',
  '*.nationalId',
  '*.national_id_enc',
  '*.codeHash',
  '*.code_hash',
]

function hasPinoPretty(): boolean {
  try {
    require.resolve('pino-pretty')
    return true
  } catch {
    return false
  }
}

const devTransport = isDev && hasPinoPretty()
  ? { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' } } }
  : {}

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
  ...devTransport,
  ...(!isDev ? {
    formatters: {
      level: (label: string) => ({ level: label }),
    },
  } : {}),
})

export type Logger = typeof logger
