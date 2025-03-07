import BaseController from './BaseController'
import UserInProductAccessControlGroupService from '../services/UserInProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const userInProductAccessControlGroupService = new UserInProductAccessControlGroupService('UserProductAccessControlGroup')

class UserInProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { userProductAccessControlGroup: { userIds } }, params: { id } } = req

    const { response, status } = await userInProductAccessControlGroupService.insert({
      userIds,
      productAccessControlGroupId: id
    })
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

  async getAllUsersInProductAccessControlGroup (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search }, params: { id } } = req
    const records = await userInProductAccessControlGroupService.getAllUsersInProductAccessControlGroup(limit, offset, id, search)
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
      [userInProductAccessControlGroupService.manyRecords()]: records.rows
    })
  }
}

export default new UserInProductAccessControlGroupController(userInProductAccessControlGroupService)
