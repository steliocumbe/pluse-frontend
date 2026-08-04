import { api } from './api'

export const authService = {
  loginOperators() {
    return api.get('/auth/login-operators/').then((r) => r.data)
  },

  login(identifier, password) {
    return api.post('/auth/login/', { identifier, password }).then((r) => r.data)
  },

  refresh(refreshToken) {
    return api.post('/auth/refresh/', { refresh: refreshToken }).then((r) => r.data)
  },

  logout(refreshToken) {
    return api.post('/auth/logout/', { refresh: refreshToken }).then((r) => r.data)
  },

  me() {
    return api.get('/auth/me/').then((r) => r.data)
  },

  changePassword(oldPassword, newPassword) {
    return api
      .post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      .then((r) => r.data)
  },
}
