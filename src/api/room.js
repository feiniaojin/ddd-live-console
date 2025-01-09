import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/room/pageList',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createRoom(data) {
  return request({
    url: '/api/room/create',
    method: 'post',
    data
  })
}

export function modify(data) {
  return request({
    url: '/api/room/modify',
    method: 'post',
    data
  })
}
