/**
 * Represents the data structure of a Pub/Sub message.
 */
import * as ff from '@google-cloud/functions-framework'
import { ProjectsClient } from '@google-cloud/resource-manager'

type PubSubData = {
  subscription: string
  message: {
    messageId: string
    publishTime: string
    data: string
    attributes?: { [key: string]: string }
  }
}

/**
 * Retrieves the project IDs from the environment variable.
 * @returns The project IDs.
 * @throws Error if the GCP_PROJECT_IDS environment variable is not set.
 */
export const getProjectIds = (): string => {
  const projectIds: string | undefined = process.env.GCP_PROJECT_IDS
  if (!projectIds) {
    throw new Error('GCP_PROJECT_IDS is not set')
  }
  return projectIds
}

/**
 * Get IAM policy
 * @param projectClient
 * @param projectId
 * @returns IAM policy
 * @throws Error if failed to get IAM policy
 */
export const getIamPolicy = async (projectClient: ProjectsClient, projectId: string) => {
  const request = {
    resource: `projects/${projectId}`,
    options: {
      requestedPolicyVersion: 3,
    },
  }
  const response = await projectClient.getIamPolicy(request)
  if (!response[0].bindings) {
    throw new Error('Failed to get IAM policy')
  }
  return response[0]
}


ff.cloudEvent<PubSubData>('MainFunction', (ce) => {
  // debug
  console.debug(ce)
  console.debug(process.env)

  // get project id
  const projectIds = getProjectIds()
  console.debug(projectIds)

  // Instantiates a client
  const projectsClient = new ProjectsClient()

  const projectIdList = projectIds.split(',')
  projectIdList.forEach(async (projectId) => {
    // get IAM policy
    const oldPolicy = await getIamPolicy(projectsClient, projectId)
    console.debug(oldPolicy.bindings)

    // get Date
    const toDate = new Date()
    console.debug(toDate)

    // 次のtimestampが現在の日時よりも前の場合、IAMポリシーを削除する
    // sample: { condition: { expression: 'request.time < timestamp("2021-09-30T00:00:00Z")' } }
    const newBindings = oldPolicy.bindings?.filter((binding) => {
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

    // Create request
    const request = {
      resource: `projects/${projectId}`,
      policy: {
        bindings: newBindings,
        version: 3,
      },
      updateMask: {
        paths: ['bindings'],
      },
    }

    // set IAM policy
    try {
      await projectsClient.setIamPolicy(request)
    } catch (e) {
      throw new Error(`setIamPolicy: ${e}`)
    }
  })
})
