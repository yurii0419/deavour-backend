import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CompanyController from '../controllers/CompanyController'
import AddressController from '../controllers/AddressController'
import CampaignController from '../controllers/CampaignController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import UserController from '../controllers/UserController'

const companyRoutes = (): any => {
  const companyRouter = express.Router()

  companyRouter.use('/companies', checkAuth)
  companyRouter.route('/companies')
    .post(celebrate({
      [Segments.BODY]: validator.validateCreatedCompany
    }, { abortEarly: false }), asyncHandler(CompanyController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CompanyController.getAll))
  companyRouter.use('/companies/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CompanyController.checkRecord))
  companyRouter.route('/companies/:id')
    .get(asyncHandler(CompanyController.checkOwnerOrCompanyAdministrator), asyncHandler(CompanyController.get))
    .put(asyncHandler(CompanyController.checkOwnerOrCompanyAdministrator), celebrate({
      [Segments.BODY]: validator.validateUpdatedCompany
    }), asyncHandler(CompanyController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(CompanyController.delete))
  companyRouter.route('/companies/:id/addresses')
    .post(asyncHandler(CompanyController.checkOwnerOrCompanyAdministrator), celebrate({
      [Segments.BODY]: validator.validateCreatedAddress
    }, { abortEarly: false }), asyncHandler(AddressController.insert))
  companyRouter.route('/companies/:id/campaigns')
    .post(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrCampaignManager), celebrate({
      [Segments.BODY]: validator.validateCampaign
    }, { abortEarly: false }), asyncHandler(CampaignController.insert))
    .get(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrCampaignManager), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CampaignController.getAll))
  companyRouter.route('/companies/:id/users')
    .patch(asyncHandler(CompanyController.checkOwnerOrCompanyAdministrator), celebrate({
      [Segments.BODY]: validator.validateJoinCompany
    }, { abortEarly: false }), asyncHandler(UserController.updateCompanyId))
    .get(asyncHandler(CompanyController.checkOwnerOrCompanyAdministrator), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CompanyController.getAllUsers))
  return companyRouter
}

export default companyRoutes
