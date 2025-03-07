import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser, createAdminTestUser,
  createCompanyAdministrator, createCampaignManager,
  createVerifiedCompany, verifyUser, verifyCompanyDomain, createPrivacyRule,
  iversAtKreeDotKrPassword,
  nickFuryPassword,
  sheHulkAtStarkIndustriesPassword,
  happyHoganPassword
} from '../utils'
import * as userRoles from '../../utils/userRoles'
import * as appModules from '../../utils/appModules'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCompanyAdministrator: string
let tokenCampaignManager: string
let token: string
let userIdAdmin: string

describe('Recipient actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()
    await createCampaignManager()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

    tokenAdmin = resAdmin.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    tokenCampaignManager = resCampaignManager.body.token
    token = resUser.body.token
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get a recipient by id', () => {
    it('Should return 200 OK when a company owner successfully gets a recipient.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCampaign = await chai
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

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipient')
      expect(res.body.recipient).to.be.an('object')
      expect(res.body.recipient).to.include.keys('id', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a company admin successfully gets a recipient.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()

      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipient')
      expect(res.body.recipient).to.be.an('object')
      expect(res.body.recipient).to.include.keys('id', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a campaign manager successfully gets a recipient.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      await deleteTestUser('happyhogan@starkindustriesmarvel.com')
      await createCampaignManager()

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipient')
      expect(res.body.recipient).to.be.an('object')
      expect(res.body.recipient).to.include.keys('id', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to get a recipient.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const resCampaign = await chai
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

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 403 Forbidden when a user who is not an employee tries to get a recipient.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company',
            email: 'ivers@kree.kr'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      await deleteTestUser('happyhogan@starkindustriesmarvel.com')
      await createCampaignManager()

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const resCampaign = await chai
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

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 403 Forbidden when a company non owner tries to get a recipient.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCampaign = await chai
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

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })
  })

  describe('Update a recipient by id', () => {
    it('Should return 200 OK when a company owner successfully updates a recipient.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Miss Marvel Company',
            email: 'khamalakhan@themarvels.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCampaign = await chai
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

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            street: 'Kiu River Road'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipient')
      expect(res.body.recipient).to.be.an('object')
      expect(res.body.recipient).to.include.keys('id', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when an admin tries to update a recipient with a privacy rule set.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Photon Company',
            email: 'photon@themarvels.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(companyId)
      await createPrivacyRule(companyId, appModules.RECIPIENTS, userRoles.ADMIN)

      const resCampaign = await chai
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

      const resRecipient = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/recipients/${String(resRecipient.body.recipient.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            street: 'Kiu River Road'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal(`Disable privacy rule for ${appModules.RECIPIENTS} module and ${userRoles.ADMIN} role to be able to perform this action`)
    })
  })
})
