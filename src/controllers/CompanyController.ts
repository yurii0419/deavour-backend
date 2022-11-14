import BaseController from './BaseController'
import CompanyService from '../services/CompanyService'
import UserService from '../services/UserService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
import AddressService from '../services/AddressService'
import { sendNotifierEmail } from '../utils/sendMail'

const companyService = new CompanyService('Company')
const userService = new UserService('User')
const addressService = new AddressService('Address')

const appName = String(process.env.APP_NAME)
const appUrl = String(process.env.APP_URL)
const mailer = String(process.env.MAILER_EMAIL)

class CompanyController extends BaseController {
  checkOwnerOrCompanyAdministratorOrCampaignManager (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: company } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]

    const isOwner = currentUser.id === company?.owner?.id
    const isEmployee = currentUser?.companyId === company?.id

    if (isOwner || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, company administrator or campaign manager can perform this action'
        }
      })
    }
  }

  checkOwnerOrCompanyAdministrator (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: company } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR]

    const isOwner = currentUser.id === company?.owner?.id
    const isEmployee = currentUser?.companyId === company?.id

    if (isOwner || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner or company administrator can perform this action'
        }
      })
    }
  }

  checkCompanyDomainAndEmailDomain (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { body: { company } } = req

    const { domain, email } = company

    const emailDomain = email.split('@').pop()

    if (domain !== undefined && domain !== emailDomain) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'The email domain and the company domain do not match'
        }
      })
    }

    return next()
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, body: { company } } = req

    const { response, status } = await companyService.insert({ user, company })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      company: response
    })
  }

  async getAllUsers (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, params: { id: companyId } } = req
    const records = await companyService.getAllUsers(limit, offset, companyId)
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
      users: records.rows
    })
  }

  async updateUserRole (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, record: company, params: { id: companyId, userId }, body: { user: { role } } } = req

    const allowedRoles = [userRoles.ADMIN, userRoles.COMPANYADMINISTRATOR]
    const isCompanyOwner = currentUser.id === company?.owner?.id

    if (userId === currentUser.id) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot update your own role'
        }
      })
    }

    const userToUpdate = await userService.findById(userId)

    if (userToUpdate === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `${String(userService.model)} not found`
        }
      })
    }

    if (userToUpdate.role === userRoles.ADMIN) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot update the role of an administrator'
        }
      })
    }

    const userToUpdateIsCompanyEmployee = userToUpdate?.company?.id === companyId
    const currentUserIsCompanyEmployee = currentUser?.company?.id === companyId

    if (userToUpdateIsCompanyEmployee &&
      ((currentUserIsCompanyEmployee && allowedRoles.includes(currentUser.role)) || isCompanyOwner)
    ) {
      const response = await userService.update(userToUpdate, { role, logoutTime: Date() })

      const subject = `You have been granted a new user role by ${String(currentUser.firstName)} ${String(currentUser.lastName)} at ${String(company.name)}`

      const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      </p>
      `

      const message = `<p>Hello,</p>
      <p>You have been granted a new user role by ${String(currentUser.firstName)} ${String(currentUser.lastName)} at ${appUrl}.<p>
      <p>Please login to your account.</p>
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

      await sendNotifierEmail(userToUpdate.email, subject, message, false, message)

      return res.status(statusCodes.OK).send({
        statusCode: statusCodes.OK,
        success: true,
        user: response
      })
    }

    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'Only an admin, the owner or company administrator can perform this action'
      }
    })
  }

  async createAddress (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { address } } = req

    const { response, status } = await addressService.insert({ user: null, company, address })

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

export default new CompanyController(companyService)
