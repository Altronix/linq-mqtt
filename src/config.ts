export const Config = {
  port: {
    mqtt: 1883 /* Default non-tls port */,
    mqtts: 8883 /* Default tls port */
  },
  topic: {
    status: 'linq/status',
    alert: 'linq/alert',
    update: 'linq/upload/response'
  }
}
