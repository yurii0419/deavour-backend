import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser, createCampaignManager,
  createCompanyAdministrator,
  createVerifiedCompany,
  createUnVerifiedCompanyWithExpiredDomainCode,
  verifyUser,
  verifyCompanyDomain
} from '../utils'
import * as userRoles from '../../utils/userRoles'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCampaignManager: string
let tokenCompanyAdministrator: string
let userEmail: string
let token: string
let userId: string
let userIdAdmin: string

describe('Company actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCampaignManager()
    await createCompanyAdministrator()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: 'mackone' } })
    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: 'pepperpotts' } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCampaignManager = resCampaignManager.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    userEmail = resUser.body.user.email
    userId = resUser.body.user.id
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
    await deleteTestUser('raywiretest@gmail.com')
  })

  describe('Get all companies', () => {
    it('Should return 200 Success when an admin successfully retrieves all companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companies')
      expect(res.body.companies).to.be.an('array')
    })

    it('Should return 200 when a non admin tries to retrieve all companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companies')
      expect(res.body.companies).to.be.an('array')
    })
  })

  describe('Create a company', () => {
    it('Should return 201 Created when a user creates a company.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when an unverified user tries to create a company.', async () => {
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'The', lastName: 'Hulk', email: 'thehulk@starkindustriesmarvel.com', phone: '254720123456', password: 'smashsmash' } })

      const resUnverifiedUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'thehulk@starkindustriesmarvel.com', password: 'smashsmash' } })

      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${String(resUnverifiedUser.body.token)}`)
        .send({
          company: {
            name: 'Test Company Hulk Out',
            email: 'test@companyhulkout.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Kindly verify your email address')
    })

    it('Should return 403 Forbidden when a user tries to create a company with an admin email account that is a company admin.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User specified is already a company admin')
    })

    it('Should return 403 Forbidden when a user tries to create a company with a domain that does not match the email.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com',
            domain: 'company1.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('The email domain and the company domain do not match')
    })

    it('Should return 204 when an admin deletes a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company Deleted',
            email: 'test@company23.com'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/companies/${String(resCompany.body.company.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a company that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/companies/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })
  })

  describe('Get and update a company', () => {
    it('Should return 200 OK when an owner gets a company by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Begot',
            email: 'test@companybegot.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a company administrator gets a company by id.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company administrator who is not an employee tries to get a company by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company24.com'
          }
        })

      const companyId = resCompany.body.company.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, company administrator or administrator can perform this action')
    })

    it('Should return 200 OK when a company administrator updates a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          company: {
            domain: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(true)
    })

    it('Should return 200 OK when a company administrator updates a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          company: {
            email: 'nickfury@starkindustriesmarvel.com',
            domain: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(true)
    })

    it('Should return 200 OK when a company owner updates the role of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Pepper', lastName: 'Potts', email: 'peppot@starkindustriesmarvel.com', password: 'iamironwoman' } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 403 Forbidden when a company owner updates the role of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company.com'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Medusa', lastName: 'Boltagon', email: 'medusa@inhumans.com', password: 'blackbolt' } })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin, the owner or your company administrator can perform this action')
    })

    it('Should return 403 Forbidden when a company owner tries to update their role.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company22.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(userId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot update your own role')
    })

    it('Should return 403 Forbidden when a company owner tries to update the role of an admin user.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company21.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(userIdAdmin)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot update the role of an administrator')
    })

    it('Should return 403 Forbidden when a company campaign manager tries to update the role of an employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company20.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Gorgon', lastName: 'Petragon', email: 'gorgon@inhumans.com', password: 'earthquake' } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: 'pepperpotts' } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin, the owner or your company administrator can perform this action')
    })

    it('Should return 404 Not Found when a company owner updates the role of an non-existent employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company19.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/7B98DA13-EF75-46BB-ABD5-F76D162C335A`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User not found')
    })
  })

  describe('Company Employee Data Update', () => {
    it('Should return 200 OK when a company owner updates the data of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Queen', lastName: 'Ramonda', email: 'qr@starkindustriesmarvel.com', password: 'iamironwoman' } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: 'queenregent' } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 403 Forbidden when a company owner updates the data of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'stars@company.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Crystal', lastName: 'Amaquelin', email: 'crystal@inhumans.com', password: 'quicksilver' } })

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { firstName: 'Crystalia' } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or your company administrator can perform this action')
    })
  })

  describe('Company Employee Email Verification', () => {
    it('Should return 200 OK when a company owner verifies the email of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Okoye', lastName: 'Dora', email: 'okoyedora@starkindustriesmarvel.com', password: 'iamironwoman' } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/email-verification`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { isVerified: true } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 403 Forbidden when a company owner tries to verify the email of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'starsaligned@company.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Gorgon', lastName: 'Boltagon', email: 'gorgonboltagon@inhumans.com', password: 'smashsmash' } })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/email-verification`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { isVerified: true } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or your company administrator can perform this action')
    })
  })

  describe('Company Address Data Update', () => {
    it('Should return 200 OK when a company owner updates the address of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Natasha', lastName: 'Romanoff', email: 'natrom@starkindustriesmarvel.com', password: 'theredroom' } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({ address: { country: 'Kenya', city: 'Nairobi' } })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.have.keys('id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company owner updates the address of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'starlinks@company.com'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Maximus', lastName: 'Boltagon', email: 'maxbolt@inhumans.com', password: 'pureevil' } })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({ address: { country: 'Kenya', city: 'Nairobi' } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or your company administrator can perform this action')
    })
  })

  describe('Domain Verification', () => {
    it('Should return 200 OK when a company owner requests a domain verification code', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company18.com',
            domain: 'company18.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(false)
    })

    it('Should return 200 OK when a company owner requests a domain verification code for a verified company', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin, true)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(true)
    })

    it('Should return 200 OK when a company owner requests a domain verification code while the other one has not yet expired', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@companytwo.com',
            domain: 'companytwo.com'
          }
        })

      const companyId = resCompany.body.company.id

      const resCompanyVerification = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const domainVerificationCode = resCompanyVerification.body.company.domainVerificationCode.value

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(false)
      expect(res.body.company.domainVerificationCode.value).to.equal(domainVerificationCode)
    })

    it('Should return 403 Forbidden when a company owner requests a domain verification code with a company without a domain', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@companyone.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Add a company domain first in order to perform this action')
    })

    it('Should return 200 OK when an admin updates domain verification status', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company Four',
            email: 'test@companyfour.com',
            domain: 'companyfour.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/verify-domain`)
        .send({
          company: {
            isDomainVerified: true
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
    })

    it('Should return 403 Forbidden when a company owner tries to verify a domain without requesting for a code', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@companythree.com',
            domain: 'companythree.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Request domain verification first to get a domain verification code')
    })

    it('Should return 403 Forbidden when a company owner tries to verify a domain with an expired code', async () => {
      const resCompany = await createUnVerifiedCompanyWithExpiredDomainCode(userIdAdmin)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('This domain verification code has expired kindly request another one')
    })

    it('Should return 200 OK when a company owner requests a domain verification code and tries to verify the domain', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Gmail Company',
            email: 'raywiretest@gmail.com',
            domain: 'gmail.com'
          }
        })

      const companyId = resCompany.body.company.id

      const resCompanyVerification = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const domainVerificationCode = resCompanyVerification.body.company.domainVerificationCode.value

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(false)
      expect(res.body.company.domainVerificationCode.value).to.equal(domainVerificationCode)
    })

    it('Should return 400 Bad Request when a company owner tries to verify a non existent domain', async () => {
      const domain = 'companyfive224fwdcvsfe.com'
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: `test@${domain}`,
            domain
          }
        })

      const companyId = resCompany.body.company.id

      await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal(`queryTxt ENOTFOUND ${domain}`)
    })
  })

  describe('Create an address', () => {
    it('Should return 201 Created when a company owner successfully creates an address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company17.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a company administrator tries to create an address that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company16.com'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a company owner tries to create an address that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company15.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a company owner gets company addresses.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company17254.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'addresses', 'meta')
      expect(res.body.addresses).to.be.an('array')
    })
  })

  describe('Create a campaign', () => {
    it('Should return 201 Created when a company owner successfully creates a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a campaign manager for a company successfully creates a campaign.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: 'pepperpotts' } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          campaign: {
            name: 'Onboarding Hires',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a campaign for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company13.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: 'pepperpotts' } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, company administrator, campaign manager or administrator can perform this action')
    })

    it('Should return 200 Success when a company owner tries to create a campaign that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when an admin creates a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })
  })

  describe('Get all campaigns', () => {
    it('Should return 200 Success when an owner successfully retrieves all campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company10.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all campaigns with negative pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .query({
          limit: -10,
          page: -1
        })
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company9.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all campaigns with pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .query({
          limit: 1,
          page: 1
        })
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company8.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all campaigns.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to retrieve all campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company6.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner, company administrator, campaign manager or administrator can perform this action')
    })

    it('Should return 200 when an admin retrieves all company campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company5.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })
  })

  describe('Get all users of a company', () => {
    it('Should return 200 Success when an owner successfully retrieves all users of a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Best Company',
            email: 'testbest@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 Success when a company admin who is an employee successfully retrieves all users of a company.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully adds a user to a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 200 Success when an owner successfully adds a user to a company with a set role.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Red', lastName: 'Hulk', email: 'redhulk@starkindustriesmarvel.com', phone: '254720123456', password: 'tonysuxx' } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'redhulk@starkindustriesmarvel.com',
            role: userRoles.CAMPAIGNMANAGER
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user.role).to.equal(userRoles.CAMPAIGNMANAGER)
    })

    it('Should return 404 Not Found when an owner tries to add a non-existent user to a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'shehulk1@starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User not found')
    })

    it('Should return 403 Forbidden when an owner tries to add a user with a different domain to a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'blackagonboltagon@inhumans.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('The email domain and the company domain do not match')
    })

    it('Should return 403 Forbidden when an owner tries to add a user to a company with an unverified domain.', async () => {
      const resCompany = await createVerifiedCompany(userId, false)

      const companyId = resCompany.id

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Verify the company domain first in order to perform this action')
    })

    it('Should return 403 Forbidden when an owner tries to add a user to a company without a domain.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company4.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Add and verify a company domain first in order to perform this action')
    })

    it('Should return 200 Success when a company admin who is an employee successfully adds a user to a company.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 200 Success when an owner successfully removes a user from a company.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail,
            actionType: 'remove'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user.company).to.equal(null)
    })

    it('Should return 200 Success when a company admin who is an employee successfully removes a user from a company.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail,
            actionType: 'remove'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user.company).to.equal(null)
    })

    it('Should return 200 Success when an owner successfully retrieves all users with negative pagination params.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token

      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 when a non-owner admin retrieve all company users.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Best Company',
            email: 'testbest@company3.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 when a company administrator who is not an employee retrieves all company users.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

      token = resUser.body.token
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Best Company',
            email: 'testbest@company2.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })
  })
})
