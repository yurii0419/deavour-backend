import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import UserController from '../controllers/UserController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkOtp from '../middlewares/checkOtp'

const userRoutes = (): any => {
  const userRouter = express.Router()

  userRouter.use('/users', checkAuth)
  userRouter.route('/users')
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateUsersQueryParams
    }), asyncHandler(paginate), asyncHandler(UserController.getAll))
  userRouter.use('/users/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(UserController.checkRecord))
  userRouter.route('/users/:id')
    .get(asyncHandler(UserController.checkOwner), asyncHandler(UserController.get))
    .put(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateUpdatedUser
    }), asyncHandler(UserController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(UserController.delete))
  userRouter.route('/users/:id/purge')
    .delete(asyncHandler(UserController.checkOwner), asyncHandler(UserController.purge))
  userRouter.route('/users/:id/role')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateRole
    }), asyncHandler(UserController.updateRole))
  userRouter.route('/users/:id/photo')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateUserPhoto
    }), asyncHandler(UserController.update))
  userRouter.route('/users/:id/password')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validatePassword
    }), asyncHandler(UserController.updatePassword))
  userRouter.route('/users/:id/verify')
    .post(asyncHandler(UserController.checkOwner), asyncHandler(UserController.sendVerifyEmail))
  userRouter.route('/users/:id/verify')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateOtp
    }), asyncHandler(checkOtp), asyncHandler(UserController.verifyEmail))
  userRouter.route('/users/:id/notifications')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateNotifications
    }), asyncHandler(UserController.updateNotifications))
  userRouter.route('/users/:id/addresses')
    .post(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateCreatedAddress
    }, { abortEarly: false }), asyncHandler(UserController.createAddress))
  return userRouter
}

export default userRoutes
