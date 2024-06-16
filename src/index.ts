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

/**
 * Retrieves the IAM policy for a given project.
 * @param projectId - The ID of the project.
 * @returns A Promise that resolves to the IAM policy.
 */
async function getIamPolicy(projectId: string) {
  // Instantiates a client
  const projectsClient = new ProjectsClient()

  // Gets the IAM policy for the project
  return await projectsClient.getIamPolicy({
    resource: `projects/${projectId}`,
  })
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

    // get IAM policy
    const policy = await getIamPolicy(projectId)
    console.debug(policy)
  })
})
