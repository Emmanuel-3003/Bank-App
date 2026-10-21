import client from './client'

export const getMyProfile = () => client.get('/customers/me').then((res) => res.data)