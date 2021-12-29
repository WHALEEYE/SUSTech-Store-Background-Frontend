import request from '@/utils/request'

export function getList() {
  return request({
    url: '/credit/all',
    method: 'get'
  })
}

export function update(id, query) {
  return request({
    url: '/credit/change/' + id,
    method: 'patch',
    params: query
  })
}
