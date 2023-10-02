import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  verifyCompanyDomain,
  pendingOrders,
  updatePendingOrderWithPostedOrderId,
  createCompanyAdministrator
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Pending Orders actions', () => {
  before(async () => {
    await createAdminTestUser()

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

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all pending orders', () => {
    it('Should return 200 Success when an admin successfully retrieves all pending orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pending-orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
    })

    it('Should return 403 when a non-admin retrieves all pending orders.', async () => {
      const res = await chai
        .request(app)
        .get('/api/pending-orders')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Duplicate pending orders', () => {
    it('Should return 404 Not Found when an admin tries to duplicate pending orders that do not exits.', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          postedOrderIds: [
            '17064477727948800', '17064460270206976'
          ]
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Pending orders not found')
    })

    it('Should return 403 Forbidden when an normal user tries to duplicate pending orders.', async () => {
      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          postedOrderIds: [
            '17064477727948800', '17064460270206976'
          ]
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only admin, company admin or campaign manager can perform this action')
    })

    it('Should return 201 Created when an admin user successfully duplicates pending orders.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders',
            email: 'test@companymarvelpendingorders.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Pending Orders',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrders = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[0].id, '20064477727948800')
      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[1].id, '20064460270206976')

      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          postedOrderIds: [
            '20064477727948800', '20064460270206976'
          ]
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array').of.length(2)
    })

    it('Should return 403 Forbidden when an company admin user tries to duplicate pending orders from different companies.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Pending Orders',
            email: 'test@companymarvelpendingordersforbidden.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Pending Orders',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const resPendingOrders = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[0].id, '20064477727948800')
      await updatePendingOrderWithPostedOrderId(resPendingOrders.body.pendingOrders[1].id, '20064460270206976')

      await createCompanyAdministrator('test@companymarvelpendingorders23.com', '12345678')
      const resCompanyAdminUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'test@companymarvelpendingorders23.com', password: '12345678' } })

      const tokenCompanyAdmin = resCompanyAdminUser.body.token

      const res = await chai
        .request(app)
        .post('/api/pending-orders/duplicate')
        .set('Authorization', `Bearer ${String(tokenCompanyAdmin)}`)
        .send({
          postedOrderIds: [
            '20064477727948800', '20064460270206976'
          ]
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('All orders must belong to the same company as the user')
    })
  })
})
