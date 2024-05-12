import * as ff from '@google-cloud/functions-framework'

interface PubSubData {
  subscription: string
  message: {
    messageId: string
    publishTime: string
    data: string
    attributes?: { [key: string]: string }
  }
}

ff.cloudEvent<PubSubData>('MainFunction', (ce) => {
  console.log(ce.data?.message.data)
})
