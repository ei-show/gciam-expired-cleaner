// Environment
import { getProjectIds } from '../src/index'
describe('getProjectIds', () => {
  it('should throw an error if GCP_PROJECT_IDS environment variable is an empty string', () => {
    process.env.GCP_PROJECT_IDS = ''
    expect(() => getProjectIds()).toThrow(new Error('GCP_PROJECT_IDS is not set'))
  })

  it('should throw an error if GCP_PROJECT_IDS environment variable is not defined', () => {
    delete process.env.GCP_PROJECT_IDS
    expect(() => getProjectIds()).toThrow(Error)
  })

  it('should return the project IDs if GCP_PROJECT_IDS environment variable is set', () => {
    process.env.GCP_PROJECT_IDS = 'project1,project2,project3'
    expect(getProjectIds()).toEqual(process.env.GCP_PROJECT_IDS)
  })
})
