import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BaseController from './BaseController'
import UserService from '../services/UserService'
import AddressService from '../services/AddressService'
import * as statusCodes from '../constants/statusCodes'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as userRoles from '../utils//userRoles'
import { sendNotifierEmail } from '../utils/sendMail'

dayjs.extend(utc)
const userService = new UserService('User')
const addressService = new AddressService('Address')

const appName = String(process.env.APP_NAME)
const appUrl = String(process.env.APP_URL)
const mailer = String(process.env.MAILER_EMAIL)

class UserController extends BaseController {
  async checkOwner (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { user: currentUser, params: { id } } = req

    if (currentUser.id === id) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner can perform this action'
        }
      })
    }
  }

  async checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { user: currentUser, params: { id } } = req

    if (currentUser.id === id || currentUser.role === userRoles.ADMIN) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner or admin can perform this action'
        }
      })
    }
  }

  async login (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { user: { email, password } } } = req
    const response = await userService.login(email, password)
    const statusCode = response.message === 'User not found' ? statusCodes.NOT_FOUND : statusCodes.UNAUTHORIZED

    if (response.message !== undefined) {
      return res.status(statusCode).send({
        statusCode,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      token: response.token,
      user: response.user
    })
  }

  async updateRole (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, user } = req
    const { id } = req.params
    const { role } = req.body.user

    if (user.id === id) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot update your own role'
        }
      })
    }

    const response = await userService.update(record, { role })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updatePassword (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req
    const { password, currentPassword } = req.body.user

    const response = await userService.updatePassword(record, { password, currentPassword, logoutTime: Date() })

    if (response.message !== undefined) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        user: response
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async logout (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user } = req
    await userService.logout(user.email)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: {
        email: user.email,
        message: 'You have been logged out'
      }
    })
  }

  async forgotPassword (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { email } = req.body.user

    const response = await userService.forgotPassword(email)

    if (response.message !== undefined) {
      return res.status(response.status).send({
        statusCode: response.status,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: {
        email,
        message: 'A password reset link has been sent to your email'
      }
    })
  }

  async resetPassword (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { password } = req.body.user
    const { user } = req

    const response = await userService.update(user, { password, logoutTime: Date() })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async sendVerifyEmail (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user } = req
    const response = await userService.sendVerifyEmail(user)

    if (response.message !== undefined) {
      return res.status(response.status).send({
        statusCode: response.status,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: {
        email: user.email,
        message: 'A verification code has been sent to your email'
      }
    })
  }

  async verifyEmail (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user } = req

    const response = await userService.update(user, { isVerified: true, logoutTime: Date() })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updateNotifications (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { notifications } = req.body.user
    const { user } = req

    const response = await userService.update(user, { notifications: { ...user.notifications, ...notifications } })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updateCompanyId (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      user,
      body: { user: { email, actionType, role } },
      record: { id: companyId, name, domain, isDomainVerified }
    } = req

    const emailDomain = email.split('@').pop()

    if (domain === null || domain === '') {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Add and verify a company domain first in order to perform this action'
        }
      })
    }

    if (isDomainVerified === false) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Verify the company domain first in order to perform this action'
        }
      })
    }

    if (domain !== emailDomain) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'The email domain and the company domain do not match'
        }
      })
    }

    const employee = await userService.findByEmail(email)

    if (employee === null) {
      const subject = `You have been invited by ${String(user.firstName)} ${String(user.lastName)} to create an account at ${String(name)}`

      const steps = `
      <p>Steps to register an account:</p>
      <ol>
        <li>Register an account using your email address ${String(email)} at ${appUrl}</li>
        <li>Verify your account to fully activate it.</li>
      </ol>
      `

      const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      </p>
      `

      const message = `<p>Hello,</p>
      <p>You have been invited by ${String(user.firstName)} ${String(user.lastName)} to create an account at ${appUrl}.<p>
      ${steps}
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

      await sendNotifierEmail(email, subject, message, false, message)

      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'User not found'
        }
      })
    }

    const selectedCompanyId = {
      add: companyId,
      remove: null
    }

    let updatedRole = employee.role === userRoles.USER ? userRoles.EMPLOYEE : employee.role

    if (actionType === 'remove') {
      updatedRole = userRoles.USER
    }

    if (actionType === 'add' && role !== undefined && role !== userRoles.ADMIN) {
      updatedRole = role
    }

    const response = await userService.update(employee, { companyId: selectedCompanyId[actionType], role: updatedRole, logoutTime: dayjs.utc() })

    if (actionType === 'remove') {
      response.company = null
    }

    if (actionType === 'add') {
      const subject = `You have been granted a new user role by ${String(user.firstName)} ${String(user.lastName)} at ${String(name)}`

      const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      </p>
      `

      const message = `<p>Hello,</p>
      <p>You have been granted a new user role by ${String(user.firstName)} ${String(user.lastName)} at ${appUrl}.<p>
      <p>Please login to your account.</p>
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

      await sendNotifierEmail(email, subject, message, false, message)
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset, email } = req.query
    let records: any

    if (email !== undefined) {
      records = await userService.searchUsers(limit, offset, email)
    } else {
      records = await userService.getAll(limit, offset)
    }

    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [this.service.manyRecords()]: records.rows
    })
  }

  async getMyProfile (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user } = req
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: user.toJSONFor()
    })
  }

  async getProfileById (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: { id, firstName, lastName, username, photo } } = req
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      profile: {
        id,
        firstName,
        lastName,
        username,
        photo
      }
    })
  }

  async createAddress (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: user, body: { address } } = req

    const { response, status } = await addressService.insert({ user, company: null, address })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      address: response
    })
  }
}

export default new UserController(userService)
