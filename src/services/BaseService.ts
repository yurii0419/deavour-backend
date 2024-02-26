import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import db from '../models'

dayjs.extend(utc)

const includeCompany = [
  'Address', 'CostCenter', 'Product',
  'Order', 'AccessPermission', 'PendingOrder'
]
const withoutUser = [
  'BundleItem', 'Salutation', 'Picture',
  'SecondaryDomain', 'LegalText', 'ShippingMethod',
  'GreetingCard', 'CampaignShippingDestination', 'CampaignOrderLimit',
  'EmailTemplate', 'EmailTemplateType', 'BlockedDomain', 'CampaignAddress',
  'MaintenanceMode', 'CompanySubscription'
]

const includeCompanyAndOwner = {
  model: db.Company,
  attributes: ['id', 'customerId', 'name', 'suffix', 'email', 'phone', 'vat', 'domain', 'isDomainVerified'],
  as: 'company',
  include: [
    {
      model: db.User,
      attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'photo', 'updatedAt', 'createdAt'],
      as: 'owner'
    }
  ]
}

export const generateInclude = (model: string): any => {
  const nowEndOfDay = dayjs().utc().endOf('day').toDate()
  if (model === 'Company') {
    return (
      [
        {
          model: db.User,
          attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'photo', 'updatedAt', 'createdAt'],
          as: 'owner'
        },
        {
          model: db.Address,
          attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type', 'updatedAt', 'createdAt'],
          as: 'addresses'
        },
        {
          model: db.SecondaryDomain,
          attributes: ['id', 'name', 'isVerified', 'updatedAt', 'createdAt'],
          as: 'secondaryDomains'
        },
        {
          model: db.AccessPermission,
          attributes: { exclude: ['companyId', 'deletedAt'] },
          as: 'accessPermissions'
        },
        {
          model: db.CompanySubscription,
          attributes: { exclude: ['companyId', 'deletedAt'] },
          as: 'subscriptions',
          where: {
            paymentStatus: 'paid',
            endDate: {
              [Op.gte]: nowEndOfDay
            }
          },
          required: false
        }
      ]
    )
  }
  if (includeCompany.includes(model)) {
    return (
      [
        includeCompanyAndOwner
      ]
    )
  }

  if (model === 'Campaign') {
    return (
      [
        includeCompanyAndOwner,
        {
          model: db.CardTemplate,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'cardTemplates'
        },
        {
          model: db.CardSetting,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'cardSetting'
        },
        {
          model: db.CampaignOrderLimit,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'campaignOrderLimits'
        },
        {
          model: db.CampaignShippingDestination,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'campaignShippingDestinations'
        },
        {
          model: db.CampaignAddress,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'campaignAddresses'
        }
      ]
    )
  }

  if (model === 'Recipient' || model === 'CardTemplate' || model === 'CampaignAddress') {
    return ([
      {
        model: db.Campaign,
        as: 'campaign',
        include: [
          includeCompanyAndOwner
        ]
      }
    ])
  }
  if (model === 'Bundle') {
    return ([
      {
        model: db.Campaign,
        attributes: ['id', 'name', 'status', 'type', 'description', 'updatedAt', 'createdAt'],
        as: 'campaign'
      },
      {
        model: db.Picture,
        attributes: ['id', 'filename', 'url', 'size', 'mimeType', 'updatedAt', 'createdAt'],
        as: 'pictures'
      }
    ])
  }
  if (model === 'EmailTemplate') {
    return ([
      {
        model: db.EmailTemplateType,
        attributes: ['id', 'name', 'description', 'placeholders', 'updatedAt', 'createdAt'],
        as: 'emailTemplateType'
      }
    ])
  }
  if (withoutUser.includes(model)) {
    return ([])
  }
  return (
    [
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
      }
    ]
  )
}

export function generateShippingAddressFilterQuery (filter: object): object {
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

export function generateFilterQuery (filter: object): object {
  const filterQuery: Record<string, unknown> = {}

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      filterQuery[key] = {
        [Op.eq]: value
      }
    }
  })

  return filterQuery
}

class BaseService {
  model: any

  constructor (model: any) {
    this.model = model
  }

  singleRecord (): string {
    return `${String(this.model.charAt(0).toLowerCase())}${String(this.model.slice(1))}`
  }

  manyRecords (): string {
    return `${String(this.model.charAt(0).toLowerCase())}${String(this.model.slice(1))}s`
  }

  async findById (id: string, paranoid = true): Promise<any> {
    const excluded = this.model === 'User' ? [] : ['userId']
    const included = (this.model === 'User')
      ? [
          {
            model: db.Company,
            attributes: ['id', 'customerId', 'name', 'suffix', 'email', 'phone', 'vat', 'domain', 'isDomainVerified'],
            as: 'company',
            include: [
              {
                model: db.Address,
                attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type'],
                as: 'addresses'
              },
              {
                model: db.User,
                attributes: ['id', 'firstName', 'lastName', 'email'],
                as: 'owner'
              }
            ]
          },
          {
            model: db.Address,
            attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type'],
            as: 'addresses'
          }
        ]
      : generateInclude(this.model)

    const record = await db[this.model].findOne({
      attributes: { exclude: [...excluded] },
      include: included,
      where: {
        id
      },
      paranoid
    })

    return record
  }

  async get (id: string): Promise<any> {
    const record = await this.findById(id)
    return record.toJSONFor()
  }

  async getAll (limit: number, offset: number): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async insert (data: any): Promise<any> {
    // Add code to check if record exists to make it idempotent ********************
    const record = await db[this.model].create({ ...data, id: uuidv1() })

    return record.toJSONFor()
  }

  async update (record: any, data: any): Promise<any> {
    const updatedRecord = await record.update(data)

    return updatedRecord.toJSONFor()
  }

  async delete (record: any): Promise<any> {
    // Soft delete records
    const deletedRecord = await record.destroy()

    return deletedRecord
  }

  async purge (record: any): Promise<any> {
    // Hard delete records
    const deletedRecord = await record.destroy({
      force: true
    })

    return deletedRecord
  }
}

export default BaseService
