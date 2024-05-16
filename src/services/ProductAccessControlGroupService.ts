import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductAccessControlGroupService extends BaseService {
  manyRecords (): string {
    return 'productAccessControlGroups'
  }

  recordName (): string {
    return 'Product Access Control Group'
  }

  async getAll (limit: number, offset: number): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      include: [
        {
          model: db.ProductCategoryTag,
          as: 'productCategoryTags',
          attributes: ['id', 'name', 'type'],
          through: {
            attributes: []
          }
        },
        {
          model: db.User,
          as: 'users',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: {
            attributes: []
          }
        },
        {
          model: db.Company,
          as: 'companies',
          attributes: ['id', 'name', 'email', 'domain'],
          through: {
            attributes: []
          }
        }
      ]
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async insert (data: any): Promise<any> {
    const { productAccessControlGroup } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productAccessControlGroup.name
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productAccessControlGroup })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productAccessControlGroup, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductAccessControlGroupService
