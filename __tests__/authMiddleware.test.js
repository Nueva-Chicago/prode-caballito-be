'use strict'

const mockVerifyToken = jest.fn()
jest.mock('../utils', () => ({
  verifyToken: mockVerifyToken,
}))

const { authMiddleware, requireAdmin } = require('../middleware/auth')

function makeReqRes(headers = {}) {
  const req = { headers, user: undefined }
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }
  const next = jest.fn()
  return { req, res, next }
}

describe('authMiddleware', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rechaza si no hay Authorization header', () => {
    const { req, res, next } = makeReqRes()
    authMiddleware(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('rechaza si el header no empieza con "Bearer "', () => {
    const { req, res, next } = makeReqRes({ authorization: 'Token abc123' })
    authMiddleware(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('rechaza si verifyToken lanza excepción', () => {
    mockVerifyToken.mockImplementation(() => { throw new Error('invalid') })
    const { req, res, next } = makeReqRes({ authorization: 'Bearer badtoken' })
    authMiddleware(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('acepta token válido y agrega user al req', () => {
    const payload = { userId: 'u1', email: 'test@test.com', rol: 'usuario' }
    mockVerifyToken.mockReturnValue(payload)
    const { req, res, next } = makeReqRes({ authorization: 'Bearer goodtoken' })
    authMiddleware(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual(payload)
    expect(res.status).not.toHaveBeenCalled()
  })
})

describe('requireAdmin', () => {
  beforeEach(() => jest.clearAllMocks())

  it('rechaza si req.user es undefined', () => {
    const { req, res, next } = makeReqRes()
    requireAdmin(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('rechaza si el rol no es admin', () => {
    const req = { user: { rol: 'usuario' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    requireAdmin(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('permite paso si rol es admin', () => {
    const req = { user: { rol: 'admin' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    requireAdmin(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
