import request from '@/utils/request'

// 查询用户减重记录
export function getWeightLogs(peopleId) {
  return request({
    url: '/manageusers/detail/weight/' + peopleId,
    method: 'get'
  })
}

// 查询用户饮食记录
export function getFoodLogs(peopleId) {
  return request({
    url: '/manageusers/detail/food/' + peopleId,
    method: 'get'
  })
}

// 查询用户运动记录
export function getExerciseLogs(peopleId) {
  return request({
    url: '/manageusers/detail/exercise/' + peopleId,
    method: 'get'
  })
}

// 查询医生建议
export function getDoctorAdvice(peopleId) {
  return request({
    url: '/manageusers/detail/advice/' + peopleId,
    method: 'get'
  })
}

// 查询用户所有健康数据
export function getAllUserData(peopleId) {
  return request({
    url: '/manageusers/detail/all/' + peopleId,
    method: 'get'
  })
}

// 添加医生建议
export function addDoctorAdvice(data) {
  return request({
    url: '/manageusers/detail/advice',
    method: 'post',
    data: data
  })
} 