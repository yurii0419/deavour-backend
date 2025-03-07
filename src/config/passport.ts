import type { PassportStatic } from 'passport'
import passportJWT from 'passport-jwt'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import db from '../models'

dayjs.extend(utc)

const { ExtractJwt } = passportJWT
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY
}

const passportAuth = (passport: PassportStatic): any => {
  const now = dayjs().utc().toDate()
  const getUser = async (email: string): Promise<any> => db.User.findOne({
    attributes: { exclude: ['password'] },
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
      email
    }
  })

  const strategy = new JwtStrategy(jwtOptions, (jwtPayload, next) => {
    (async () => {
      const jwtPayloadEmail = jwtPayload.email
      if (jwtPayloadEmail === undefined) {
        next(null, false, { message: 'token not valid' })
      }
      const user = await getUser(jwtPayloadEmail)
      if (user !== null) {
        const tokenDate = new Date(jwtPayload.logoutTime)
        const type = jwtPayload.type
        const userDate = new Date(user.logoutTime)

        // Check if token is valid by comparing logoutTime time from the user and in the token
        if (tokenDate.toUTCString() === userDate.toUTCString()) {
          next(null, user, { type })
        } else {
          next(null, false, { message: 'token invalid' })
        }
      } else {
        next({ message: 'user not found' }, false, null)
      }
    })().catch((error) => {
      next(error)
    })
  })

  passport.use(strategy)
}

export default passportAuth
