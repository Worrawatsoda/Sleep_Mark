import { useState, useCallback, useRef } from 'react'
import { DEVICE_NAME, SERVICE_UUID, TX_CHAR_UUID } from '../constants/ble.js'
import { saveReading, pruneReadings } from '../utils/db.js'

export function useBluetooth(onData) {
  const [status, setStatus] = useState('disconnected') // 'disconnected' | 'connecting' | 'connected'
  const [error,  setError]  = useState(null)
  const deviceRef = useRef(null)
  const charRef   = useRef(null)
  const bufRef    = useRef('') // accumulates BLE packet chunks until a full JSON frame arrives

  const handleNotification = useCallback(
    (event) => {
      const chunk = new TextDecoder('utf-8').decode(event.target.value)
      bufRef.current += chunk

      // JSON frames terminate with '}' — flush everything up to the last complete object
      const end = bufRef.current.lastIndexOf('}')
      if (end === -1) return

      const frame = bufRef.current.slice(0, end + 1)
      bufRef.current = bufRef.current.slice(end + 1)

      try {
        const data = JSON.parse(frame)
        onData(data)
        saveReading(data).then(() => pruneReadings(200)).catch(console.warn)
      } catch {
        // Malformed or partial frame — put it back and wait for the next chunk
        bufRef.current = frame + bufRef.current
      }
    },
    [onData]
  )

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Web Bluetooth is not supported. Use Chrome or Edge on HTTPS / localhost.')
      return
    }
    setStatus('connecting')
    setError(null)

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters:          [{ name: DEVICE_NAME }],
        optionalServices: [SERVICE_UUID],
      })
      deviceRef.current = device

      device.addEventListener('gattserverdisconnected', () => {
        setStatus('disconnected')
        charRef.current = null
        bufRef.current  = ''
      })

      const server  = await device.gatt.connect()
      const service = await server.getPrimaryService(SERVICE_UUID)
      const char    = await service.getCharacteristic(TX_CHAR_UUID)
      charRef.current = char

      await char.startNotifications()
      char.addEventListener('characteristicvaluechanged', handleNotification)
      setStatus('connected')
    } catch (err) {
      setStatus('disconnected')
      // NotFoundError = user cancelled the device picker — not an actionable error
      if (err.name !== 'NotFoundError') {
        setError(err.message || 'Connection failed.')
      }
    }
  }, [handleNotification])

  const disconnect = useCallback(async () => {
    if (charRef.current) {
      try {
        charRef.current.removeEventListener('characteristicvaluechanged', handleNotification)
        await charRef.current.stopNotifications()
      } catch { /* ignore — device may already be gone */ }
      charRef.current = null
    }
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect()
    }
    bufRef.current = ''
    setStatus('disconnected')
  }, [handleNotification])

  return { status, error, connect, disconnect }
}
