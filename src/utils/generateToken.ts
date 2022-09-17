import jwt from 'jsonwebtoken'
import { TokenType, TokenUser } from '../types'

const secretKey: string = String(process.env.SECRET_KEY)
const issuer = process.env.TOKEN_ISSUER
const audience = process.env.TOKEN_AUDIENCE

const generateToken = (user: TokenUser, type: TokenType, expiresIn = '30 days'): string => {
  const { id, email, role, logoutTime, company, isVerified } = user

  const companyId = company?.id ?? null

  const token = jwt.sign(JSON.parse(JSON.stringify(
    { id, companyId, email, role, logoutTime, type, isVerified }
  )), secretKey, { expiresIn, issuer, audience })

  return token
}

export default generateToken
