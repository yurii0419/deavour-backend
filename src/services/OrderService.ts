import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import * as userRoles from '../utils/userRoles'

function generateFilterQuery (filter: object): object {
  const filterQuery: Record<string, unknown> = {}

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      filterQuery[`shippingAddress.${key}`] = {
        [Op.iLike]: `%${String(value)}%`
      }
    }
  })

  return filterQuery
}

class OrderService extends BaseService {
  async getAll (limit: number, offset: number, user?: any, search: string = '', filter = { firstname: '', lastname: '', email: '', city: '', country: '' }): Promise<any> {
    let records
    const allowedCompanyRoles = [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR]

    let where = generateFilterQuery(filter)
    if (search !== undefined && search !== '') {
      where = {
        [Op.and]: [
          {
            [Op.or]: [
              { 'shippingAddress.firstname': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.lastname': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.email': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.company': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.city': { [Op.iLike]: `%${search}%` } }
            ]
          },
          where
        ]
      }
    }

    if (user.role === userRoles.ADMIN) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where
      })
    } else if (allowedCompanyRoles.includes(user.role)) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          ...where,
          companyId: user.company.id
        }
      })
    } else {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          ...where,
          'shippingAddress.email': user.email
        }
      })
    }

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async insert (data: any): Promise<any> {
    const { order } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        outboundId: order.outboundId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...order })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...order, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default OrderService
