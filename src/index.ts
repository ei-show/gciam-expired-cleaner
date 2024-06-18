import * as ff from '@google-cloud/functions-framework'
import { ProjectsClient } from '@google-cloud/resource-manager'

/**
 * Represents the data structure of a Pub/Sub message.
 */
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
  // debug
  console.debug(ce)
  console.debug(process.env)

  // get project id
  const projectIds: string | undefined = process.env.GCP_PROJECT_IDS
  if (!projectIds) {
    console.error('GCP_PROJECT_IDS is not set')
    return
  }
  console.debug(projectIds)

  const projectIdList = projectIds.split(',')
  projectIdList.forEach(async (projectId) => {

    // create client
    const projectsClient = new ProjectsClient()

    // get IAM policy
    const oldBindings = await projectsClient.getIamPolicy({
      resource: `projects/${projectId}`,
      options: {
        requestedPolicyVersion: 3,
      },
    })
    console.debug(oldBindings[0].bindings)

    // get Date
    const toDate = new Date()
    console.debug(toDate)

    // 次のtimestampが現在の日時よりも前の場合、IAMポリシーを削除する
    // sample: { condition: { expression: 'request.time < timestamp("2021-09-30T00:00:00Z")' } }
    const newBindings = oldBindings[0].bindings?.filter((binding) => {
      if (binding.condition?.expression) {
        const timestamp = binding.condition.expression.match(/request.time < timestamp\("(.*)"\)/)
        if (timestamp) {
          const toDateTimestamp = toDate.getTime()
          const conditionTimestamp = new Date(timestamp[1]).getTime()
          return toDateTimestamp < conditionTimestamp
        }
      }
      return true
    })
    console.debug(newBindings)

    // set IAM policy
    // await projectsClient.setIamPolicy({
    //   resource: `projects/${projectId}`,
    //   policy: {
    //     bindings: newBindings,
    //   },
    // })

  })

})
