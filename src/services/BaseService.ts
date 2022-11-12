import { v1 as uuidv1 } from 'uuid'
import db from '../models'

export const generateInclude = (model: string): any => {
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
          attributes: ['id', 'country', 'city', 'street', 'zip', 'updatedAt', 'createdAt'],
          as: 'address'
        }
      ]
    )
  }
  if (model === 'Campaign' || model === 'Address') {
    return (
      [
        {
          model: db.Company,
          attributes: ['id', 'name', 'email', 'phone', 'vat'],
          as: 'company',
          include: [
            {
              model: db.User,
              attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'photo', 'updatedAt', 'createdAt'],
              as: 'owner'
            }
          ]
        }
      ]
    )
  }
  if (model === 'Recipient') {
    return ([
      {
        model: db.Campaign,
        as: 'campaign',
        include: [
          {
            model: db.Company,
            attributes: ['id', 'name', 'email', 'phone', 'vat'],
            as: 'company',
            include: [
              {
                model: db.User,
                attributes: ['id', 'firstName', 'lastName', 'username', 'email', 'photo', 'updatedAt', 'createdAt'],
                as: 'owner'
              }
            ]
          }
        ]
      }
    ])
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
            attributes: ['id', 'country', 'city', 'street', 'zip'],
            as: 'address'
          }
        ]
      }
    ]
  )
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
            attributes: ['id', 'name', 'email', 'phone', 'vat'],
            as: 'company',
            include: [
              {
                model: db.Address,
                attributes: ['id', 'country', 'city', 'street', 'zip'],
                as: 'address'
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
            attributes: ['id', 'country', 'city', 'street', 'zip'],
            as: 'address'
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
