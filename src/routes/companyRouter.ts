import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CompanyController from '../controllers/CompanyController'
import AddressController from '../controllers/AddressController'
import RecipientController from '../controllers/RecipientController'
import asyncHandler from '../middlewares/asyncHandler'
import checkOwner from '../middlewares/checkOwner'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'

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
    .get(asyncHandler(checkOwner), asyncHandler(CompanyController.get))
    .put(asyncHandler(checkOwner), celebrate({
      [Segments.BODY]: validator.validateUpdatedCompany
    }), asyncHandler(CompanyController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(CompanyController.delete))
  companyRouter.route('/companies/:id/addresses')
    .post(asyncHandler(checkOwner), celebrate({
      [Segments.BODY]: validator.validateCreatedAddress
    }, { abortEarly: false }), asyncHandler(AddressController.insert))
  companyRouter.route('/companies/:id/recipients')
    .post(asyncHandler(checkOwner), celebrate({
      [Segments.BODY]: validator.validateCreatedRecipient
    }, { abortEarly: false }), asyncHandler(RecipientController.insert))
    .get(asyncHandler(checkOwner), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(RecipientController.getAll))
  return companyRouter
}

export default companyRoutes
