import request from '@/utils/request'

export function getList(query) {
  return request({
    url: '/order/all',
    method: 'get',
    params: query
  })
}
