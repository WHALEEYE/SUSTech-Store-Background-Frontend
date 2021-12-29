import request from '@/utils/request'
import Qs from 'qs'
export function login(data) {
  return request({
    url: '/login/',
    method: 'post',
    data: Qs.stringify(data)
  })
}

export function getInfo() {
  return request({
    url: '/backUser/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

