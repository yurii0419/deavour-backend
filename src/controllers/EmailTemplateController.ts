import BaseController from './BaseController'
import EmailTemplateService from '../services/EmailTemplateService'
import EmailTemplateTypeService from '../services/EmailTemplateTypeService'
import type { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const emailTemplateService = new EmailTemplateService('EmailTemplate')
const emailTemplateTypeService = new EmailTemplateTypeService('EmailTemplateType')

class EmailTemplateController extends BaseController {
  async checkEmailTemplateType (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { body: { emailTemplate } } = req

    const emailTemplateType = await emailTemplateTypeService.findById(emailTemplate.emailTemplateTypeId)
    if (emailTemplateType === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'Email Template Type not found'
        }
      })
    }
    return next()
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { emailTemplate } } = req

    const { response, status } = await emailTemplateService.insert({ emailTemplate })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.recordName()]: response
    })
  }

  async update (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: emailTemplate, body } = req

    if (emailTemplate.isDefault === true) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Default email templates are not editable'
        }
      })
    }

    const response = await this.service.update(emailTemplate, body[this.recordName()])

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.service.singleRecord()]: response
    })
  }
}

export default new EmailTemplateController(emailTemplateService)
