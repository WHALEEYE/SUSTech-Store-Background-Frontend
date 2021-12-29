import request from '@/utils/request'

export function del(id) {
  return request({
    url: '/good/' + id,
    method: 'delete'
  })
}

export function getList(query) {
  return request({
    url: '/good/all',
    method: 'get',
    params: query
  })
}
