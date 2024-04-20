import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PendingOrderController from '../controllers/PendingOrderController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'

const pendingOrderRoutes = (): any => {
  const pendingOrderRouter = express.Router()

  pendingOrderRouter.use('/pending-orders', checkAuth, checkUserIsVerifiedStatus)
  pendingOrderRouter.route('/pending-orders')
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(PendingOrderController.getAll))
  pendingOrderRouter.route('/pending-orders/duplicate')
    .post(celebrate({
      [Segments.BODY]: validator.validatePostedOrders
    }), asyncHandler(PendingOrderController.duplicate))

  return pendingOrderRouter
}

export default pendingOrderRoutes
