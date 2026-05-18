import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import express from 'express'
import imeiRouter from './routes/imei.ts'

const loadEnv = () => {
  const envPath = resolve(process.cwd(), '.env')

  if (!existsSync(envPath)) {
    return
  }

  const envFile = readFileSync(envPath, 'utf8')

  for (const line of envFile.split('\n')) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const [key, ...valueParts] = trimmedLine.split('=')
    const value = valueParts.join('=').replace(/^["']|["']$/g, '')

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnv()

const app = express()
const port = Number(process.env.PORT || 5174)

app.use(express.json())
app.use('/api', imeiRouter)

app.use((_request, response) => {
  response.status(404).json({
    status: 'error',
    message: 'Route not found.',
  })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`CheckSafe API proxy running at http://127.0.0.1:${port}`)
})
