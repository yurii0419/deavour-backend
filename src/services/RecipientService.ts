import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

class RecipientService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, recipient } = data
    let response: any

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        campaignId: campaign?.id,
        email: recipient?.email
      },
      paranoid: false
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...recipient })
      return { response: updatedResponse.toJSONFor(campaign), status: 200 }
    }

    response = await db[this.model].create({ ...recipient, id: uuidv1(), campaignId: campaign?.id })

    return { response: response.toJSONFor(campaign), status: 201 }
  }

  async getAll (limit: number, offset: number, campaignId?: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        campaignId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default RecipientService
