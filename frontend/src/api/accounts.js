import client from './client'

export const getAccounts = (customerId, params = {}) =>
  client.get(`/customers/${customerId}/accounts`, { params }).then((res) => res.data)

export const openAccount = (customerId, payload) =>
  client.post(`/customers/${customerId}/accounts`, payload).then((res) => res.data)