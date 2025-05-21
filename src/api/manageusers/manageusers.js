import request from '@/utils/request'

// 查询管理用户列表
export function listManageusers(query) {
  return request({
    url: '/manageusers/manageusers/list',
    method: 'get',
    params: query
  })
}

// 查询管理用户详细
export function getManageusers(peopleId) {
  return request({
    url: '/manageusers/manageusers/' + peopleId,
    method: 'get'
  })
}

// 新增管理用户
export function addManageusers(data) {
  return request({
    url: '/manageusers/manageusers',
    method: 'post',
    data: data
  })
}

// 修改管理用户
export function updateManageusers(data) {
  return request({
    url: '/manageusers/manageusers',
    method: 'put',
    data: data
  })
}

// 删除管理用户
export function delManageusers(peopleId) {
  return request({
    url: '/manageusers/manageusers/' + peopleId,
    method: 'delete'
  })
}
