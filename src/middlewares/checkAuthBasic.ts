import { Op } from 'sequelize'
import dayjs from 'dayjs'
import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'
import db from '../models'
import { decodeString } from '../utils/encryption'

const checkAuthBasic = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  // Check for the presence of a custom secret key
  const authHeader = req.headers.authorization
  const now = dayjs().utc().toDate()

  if (authHeader?.startsWith('Basic ') === true) {
    const secretKey = authHeader.split(' ')[1]
    const username = decodeString(secretKey, 'base64').split(':')[0]
    const password = decodeString(secretKey, 'base64').split(':')[1]

    db.User.findOne({
      include: [
        {
          model: db.Company,
          attributes: ['id', 'customerId', 'name', 'suffix', 'email', 'phone', 'vat', 'domain', 'isDomainVerified', 'theme', 'logo', 'shopHeader', 'defaultProductCategoriesHidden'],
          as: 'company',
          include: [
            {
              model: db.Address,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'userId', 'companyId'] },
              as: 'addresses',
              where: {
                [Op.or]: [
                  { affiliation: { [Op.eq]: null } },
                  { affiliation: 'company' }
                ]
              },
              required: false
            },
            {
              model: db.User,
              attributes: ['id', 'firstName', 'lastName', 'email'],
              as: 'owner'
            },
            {
              model: db.AccessPermission,
              attributes: { exclude: ['companyId', 'deletedAt', 'createdAt', 'updatedAt', 'isEnabled'] },
              as: 'accessPermissions',
              where: {
                isEnabled: true
              },
              required: false
            },
            {
              model: db.CompanySubscription,
              attributes: { exclude: ['companyId', 'deletedAt'] },
              as: 'subscriptions',
              where: {
                paymentStatus: 'paid',
                endDate: {
                  [Op.gte]: now
                }
              },
              required: false
            }
          ]
        },
        {
          model: db.Address,
          attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'userId', 'companyId'] },
          as: 'addresses',
          where: {
            [Op.or]: [
              { affiliation: { [Op.eq]: null } },
              { affiliation: 'personal' }
            ]
          },
          required: false
        }
      ],
      where: {
        [Op.or]: [
          { username },
          { email: username }
        ]
      }
    }).then((user: any) => {
      if (user !== null) {
        user.comparePassword(password, async (match: boolean) => {
          if (match) {
            req.user = user
            return next()
          } else {
            return res.status(statusCodes.UNAUTHORIZED).send({
              statusCode: statusCodes.UNAUTHORIZED,
              success: false,
              errors: {
                message: 'Invalid Username or Password'
              }
            })
          }
        })
      } else {
        throw new Error('Invalid Username or Password')
      }
    }).catch((error: any) => {
      return res.status(statusCodes.UNAUTHORIZED).send({
        statusCode: statusCodes.UNAUTHORIZED,
        success: false,
        errors: {
          message: error.message
        }
      })
    })
  } else {
    return res.status(statusCodes.UNAUTHORIZED).send({
      statusCode: statusCodes.UNAUTHORIZED,
      success: false,
      errors: {
        message: 'Invalid Authorization Header'
      }
    })
  }
}

export default checkAuthBasic
