import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Recipient actions', () => {
  before(async () => {
    await createAdminTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustries.com', phone: '254724374281', password: 'mackone' } })

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustries.com', password: 'mackone' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    tokenAdmin = resAdmin.body.token
    token = res1.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@gmail.com')
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
      expect(res.body.errors.message).to.equal('Only the owner can perform this action')
    })
  })
})
