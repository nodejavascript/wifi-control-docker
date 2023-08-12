import wifi from 'node-wifi'

import { clearStdout } from './'

const { RECHECK_TIMEOUT, WIFI_INTERFACE, AP_SSID, AP_PASSWORD } = process.env

wifi.init({
  iface: WIFI_INTERFACE
})

const debug = false

export const logs = []

export const returnLogs = (delimter = '<br>') => {
  let html = ''

  logs.forEach(log => {
    const { timestamp, status } = log
    const statuses = status.join(' ')
    html += `${timestamp}, ${statuses}`
    html += delimter
  })

  return html
}

const stdLogs = () => {
  clearStdout(process)

  const refreshSeconds = RECHECK_TIMEOUT / 1000
  const body = `Refresh seconds ${refreshSeconds}\n${returnLogs('\n')}`

  console.log(body)
}

export const startMonitor = async () => {
  logs.push(await returnAttempt())
  stdLogs()

  setInterval(async () => {
    logs.push(await returnAttempt())
    stdLogs()
  }, RECHECK_TIMEOUT)
}

const returnAttempt = async () => {
  try {
    const [isConnected, curentConnections] = await Promise.all([
      returnIsConnected(),
      wifi.getCurrentConnections()
    ])

    const attempt = returnNewAttempt()

    attempt.isConnected = isConnected
    attempt.curentConnections = curentConnections

    attempt.status.push('checking...')

    if (!isConnected) {
      attempt.status.push('try to reconnect...')
      const reconnected = await connect()
      attempt.status.push(`reconnection: ${reconnected}`)
      attempt.reconnected = reconnected
    }

    if (isConnected) {
      attempt.status.push('connected')
    }

    if (debug && isConnected) {
      attempt.status.push('try to disconnect...')
      const disconnected = await disconnect()
      attempt.status.push(`disconnection: ${disconnected}`)
      attempt.disconnected = disconnected
    }

    return attempt
  } catch (err) {
    const attempt = returnNewAttempt()

    attempt.status.push('Error')

    const message = err.message.split('Error:').pop().trim()

    attempt.status.push(message)

    return attempt
  }
}

const returnNewAttempt = () => {
  const timestamp = (new Date()).toISOString()
  const attempt = {
    timestamp,
    debug,
    status: []
  }
  return attempt
}

const returnIsConnected = async () => {
  const curentConnections = await wifi.getCurrentConnections()
  return Boolean(curentConnections.length > 0)
}

export const disconnect = () => new Promise((resolve, reject) => wifi.disconnect((err, res) => {
  if (err !== null) reject(err)
  resolve(true)
}))

export const connect = () => new Promise((resolve, reject) => wifi.connect({ ssid: AP_SSID, password: AP_PASSWORD }, (err, res) => {
  if (err !== null) reject(err)
  resolve(true)
}))

export const returnCurrentConnections = () => new Promise((resolve, reject) => wifi.getCurrentConnections((err, res) => {
  if (err !== null) reject(err)
  resolve(res)
}))

// export const returnConnect = () => new Promise((resolve, reject) => WiFiControl.connectToAP({ ssid: AP_SSID, password: AP_PASSWORD }, (err, res) => {
//   if (err !== null) reject(err)
//   resolve(res)
// }))
//
// export const returnReset = () => new Promise((resolve, reject) => WiFiControl.resetWiFi((err, res) => {
//   if (err !== null) reject(err)
//   resolve(res.success)
// }))

// rabbit holes. always returns 0
// export const returnWifiScan = () => new Promise((resolve, reject) => WiFiControl.scanForWiFi((err, res) => {
//   console.log('err', err)
//   console.log('res', res)
//
//   if (err !== null) reject(err)
//   resolve(res)
// }))
