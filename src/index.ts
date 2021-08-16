import { EventEmitter } from 'events'
import { Aedes, Server } from 'aedes'
import mqtt, { Client } from 'mqtt'
import { createServer } from 'net'
import { Config } from './config'
import { IPublishPacket } from 'mqtt-packet'
/*const aedes = require('aedes')()*/

const UPDATE_FW_TOPIC =
  'linq/eflow61/feeegbgrwgvsfufendntbsaciaigekeelvi-exhx-w8a/update'

const MQTT_PORT = Config.port.mqtt
const BROKER_URL = `mqtt://localhost:${MQTT_PORT}`

const broker = createServer(Server().handle)

export declare interface LinqMQTT {
  on(event: 'status', listener: (msg: string) => void): this
  on(event: 'alert', listener: (msg: string) => void): this
  on(event: 'update', listener: (msg: string) => void): this
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
        if (topic === Config.topic.update) {
          let str = message.toString().trim()
          try {
            this.emit('update', str)
          } catch (err) {
            console.log(err)
          }
        }
        //test

        client.publish(
          UPDATE_FW_TOPIC,
          '=>DYNAMIC_TOPIC_TEST',
          { qos: 0 },
          () => {
            console.log('QOS =1 CALLBACK \r\n')
          }
        )

        //test

        // aedes publish test
        /*
        aedes.publish({
          topic: UPDATE_FW_TOPIC,
          payload: '=>AEDES_PUBLISH_TEST' + aedes.id
        })
        */
        // aedes publish test
      })
    })

    /*
    aedes.on('publish', async function (packet: IPublishPacket, client: Aedes) {
      console.log(
        'Client \x1b[31m' +
          (client ? client.id : 'BROKER_' + aedes.id) +
          '\x1b[0m has published',
        packet.payload.toString(),
        'on',
        packet.topic,
        'to broker',
        aedes.id
      )
    })
    */
  }
}
