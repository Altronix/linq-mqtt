import { EventEmitter } from 'events'
import Server from 'aedes'
import mqtt from 'mqtt'
import { createServer } from 'net'

const ATX_TOPIC = 'ATX/linq'
const BROKER_URL = 'mqtt://localhost:1883'
const MQTT_PORT = 1883

const broker = createServer(Server().handle)

export declare interface LinqMQTT {
  on(event: 'message', listener: (msg: object) => void): this
}

export class LinqMQTT extends EventEmitter {
  devices: Map<string, object>
  constructor(port: number = MQTT_PORT) {
    super()
    this.devices = new Map()
    this.start(port)
  }

  async start(port: number) {
    await broker.listen(MQTT_PORT, () => {
      console.log(`Aedes broker listening on port ${MQTT_PORT}`)
    })

    const client = mqtt.connect(BROKER_URL)

    client.on('connect', (ack) => {
      console.log('Local client connected to Aedes broker.')

      client.subscribe(ATX_TOPIC, (err) => {
        if (err) {
          console.log(err)
        }
      })

      client.on('message', (topic, message) => {
        if (topic === ATX_TOPIC) {
          this.emit('message', message)
        }
      })
    })
  }

  get_devices() {
    let arr: object[] = []
    for (let value of this.devices.values()) {
      arr.push(value)
    }
    return arr
  }

  clear() {
    this.devices.clear()
  }
}
