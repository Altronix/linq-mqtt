import { EventEmitter } from 'events'
import Server from 'aedes'
import mqtt from 'mqtt'
import { createServer } from 'net'

const STATUS_TOPIC = 'linq/status'
const ALERT_TOPIC = 'linq/alert'
const MQTT_PORT = 1883 /* Default non-tls port */
const BROKER_URL = `mqtt://localhost:${MQTT_PORT}`

const broker = createServer(Server().handle)

export declare interface LinqMQTT {
  on(event: 'status', listener: (msg: string) => void): this
  on(event: 'alert', listener: (msg: string) => void): this
}

export class LinqMQTT extends EventEmitter {
  constructor(port: number = MQTT_PORT) {
    super()
    this.start(port)
  }

  async start(port: number) {
    await broker.listen(MQTT_PORT, () => {
      console.log(`Aedes broker listening on port ${MQTT_PORT}`)
    })

    const client = mqtt.connect(BROKER_URL)

    client.on('connect', (ack) => {
      console.log('Local client connected to Aedes broker.')

      client.subscribe(STATUS_TOPIC, (err) => {
        if (err) {
          console.log(err)
        }
      })

      client.on('message', (topic, message) => {
        if (topic === STATUS_TOPIC) {
          let str = message.toString().trim()
          try {
            //let obj = JSON.parse(str)
            this.emit('status', str)
          } catch (err) {
            console.log(err)
          }
        }
        if (topic === ALERT_TOPIC) {
          let str = message.toString().trim()
          try {
            this.emit('alert', str)
          } catch (err) {
            console.log(err)
          }
        }
      })
    })
  }
}
