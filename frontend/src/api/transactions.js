
import client from './client'

export const deposit = (accountNumber, payload) =>
  client
    .post(`/account/${accountNumber}/deposit`, payload)
    .then((res) => res.data)

export const withdraw = (accountNumber, payload) =>
  client
    .post(`/account/${accountNumber}/withdraw`, payload)
    .then((res) => res.data)

export const transfer = (payload) =>
  client
    .post('/account/transfer', payload)
    .then((res) => res.data)

export const getStatements = (accountNumber, params = {}) =>
  client
    .get(`/account/${accountNumber}/statements`, { params })
    .then((res) => res.data)
