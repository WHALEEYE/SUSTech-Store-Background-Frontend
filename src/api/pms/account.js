import request from '@/utils/request'

export function getinfo() {
  return request({
    url: '/backUser/info',
    method: 'get'
  })
}

export function update(password) {
  return request({
    url: '/backUser/password/',
    method: 'patch',
    params: password
  })
}
