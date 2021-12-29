import request from '@/utils/request'
import Qs from 'qs'

export function del(id) {
  return request({
    url: '/backUser/' + id,
    method: 'delete'
  })
}

export function add(info) {
  return request({
    url: '/backUser/',
    method: 'post',
    data: Qs.stringify(info)
  })
}

export function list(query) {
  return request({
    url: '/backUser/all',
    method: 'get',
    params: query
  })
}

export function ban(id) {
  return request({
    url: '/backUser/ban/' + id,
    method: 'patch'
  })
}

export function unban(id) {
  return request({
    url: '/backUser/unban/' + id,
    method: 'patch'
  })
}
