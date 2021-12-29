import request from '@/utils/request'
import Qs from 'qs'

export function del(id) {
  return request({
    url: '/goodType/' + id,
    method: 'delete'
  })
}

export function getList(query) {
  return request({
    url: '/goodType/all',
    method: 'get',
    params: query
  })
}

export function add(typeName) {
  return request({
    url: '/goodType/',
    method: 'post',
    data: Qs.stringify(typeName)
  })
}

export function update(id, typeName) {
  return request({
    url: '/goodType/name/' + id,
    method: 'patch',
    params: typeName
  })
}

export function moveDown(id) {
  return request({
    url: '/goodType/pos/down/' + id,
    method: 'patch'
  })
}

export function moveUp(id) {
  return request({
    url: '/goodType/pos/up/' + id,
    method: 'patch'
  })
}
