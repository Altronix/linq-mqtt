import { EventEmitter } from 'events'
import { Server } from 'aedes'
import mqtt from 'mqtt'
import { createServer } from 'net'
import { Config } from './config'

const MQTT_PORT = Config.port.mqtt
const BROKER_URL = `mqtt://localhost:${MQTT_PORT}`

const client = mqtt.connect(BROKER_URL)
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

    client.on('connect', (ack) => {
      console.log('Local client connected to Aedes broker.')

      client.subscribe(Config.topic.status, (err) => {
        if (err) {
          console.log(err)
        }
      })

      client.subscribe(Config.topic.alert, (err) => {
        if (err) {
          console.log(err)
        }
      })

      client.subscribe(Config.topic.update, (err) => {
        if (err) {
          console.log(err)
        }
      })

      client.on('message', (topic, message) => {
        if (topic === Config.topic.status) {
          let str = message.toString().trim()
          try {
            this.emit('status', str)
          } catch (err) {
            console.log(err)
          }
        }
        if (topic === Config.topic.alert) {
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

  publish(topic_name: string, payload: string) {
    return new Promise<string>((resolve, reject) => {
      client.publish(topic_name, payload, { qos: 0 }, () => {
        client.on('message', (topic, message) => {
          if (topic === Config.topic.update) {
            let str = message.toString().trim()
            try {
              resolve(str)
            } catch (err) {
              console.log(err)
            }
          }
        })
      })
    })
  }
}
