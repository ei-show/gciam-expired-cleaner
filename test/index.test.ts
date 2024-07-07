/**
 * テスト項目
 * 1. 環境変数が空値の場合、エラーを返すこと
 * 2. 環境変数が未定義の場合、エラーを返すこと
 * 3. 環境変数が文字列の場合、文字列を返すこと
 * 4. IAMポリシーを取得する際に、プロジェクトIDが無効ば場合、エラーを返すこと
 * 5. IAMポリシーを取得する際に、プロジェクトIDが有効な場合、IAMポリシーを取得できること
 * 6. IAMポリシーを取得する際に、プロジェクトIDが有効な場合、取得したIAMポリシーのconditionのtimestampが現在の日時よりも新しい場合、IAMポリシーを削除しないこと
 * 7. IAMポリシーを取得する際に、プロジェクトIDが有効な場合、取得したIAMポリシーのconditionのtimestampが現在の日時よりも古い場合、IAMポリシーを削除すること
 */

import { getProjectIds, getIamPolicy } from '../src/index'
import { ProjectsClient } from '@google-cloud/resource-manager'
describe('getProjectIds', () => {
  it('環境変数が空値の場合、エラーを返すこと', () => {
    process.env.GCP_PROJECT_IDS = ''
    expect(() => getProjectIds()).toThrow(new Error('GCP_PROJECT_IDS is not set'))
  })

  it('環境変数が未定義の場合、エラーを返すこと', () => {
    delete process.env.GCP_PROJECT_IDS
    expect(() => getProjectIds()).toThrow(Error)
  })

  it('環境変数が文字列の場合、文字列を返すこと', () => {
    process.env.GCP_PROJECT_IDS = 'project1,project2,project3'
    expect(getProjectIds()).toEqual(process.env.GCP_PROJECT_IDS)
  })
})

describe('getIamPolicy', () => {
  let projectClient: ProjectsClient
  const projectId = 'test-project-id'

  it('should throw an error if failed to get IAM policy', async () => {
    jest.spyOn(projectClient, 'getPolicy').mockRejectedValueOnce(new Error('Failed to get IAM policy'))

    await expect(getIamPolicy(projectClient, projectId)).rejects.toThrow(new Error('Failed to get IAM policy'))
  })

  it('should get IAM policy if project ID is valid', async () => {
    const iamPolicy = { bindings: [] }
    jest.spyOn(projectClient, 'getPolicy').mockResolvedValueOnce([iamPolicy])

    const result = await getIamPolicy(projectClient, projectId)

    expect(result).toEqual(iamPolicy)
  })
})