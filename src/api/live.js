import request from '@/utils/request'

export function pageList(query) {
  return request({
    url: '/api/live/pageList',
    method: 'get',
    params: query
  })
}

export function createLive(data) {
  return request({
    url: '/api/live/create',
    method: 'post',
    data
  })
}
