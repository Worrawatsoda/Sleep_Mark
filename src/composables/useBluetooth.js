import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { DEVICE_NAME, SERVICE_UUID, TX_CHAR_UUID } from '../constants/ble.js'
import { saveReading, pruneReadings } from '../utils/db.js'

const IS_NATIVE = Capacitor.isNativePlatform()

// ── Chunk buffer ──────────────────────────────────────────────────────────────
function makeBuffer(onData) {
  let buf = ''
  return {
    push(chunk) {
      buf += chunk
      const end = buf.lastIndexOf('}')
      if (end === -1) return
      const frame = buf.slice(0, end + 1)
      buf = buf.slice(end + 1)
      try {
        const data = JSON.parse(frame)
        onData(data)
        saveReading(data).then(() => pruneReadings(200)).catch(console.warn)
      } catch {
        buf = frame + buf
      }
    },
    clear() { buf = '' },
  }
}

// ── Native path (Capacitor) ───────────────────────────────────────────────────
async function nativeConnect(buffer, onDisconnect) {
  const { BleClient, dataViewToText } = await import('@capacitor-community/bluetooth-le')
  await BleClient.initialize()
  const device = await BleClient.requestDevice({ services: [SERVICE_UUID] })
  await BleClient.connect(device.deviceId, () => onDisconnect())
  await BleClient.startNotifications(
    device.deviceId, SERVICE_UUID, TX_CHAR_UUID,
    (dv) => buffer.push(dataViewToText(dv))
  )
  return {
    async cleanup() {
      try {
        await BleClient.stopNotifications(device.deviceId, SERVICE_UUID, TX_CHAR_UUID)
        await BleClient.disconnect(device.deviceId)
      } catch { /* ignore */ }
    },
  }
}

// ── Web path (Web Bluetooth API) ──────────────────────────────────────────────
async function webConnect(buffer, onDisconnect) {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth not supported. Use Chrome or Edge on HTTPS / localhost.')
  }
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: DEVICE_NAME }],
    optionalServices: [SERVICE_UUID],
  })
  device.addEventListener('gattserverdisconnected', () => onDisconnect())
  const server  = await device.gatt.connect()
  const service = await server.getPrimaryService(SERVICE_UUID)
  const char    = await service.getCharacteristic(TX_CHAR_UUID)
  const handler = (e) => buffer.push(new TextDecoder().decode(e.target.value))
  await char.startNotifications()
  char.addEventListener('characteristicvaluechanged', handler)
  return {
    async cleanup() {
      try {
        char.removeEventListener('characteristicvaluechanged', handler)
        await char.stopNotifications()
        device.gatt.disconnect()
      } catch { /* ignore */ }
    },
  }
}

// ── Composable ────────────────────────────────────────────────────────────────
export function useBluetooth(onData) {
  const status = ref('disconnected') // 'disconnected' | 'connecting' | 'connected'
  const error  = ref(null)
  let session  = null
  let buffer   = null

  async function connect() {
    status.value = 'connecting'
    error.value  = null
    buffer = makeBuffer(onData)

    const onDisconnect = () => {
      buffer?.clear()
      session = null
      status.value = 'disconnected'
    }

    try {
      session = IS_NATIVE
        ? await nativeConnect(buffer, onDisconnect)
        : await webConnect(buffer, onDisconnect)
      status.value = 'connected'
    } catch (err) {
      buffer.clear()
      status.value = 'disconnected'
      if (err.name !== 'NotFoundError' && !err.message?.includes('cancelled')) {
        error.value = err.message || 'Connection failed.'
      }
    }
  }

  async function disconnect() {
    buffer?.clear()
    await session?.cleanup()
    session = null
    status.value = 'disconnected'
  }

  return { status, error, connect, disconnect, isNative: IS_NATIVE }
}
