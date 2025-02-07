import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductCustomisationService extends BaseService {
  async insert (data: any): Promise<any> {
    const { user, productId, productCustomisation } = data
    let response: any

    const userId = user.id

    response = await db[this.model].findOne({
      where: {
        productId
      },
      paranoid: false
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productCustomisation, userId })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productCustomisation, id: uuidv1(), userId, companyId: user?.company?.id, productId })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAllProductCustomisation (limit: number, offset: number, productId: string, user: any): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      include: [
        {
          model: db.User,
          attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'photo', 'role', 'updatedAt', 'createdAt'],
          as: 'owner',
          include: [
            {
              model: db.Address,
              attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type'],
              as: 'addresses'
            }
          ]
        },
        {
          model: db.ProductCustomisationChat,
          attributes: ['id', 'message', 'attachment'],
          include: [
            {
              model: db.User,
              attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'photo', 'role', 'updatedAt', 'createdAt'],
              as: 'owner'
            }
          ],
          as: 'chats'
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        productId,
        userId: user.id
      },
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async update (data: any): Promise<any> {
    const { user, productCustomisationId, productCustomisation } = data
    const userId = user.id

    const response = await db[this.model].findOne({
      where: {
        id: productCustomisationId
      },
      paranoid: false
    })

    const updatedRecord = await response.update(
      { ...productCustomisation, userId }
    )

    return updatedRecord
  }

  async getAllChat (productCustomisationId: string): Promise<any> {
    const records = await db.ProductCustomisationChat.findAndCountAll({
      include: {
        model: db.User,
        attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'photo', 'role', 'updatedAt', 'createdAt'],
        as: 'owner'
      },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        productCustomisationId
      },
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async insertChat (data: any): Promise<any> {
    const { user, productCustomisationChat, productCustomisationId } = data

    const userId = user.id

    const response = await db.ProductCustomisationChat.create({ ...productCustomisationChat, id: uuidv1(), userId, productCustomisationId })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductCustomisationService
