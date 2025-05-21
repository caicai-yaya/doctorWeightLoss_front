<template>
  <div class="medical-dashboard">
    <!-- 页面标题和工具栏 -->
    <div class="dashboard-header">
      <h2 class="page-title">医疗健康管理看板</h2>
      <div class="tool-bar">
        <el-button type="primary" plain size="small" @click="showSmsHistory">
          <el-icon><Document /></el-icon>
          <span>短信记录</span>
        </el-button>
      </div>
    </div>

    <!-- 第一行：主要指标 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon user-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">匹配用户总数</div>
            <div class="stat-value">{{ statistics.totalUsers }}</div>
            <div class="stat-progress">
              <el-progress :percentage="65" :show-text="false" :stroke-width="4" status="success" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon today-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">今日未记录用户</div>
            <div class="stat-value">{{ statistics.todayUnrecorded }}</div>
            <div class="stat-detail">
              <el-tag size="small" effect="plain" type="danger">饮食：{{ statistics.todayUnrecordedDiet }}</el-tag>
              <el-tag size="small" effect="plain" type="warning">运动：{{ statistics.todayUnrecordedExercise }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon days-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">超过3天未记录用户</div>
            <div class="stat-value">{{ statistics.overThreeDaysUnrecorded }}</div>
            <div class="stat-percent">
              <span class="percent-value">{{ (statistics.overThreeDaysUnrecorded / statistics.totalUsers * 100).toFixed(1) }}%</span>
              <span class="percent-label">占总用户</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：用户列表 -->
    <el-card class="mb-4">
      <div class="filter-container">
        <el-form :inline="true" :model="listQuery">
          <el-form-item label="未记录天数">
            <el-select v-model="listQuery.dateRange" placeholder="请选择未记录天数" class="filter-select" @change="handleFilter">
              <el-option label="3日以内" value="within3days">
                <div class="custom-option">
                  <span>3日以内</span>
                  <el-tag v-if="listQuery.dateRange === 'within3days'" size="small" type="success">已选</el-tag>
                </div>
              </el-option>
              <el-option label="超过3天" value="last3days">
                <div class="custom-option">
                  <span>超过3天</span>
                  <el-tag v-if="listQuery.dateRange === 'last3days'" size="small" type="success">已选</el-tag>
                </div>
              </el-option>
              <el-option label="超过7天" value="last7days">
                <div class="custom-option">
                  <span>超过7天</span>
                  <el-tag size="small" effect="plain" type="info" v-if="listQuery.dateRange === 'last7days'">已选</el-tag>
                </div>
              </el-option>
              <el-option label="超过30天" value="last30days">
                <div class="custom-option">
                  <span>超过30天</span>
                  <el-tag size="small" effect="plain" type="info" v-if="listQuery.dateRange === 'last30days'">已选</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="用户类型">
            <el-select v-model="listQuery.userType" placeholder="请选择用户类型" class="filter-select" @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="普通" value="normal">
                <div class="custom-option">
                  <span>普通</span>
                  <el-tag size="small" effect="plain" type="primary" v-if="listQuery.userType === 'normal'">已选</el-tag>
                </div>
              </el-option>
              <el-option label="肥胖" value="obese">
                <div class="custom-option">
                  <span>肥胖</span>
                  <el-tag size="small" effect="plain" type="danger" v-if="listQuery.userType === 'obese'">已选</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="记录类型">
            <el-select v-model="listQuery.recordType" placeholder="请选择记录类型" class="filter-select" @change="handleFilter">
              <el-option label="全部" value="" />
              <el-option label="饮食" value="diet">
                <div class="custom-option">
                  <span>饮食</span>
                  <el-tag size="small" effect="plain" type="danger" v-if="listQuery.recordType === 'diet'">已选</el-tag>
                </div>
              </el-option>
              <el-option label="运动" value="exercise">
                <div class="custom-option">
                  <span>运动</span>
                  <el-tag size="small" effect="plain" type="warning" v-if="listQuery.recordType === 'exercise'">已选</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="info" @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 添加已选择的筛选条件显示区域 -->
      <div class="selected-filters" v-if="hasActiveFilters">
        <span class="filter-label">已选条件：</span>
        <el-tag v-if="listQuery.dateRange" class="filter-tag" closable @close="clearFilter('dateRange')">
          未记录天数: {{ getDateRangeLabel(listQuery.dateRange) }}
        </el-tag>
        <el-tag v-if="listQuery.userType" class="filter-tag" closable @close="clearFilter('userType')">
          用户类型: {{ getUserTypeLabel(listQuery.userType) }}
        </el-tag>
        <el-tag v-if="listQuery.recordType" class="filter-tag" closable @close="clearFilter('recordType')">
          记录类型: {{ getRecordTypeLabel(listQuery.recordType) }}
        </el-tag>
      </div>

      <el-table 
        :data="userList" 
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
      >
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="userType" label="用户类型">
          <template #default="scope">
            <el-tag :type="scope.row.userType === '肥胖' ? 'danger' : 'primary'" effect="plain">
              {{ scope.row.userType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRecordTime" label="最后记录时间" />
        <el-table-column prop="missedDays" label="未记录天数">
          <template #default="scope">
            <el-tag :type="getDayTagType(scope.row.missedDays)" effect="plain">
              {{ scope.row.missedDays }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="missedType" label="未记录类型">
          <template #default="scope">
            <el-tag 
              v-if="scope.row.missedType.includes('饮食')" 
              type="danger" 
              effect="plain" 
              class="mr-5"
            >
              饮食
            </el-tag>
            <el-tag 
              v-if="scope.row.missedType.includes('运动')" 
              type="warning" 
              effect="plain"
            >
              运动
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleContact(scope.row)">联系</el-button>
            <el-button type="primary" link size="small" @click="viewDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-data">
            <el-icon><CircleCheck style="font-size: 24px" /></el-icon>
            <span>所有用户均已按时记录</span>
          </div>
        </template>
      </el-table>

      <!-- 联系用户弹窗 -->
      <el-dialog 
        v-model="contactDialogVisible" 
        title="联系用户" 
        width="420px"
        :close-on-click-modal="false"
        custom-class="contact-dialog"
      >
        <div class="contact-info">
          <div class="user-info">
            <div class="info-item">
              <span class="label">用户名：</span>
              <span class="value">{{ currentUser.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">用户类型：</span>
              <span class="value">
                <el-tag :type="currentUser.userType === '肥胖' ? 'danger' : 'primary'" effect="plain">
                  {{ currentUser.userType }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">联系电话：</span>
              <span class="value phone-number">
                {{ formatPhone(currentUser.phone) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">最后记录：</span>
              <span class="value">{{ currentUser.lastRecordTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">未记录天数：</span>
              <span class="value">
                <el-tag :type="getDayTagType(currentUser.missedDays)" effect="plain">
                  {{ currentUser.missedDays }} 天
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">未记录内容：</span>
              <span class="value">
                <el-tag 
                  v-if="currentUser.missedType && currentUser.missedType.includes('饮食')" 
                  type="danger" 
                  effect="plain" 
                  class="mr-5"
                >
                  饮食
                </el-tag>
                <el-tag 
                  v-if="currentUser.missedType && currentUser.missedType.includes('运动')" 
                  type="warning" 
                  effect="plain"
                >
                  运动
                </el-tag>
              </span>
            </div>
          </div>
          <div class="message-block">
            <div class="message-header">
              <div class="message-title">发送提醒短信</div>
              <el-dropdown @command="handleTemplateSelect" trigger="click">
                <el-button type="info" link size="small">
                  选择模板 <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="template1">未记录提醒</el-dropdown-item>
                    <el-dropdown-item command="template2">复诊提醒</el-dropdown-item>
                    <el-dropdown-item command="template3">运动指导</el-dropdown-item>
                    <el-dropdown-item command="template4">饮食建议</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <el-form :model="smsForm" label-position="top" size="small">
              <el-form-item label="短信内容">
                <el-input 
                  v-model="smsForm.content" 
                  type="textarea" 
                  :rows="4" 
                  resize="none"
                  maxlength="200"
                  show-word-limit
                ></el-input>
              </el-form-item>
              <el-form-item>
                <div class="sms-actions">
                  <el-button type="info" plain @click="copyMessage" size="small">
                    <el-icon><DocumentCopy /></el-icon>复制内容
                  </el-button>
                  <el-button type="primary" @click="sendReminder" :loading="sendingMessage" size="small">
                    发送短信
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-dialog>

      <!-- 短信发送历史记录弹窗 -->
      <el-dialog 
        v-model="smsHistoryVisible"
        title="短信发送历史记录"
        width="800px"
        :close-on-click-modal="true"
      >
        <div class="history-tools">
          <el-button type="primary" size="small" @click="getSmsHistory" :loading="smsHistoryLoading">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
          <el-button type="danger" size="small" @click="clearSmsHistory" :disabled="smsHistoryList.length === 0">
            <el-icon><Delete /></el-icon> 清空历史
          </el-button>
        </div>
        
        <el-table 
          :data="smsHistoryList" 
          style="width: 100%"
          :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
          v-loading="smsHistoryLoading"
          border
          stripe
        >
          <el-table-column prop="username" label="用户名" width="100" />
          <el-table-column prop="phone" label="手机号码" width="140">
            <template #default="scope">
              {{ formatPhone(scope.row.phone) }}
            </template>
          </el-table-column>
          <el-table-column prop="time" label="发送时间" width="160" sortable />
          <el-table-column prop="message" label="短信内容" show-overflow-tooltip />
          <el-table-column prop="status" label="发送状态" width="100">
            <template #default="scope">
              <el-tooltip
                v-if="scope.row.status === 'failed'"
                :content="scope.row.errorMessage || '未知错误'"
                placement="top"
              >
                <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </el-tooltip>
              <el-tag v-else :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                {{ scope.row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="messageId" label="消息ID" width="120" show-overflow-tooltip />
        </el-table>
        
        <template #empty>
          <div class="empty-history">
            <el-icon><Document /></el-icon>
            <span>暂无短信发送记录</span>
          </div>
        </template>

        <div class="dialog-footer" style="margin-top: 20px; text-align: right;">
          <el-button @click="smsHistoryVisible = false">关闭</el-button>
        </div>
      </el-dialog>

      <div class="table-footer" v-if="userList.length > 0">
        <span class="data-info">
          查询到 <el-tag size="small" type="info">{{ total }}</el-tag> 条未记录用户数据
          <el-tooltip content="数据更新时间" placement="top">
            <span class="update-time">
              <el-icon><Timer /></el-icon>
              {{ dataUpdateTime }}
            </span>
          </el-tooltip>
        </span>
        
        <div class="pagination-container">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-sizes="[5, 10, 20]"
            :page-size="listQuery.pageSize"
            :current-page="listQuery.page"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 第三行：趋势图 -->
    <el-card class="mb-4">
      <div class="chart-header">
        <span class="chart-title">未记录用户趋势</span>
        <div class="chart-controls">
          <el-radio-group v-model="chartTimeRange" size="small" @change="updateTrendData" style="margin-right: 15px;">
            <el-radio-button label="7">近7天</el-radio-button>
            <el-radio-button label="15">近15天</el-radio-button>
            <el-radio-button label="30">近30天</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <div class="chart-container">
        <div ref="trendChart" style="height: 300px"></div>
      </div>
    </el-card>

    <!-- 第四行：减重数据和用户分布 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <div class="chart-header">
            <span class="chart-title">用户减重数据分布</span>
          </div>
          <div ref="weightChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="chart-header">
            <span class="chart-title">用户年龄分布</span>
          </div>
          <div ref="ageChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div class="chart-header">
            <span class="chart-title">用户类型分布</span>
          </div>
          <div ref="userTypeChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import { User, Calendar, Clock, CircleCheck, Timer, Phone, Document, DocumentCopy, ArrowDown, Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 统计数据
const statistics = reactive({
  totalUsers: 0,
  todayUnrecorded: 0,
  todayUnrecordedDiet: 0,
  todayUnrecordedExercise: 0,
  overThreeDaysUnrecorded: 0
})

// 列表查询参数
const listQuery = reactive({
  page: 1,
  pageSize: 5,
  dateRange: '',
  userType: '',
  recordType: ''
})

// 加载状态
const loading = ref(false)

// 用户列表数据
const userList = ref([])
const total = ref(0)
const dataUpdateTime = ref(formatDateTime(new Date()))

// 图表相关
const chartTimeRange = ref('7')
const trendChart = ref(null)
const weightChart = ref(null)
const ageChart = ref(null)
const userTypeChart = ref(null)

// 图表实例
let trendChartInstance = null
let weightChartInstance = null
let ageChartInstance = null
let userTypeChartInstance = null

// 添加这些变量到已有的变量区域
const contactDialogVisible = ref(false)
const currentUser = ref({})
const sendingMessage = ref(false)

// 短信历史相关
const smsHistoryVisible = ref(false)
const smsHistoryList = ref([])
const smsHistoryLoading = ref(false)

// 短信表单数据
const smsForm = reactive({
  content: '',
  channel: 'default', // 短信渠道，默认为系统默认渠道
  priority: 'normal' // 发送优先级
})

// 添加发送状态变量 - 用于详细追踪短信发送状态
const smsSendingStatus = ref('')

// 计算属性：是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return listQuery.dateRange || listQuery.userType || listQuery.recordType
})

// 获取日期范围标签
const getDateRangeLabel = (value) => {
  switch(value) {
    case 'within3days': return '3日以内'
    case 'last3days': return '超过3天'
    case 'last7days': return '超过7天'
    case 'last30days': return '超过30天'
    default: return '全部'
  }
}

// 获取用户类型标签
const getUserTypeLabel = (value) => {
  switch(value) {
    case 'normal': return '普通'
    case 'obese': return '肥胖'
    default: return '全部'
  }
}

// 获取记录类型标签
const getRecordTypeLabel = (value) => {
  switch(value) {
    case 'diet': return '饮食'
    case 'exercise': return '运动'
    default: return '全部'
  }
}

// 清除单个筛选条件
const clearFilter = (filterType) => {
  listQuery[filterType] = ''
  handleFilter()
}

// 格式化日期时间
function formatDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 方法定义
const handleFilter = () => {
  loading.value = true
  listQuery.page = 1
  setTimeout(() => {
    fetchData()
    loading.value = false
  }, 500)
}

const resetFilter = () => {
  listQuery.dateRange = ''
  listQuery.userType = ''
  listQuery.recordType = ''
  handleFilter()
}

const handlePageChange = (page) => {
  listQuery.page = page
  loading.value = true
  setTimeout(() => {
    fetchData()
    loading.value = false
  }, 300)
}

const handleSizeChange = (size) => {
  listQuery.pageSize = size
  listQuery.page = 1
  loading.value = true
  setTimeout(() => {
    fetchData()
    loading.value = false
  }, 300)
}

// 根据未记录天数获取标签类型
const getDayTagType = (days) => {
  if (days >= 3) return 'danger'
  if (days >= 2) return 'warning'
  return 'info'
}

// 计算未记录天数
const calculateMissedDays = (lastRecordTime) => {
  const now = new Date()
  const lastRecord = new Date(lastRecordTime)
  const diffTime = Math.abs(now - lastRecord)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1
  return diffDays
}





// 获取未记录用户数据
const getUnrecordedData = () => {
  return getAllData().filter(item => item.missedDays > 0)
}

// 模拟获取数据
const fetchData = () => {
  console.log('Fetching data with params:', listQuery)
  
  // 获取所有用户数据（用于计算总数）
  const allUsers = getAllData()
  // 获取未记录用户数据（用于列表显示和筛选）
  let filteredData = getUnrecordedData()
  
  // 计算固定的统计数据
  statistics.totalUsers = allUsers.length // 使用所有用户数量
  // 今日未记录用户（除了今天记录的用户外的所有用户）
  const todayUsers = allUsers.filter(item => item.missedDays > 0)
  statistics.todayUnrecorded = todayUsers.length
  statistics.todayUnrecordedDiet = todayUsers.filter(item => item.missedType.includes('饮食')).length
  statistics.todayUnrecordedExercise = todayUsers.filter(item => item.missedType.includes('运动')).length
  // 超过3天未记录用户（missedDays > 3）
  statistics.overThreeDaysUnrecorded = allUsers.filter(item => item.missedDays > 3).length

  // 根据日期范围筛选
  if (listQuery.dateRange) {
    switch (listQuery.dateRange) {
      case 'within3days':
        filteredData = filteredData.filter(item => item.missedDays <= 3)
        break
      case 'last3days':
        filteredData = filteredData.filter(item => item.missedDays > 3)
        break
      case 'last7days':
        filteredData = filteredData.filter(item => item.missedDays > 7)
        break
      case 'last30days':
        filteredData = filteredData.filter(item => item.missedDays > 30)
        break
    }
  }

  // 根据用户类型筛选
  if (listQuery.userType) {
    filteredData = filteredData.filter(item => item.userType === (listQuery.userType === 'normal' ? '普通' : '肥胖'))
  }

  // 根据记录类型筛选
  if (listQuery.recordType) {
    filteredData = filteredData.filter(item => {
      if (listQuery.recordType === 'diet') {
        return item.missedType.includes('饮食')
      } else if (listQuery.recordType === 'exercise') {
        return item.missedType.includes('运动')
      }
      return true
    })
  }

  // 更新总记录数和列表数据
  total.value = filteredData.length
  
  // 根据当前页码和每页记录数获取显示数据
  const start = (listQuery.page - 1) * listQuery.pageSize
  const end = start + listQuery.pageSize
  userList.value = filteredData.slice(start, end)
  
  // 更新数据更新时间
  dataUpdateTime.value = formatDateTime(new Date())
  
  // 如果过滤后没有数据，或当前页码超过了最大页码，则返回第一页
  const maxPage = Math.ceil(total.value / listQuery.pageSize) || 1
  if (listQuery.page > maxPage) {
    listQuery.page = 1
    userList.value = filteredData.slice(0, listQuery.pageSize)
  }
}

// 方法: 格式化电话号码
const formatPhone = (phone) => {
  if (!phone) return ''
  const phoneStr = phone.toString()
  return phoneStr.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
}

// 联系用户
const handleContact = (user) => {
  currentUser.value = { ...user }
  // 生成默认短信内容
  smsForm.content = generateDefaultMessage(user)
  contactDialogVisible.value = true
}

// 生成默认短信内容
const generateDefaultMessage = (user) => {
  return `【健康管理提醒】尊敬的${user.username}用户，您已${user.missedDays}天未记录${user.missedType}，请及时登录应用进行记录。如需帮助请联系您的医生。`
}

// 处理模板选择
const handleTemplateSelect = (command) => {
  switch(command) {
    case 'template1':
      smsForm.content = generateDefaultMessage(currentUser.value)
      break
    case 'template2':
      smsForm.content = `【复诊提醒】尊敬的${currentUser.value.username}用户，请记得一周后回诊随访。若有不适，请及时联系您的医生。祝您健康！`
      break
    case 'template3':
      smsForm.content = `【运动指导】尊敬的${currentUser.value.username}用户，建议您每天保持30分钟中等强度运动，如散步、慢跑、游泳等，并记得记录运动数据。祝健康！`
      break
    case 'template4':
      smsForm.content = `【饮食建议】尊敬的${currentUser.value.username}用户，请记得控制每日总热量摄入，增加蔬果，减少高糖高脂食物，坚持记录饮食数据。祝健康！`
      break
  }
}

// 方法: 复制短信内容
const copyMessage = () => {
  // 使用 Clipboard API 复制到剪贴板
  navigator.clipboard.writeText(smsForm.content).then(() => {
    ElMessage({
      message: '短信内容已复制到剪贴板',
      type: 'success'
    })
  }).catch(() => {
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error'
    })
  })
}

// 方法: 发送提醒短信
const sendReminder = () => {
  // 验证短信内容
  if (!smsForm.content.trim()) {
    ElMessage({
      message: '短信内容不能为空',
      type: 'warning'
    })
    return
  }
  
  sendingMessage.value = true
  smsSendingStatus.value = '准备发送...'
  
  // 弹窗确认是否发送真实短信
  ElMessageBox.confirm(
    `确定要向 ${formatPhone(currentUser.value.phone)} 发送提醒短信吗？`, 
    '发送确认', 
    {
      confirmButtonText: '确定发送',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 用户确认发送
    
    // 获取短信服务配置
    const smsConfig = getSmsConfig()
    
    // 构建请求数据
    const requestData = {
      phone: currentUser.value.phone,
      message: smsForm.content,
      channel: smsForm.channel,
      priority: smsForm.priority,
      signature: smsConfig.signature,
      templateId: smsConfig.templateId,
      params: {
        username: currentUser.value.username,
        days: currentUser.value.missedDays,
        types: currentUser.value.missedType
      }
    }

    // 记录发送请求详情
    console.log('短信发送请求:', {
      apiUrl: smsConfig.endpoint,
      requestData: requestData,
      timestamp: new Date().toISOString()
    })
    
    smsSendingStatus.value = '正在发送...'
    
    // 模拟API延迟和随机性
    simulateSmsApiCall(requestData)
      .then(response => {
        // 发送成功的处理
        ElMessage({
          message: `已成功向${currentUser.value.username}(${formatPhone(currentUser.value.phone)})发送提醒短信`,
          type: 'success'
        })
        
        smsSendingStatus.value = '发送成功'
        sendingMessage.value = false
        contactDialogVisible.value = false
        
        // 记录短信发送历史
        recordSmsHistory(currentUser.value, smsForm.content, 'success', response.messageId)
      })
      .catch(error => {
        // 发送失败的处理
        console.error('短信发送失败:', error)
        ElMessage({
          message: `短信发送失败: ${error.message || '服务异常'}`,
          type: 'error'
        })
        
        smsSendingStatus.value = `发送失败: ${error.message}`
        sendingMessage.value = false
        
        // 记录失败的短信历史
        recordSmsHistory(currentUser.value, smsForm.content, 'failed', null, error.message)
      })
    
  }).catch(() => {
    // 用户取消发送
    sendingMessage.value = false
    smsSendingStatus.value = ''
    ElMessage({
      type: 'info',
      message: '已取消发送'
    })
  })
}

// 模拟SMS API调用
const simulateSmsApiCall = (requestData) => {
  return new Promise((resolve, reject) => {
    // 模拟请求延迟 - 随机1-3秒
    const delay = 1000 + Math.random() * 2000
    
    // 模拟成功率 - 90%成功，10%失败
    const isSuccess = Math.random() < 0.9
    
    setTimeout(() => {
      if (isSuccess) {
        // 模拟成功响应
        resolve({
          code: 0,
          message: "短信发送成功",
          success: true,
          messageId: generateMessageId(),
          fee: 1, // 模拟计费条数
          timestamp: new Date().toISOString()
        })
      } else {
        // 模拟可能的失败原因
        const errorReasons = [
          "手机号码不正确",
          "短信内容含有敏感词",
          "短信发送频率超限",
          "账户余额不足",
          "网络连接超时"
        ]
        const errorReason = errorReasons[Math.floor(Math.random() * errorReasons.length)]
        
        reject({
          code: 500,
          message: errorReason,
          success: false,
          timestamp: new Date().toISOString()
        })
      }
    }, delay)
  })
}

// 生成消息ID
const generateMessageId = () => {
  return 'SMS_' + Date.now().toString() + '_' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
}

// 获取短信服务配置
const getSmsConfig = () => {
  // 实际项目中，这些配置可能来自后端API或者环境变量
  return {
    signature: '医疗健康', // 短信签名
    templateId: 'SMS_123456789', // 模板ID
    accessKey: 'demo_access_key',
    secretKey: 'demo_secret_key',
    endpoint: 'https://sms-api.example.com/send'
  }
}

// 记录短信发送历史
const recordSmsHistory = (user, message, status = 'success', messageId = null, errorMsg = null) => {
  // 创建一条新的短信发送记录
  const newRecord = {
    id: Date.now(),
    messageId: messageId || `local_${Date.now()}`,
    userId: user.id || 'user_' + user.username,
    username: user.username,
    phone: user.phone,
    time: formatDateTime(new Date()),
    message: message,
    status: status,
    errorMessage: errorMsg || '',
    channel: smsForm.channel,
    priority: smsForm.priority
  }
  
  // 添加到本地存储的历史记录中
  const existingHistory = JSON.parse(localStorage.getItem('smsHistory') || '[]')
  existingHistory.unshift(newRecord) // 将新记录添加到开头
  
  // 只保留最近的100条记录，避免本地存储过大
  if (existingHistory.length > 100) {
    existingHistory.splice(100)
  }
  
  localStorage.setItem('smsHistory', JSON.stringify(existingHistory))
  console.log('短信历史记录已保存:', newRecord)
}

// 获取短信发送历史记录
const getSmsHistory = () => {
  smsHistoryLoading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    // 从本地存储获取历史记录
    // 实际项目中，这应该是通过API从后端获取
    const history = JSON.parse(localStorage.getItem('smsHistory') || '[]')
    smsHistoryList.value = history
    smsHistoryLoading.value = false
  }, 500)
}

// 显示短信历史记录
const showSmsHistory = () => {
  smsHistoryVisible.value = true
  getSmsHistory()
}

// 方法: 查看用户详情
const viewDetail = (user) => {
  console.log('查看用户详情:', user.username)
}

// 更新趋势图数据
const updateTrendData = () => {
  if (!trendChartInstance) return

  const days = parseInt(chartTimeRange.value)
  
  // 获取当前筛选条件下的未记录用户数据
  let filteredData = getUnrecordedData()
  
  // 应用筛选条件
  if (listQuery.dateRange) {
    switch (listQuery.dateRange) {
      case 'within3days':
        filteredData = filteredData.filter(item => item.missedDays <= 3)
        break
      case 'last3days':
        filteredData = filteredData.filter(item => item.missedDays > 3)
        break
      case 'last7days':
        filteredData = filteredData.filter(item => item.missedDays > 7)
        break
      case 'last30days':
        filteredData = filteredData.filter(item => item.missedDays > 30)
        break
    }
  }

  if (listQuery.userType) {
    filteredData = filteredData.filter(item => item.userType === (listQuery.userType === 'normal' ? '普通' : '肥胖'))
  }

  if (listQuery.recordType) {
    filteredData = filteredData.filter(item => {
      if (listQuery.recordType === 'diet') {
        return item.missedType.includes('饮食')
      } else if (listQuery.recordType === 'exercise') {
        return item.missedType.includes('运动')
      }
      return true
    })
  }

  // 生成日期数组和数据
  const now = new Date()
  const xData = []
  const unrecordedData = []
  
  // 生成过去days天的日期数组
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`
    xData.push(formattedDate)
    
    // 计算这一天有多少用户未记录
    // 对于每个日期，统计在那一天未记录的用户数量
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    // 计算在这一天未记录的用户数量
    const dayUnrecordedCount = filteredData.filter(user => {
      const lastRecord = new Date(user.lastRecordTime)
      return lastRecord < dayStart
    }).length
    
    unrecordedData.push(dayUnrecordedCount)
  }

  trendChartInstance.setOption({
    legend: {
      show: false
    },
    xAxis: { 
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#ebeef5'
        }
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ebeef5',
      borderWidth: 1,
      textStyle: {
        color: '#606266'
      },
      formatter: function(params) {
        const param = params[0]
        return `${param.name}<br/>未记录用户：<strong>${param.value}</strong>人`
      }
    },
    series: [
      {
        name: '未记录用户',
        data: unrecordedData,
        type: 'line',
        smooth: true,
        lineStyle: { width: 3 },
        itemStyle: { color: '#409EFF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        }
      }
    ]
  })
}

// 初始化图表
const initCharts = () => {
  // 初始化趋势图
  trendChartInstance = echarts.init(trendChart.value)
  trendChartInstance.setOption({
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20px',
      containLabel: true
    },
    title: { text: '' },
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ebeef5',
      borderWidth: 1,
      textStyle: {
        color: '#606266'
      }
    },
    xAxis: { 
      type: 'category', 
      data: [], 
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: { 
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#ebeef5'
        }
      }
    },
    series: []
  })
  
  // 更新趋势图数据
  updateTrendData()

  // 初始化减重数据图
  weightChartInstance = echarts.init(weightChart.value)
  
  // 计算减重分布数据
  const allUsers = getAllData()
  const weightReductionData = allUsers.map(user => user.originalWeight - user.currentWeight)
  
  // 统计不同减重区间的人数
  const ranges = [
    { min: 0, max: 5, label: '0-5kg' },
    { min: 5, max: 10, label: '5-10kg' },
    { min: 10, max: 15, label: '10-15kg' },
    { min: 15, max: 20, label: '15-20kg' },
    { min: 20, max: Infinity, label: '>20kg' }
  ]
  
  const distribution = ranges.map(range => ({
    value: weightReductionData.filter(v => v >= range.min && v < range.max).length,
    name: range.label
  }))

  weightChartInstance.setOption({
    title: { text: '' },
    tooltip: { 
      trigger: 'axis',
      formatter: '{b}: {c}人'
    },
    xAxis: { 
      type: 'category', 
      data: ranges.map(r => r.label),
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: { 
      type: 'value',
      axisLabel: {
        color: '#606266'
      }
    },
    series: [{
      data: distribution.map(d => d.value),
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 0.5, color: '#188df0' },
          { offset: 1, color: '#188df0' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}人'
      }
    }]
  })

  // 初始化年龄分布图
  ageChartInstance = echarts.init(ageChart.value)

  // 计算年龄分布数据
  const ageRanges = [
    { min: 20, max: 30, label: '20-30岁' },
    { min: 30, max: 40, label: '30-40岁' },
    { min: 40, max: 50, label: '40-50岁' },
    { min: 50, max: 60, label: '50-60岁' },
    { min: 60, max: Infinity, label: '>60岁' }
  ]

  const ageDistribution = ageRanges.map(range => ({
    value: allUsers.filter(user => user.age >= range.min && user.age < range.max).length,
    name: range.label
  }))

  ageChartInstance.setOption({
    title: { text: '' },
    tooltip: { 
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 15,
      textStyle: {
        fontSize: 12
      }
    },
    series: [{
      type: 'pie',
      radius: ['30%', '60%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      data: ageDistribution.map((item, index) => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: [
            '#91cc75', // 绿色
            '#5470c6', // 蓝色
            '#fac858', // 黄色
            '#ee6666', // 红色
            '#73c0de'  // 浅蓝色
          ][index]
        }
      }))
    }]
  })

  // 初始化用户类型分布图
  userTypeChartInstance = echarts.init(userTypeChart.value)
  
  // 计算用户类型分布
  const userTypeCount = {
    normal: allUsers.filter(u => u.userType === '普通').length,
    obese: allUsers.filter(u => u.userType === '肥胖').length
  }

  userTypeChartInstance.setOption({
    title: { text: '' },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 15,
      textStyle: {
        fontSize: 12
      }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      data: [
        { 
          value: userTypeCount.normal, 
          name: '普通用户',
          itemStyle: { color: '#91cc75' }
        },
        { 
          value: userTypeCount.obese, 
          name: '肥胖用户',
          itemStyle: { color: '#fac858' }
        }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        show: false,
        position: 'center'
      },
      labelLine: {
        show: false
      }
    }]
  })
}

// 方法: 调整图表大小
const resizeCharts = () => {
  trendChartInstance?.resize()
  weightChartInstance?.resize()
  ageChartInstance?.resize()
  userTypeChartInstance?.resize()
}

// 生命周期钩子
onMounted(() => {
  loading.value = true
  setTimeout(() => {
    // 获取数据并初始化图表
    fetchData()
    initCharts()
    loading.value = false
  }, 500)
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  // 清除窗口大小变化监听
  window.removeEventListener('resize', resizeCharts)
  
  // 销毁所有图表实例
  trendChartInstance?.dispose()
  weightChartInstance?.dispose()
  ageChartInstance?.dispose()
  userTypeChartInstance?.dispose()
})

// 模拟请求时添加请求拦截器进行身份验证
axios.interceptors.request.use(config => {
  // 如果是短信API请求，添加认证信息
  if (config.url && config.url.includes('/api/sms')) {
    // 添加认证信息，实际项目中应从配置或环境变量中获取
    config.headers = {
      ...config.headers,
      'Authorization': 'Bearer SMS_API_TOKEN',
      'X-SMS-Account': 'YOUR_SMS_ACCOUNT'
    }
  }
  return config
})

// 添加清空历史记录方法
const clearSmsHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有短信发送历史记录吗？此操作不可恢复。',
    '清空确认',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    localStorage.removeItem('smsHistory')
    smsHistoryList.value = []
    ElMessage({
      message: '短信发送历史记录已清空',
      type: 'success'
    })
  }).catch(() => {})
}
</script>

<style scoped>
.medical-dashboard {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 20px;
}

.mr-5 {
  margin-right: 5px;
}

.stat-card {
  text-align: center;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  overflow: hidden;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: absolute;
  top: 15px;
  left: 15px;
  color: white;
}

.user-icon {
  background-color: #409EFF;
}

.today-icon {
  background-color: #F56C6C;
}

.days-icon {
  background-color: #E6A23C;
}

.stat-content {
  width: 100%;
  padding: 0 15px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
}

.stat-value {
  font-size: 30px;
  font-weight: bold;
  margin: 10px 0;
  color: #303133;
}

.stat-progress {
  margin-top: 10px;
  padding: 0 10px;
}

.stat-detail {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.stat-percent {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.percent-value {
  font-size: 14px;
  font-weight: bold;
  color: #E6A23C;
  margin-right: 5px;
}

.percent-label {
  color: #909399;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.chart-container {
  position: relative;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #67C23A;
  padding: 30px 0;
}

.empty-data span {
  margin-top: 8px;
  font-size: 14px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.data-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.update-time {
  display: flex;
  align-items: center;
  gap: 5px;
}

.selected-filters {
  margin-bottom: 20px;
}

.filter-label {
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
}

.filter-tag {
  margin-right: 5px;
}

.filter-select {
  width: 150px;
  font-weight: 500;
}

.filter-select :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.filter-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

.filter-select :deep(.el-select__tags) {
  max-width: calc(100% - 30px);
}

.custom-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-select :deep(.el-input__inner) {
  font-weight: bold;
  color: #409EFF;
}

/* 联系用户弹窗样式 */
.contact-info {
  padding: 10px 0;
}

.user-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.info-item .value {
  flex: 1;
}

.phone-number {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.message-block {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 15px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.message-title {
  font-weight: 500;
  color: #303133;
}

.message-preview {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  color: #606266;
  font-size: 13px;
  position: relative;
}

.message-preview p {
  margin: 0;
  line-height: 1.5;
  padding-right: 80px;
}

.sms-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.copy-button {
  position: absolute;
  right: 10px;
  top: 10px;
}

.copy-button .el-icon {
  margin-right: 4px;
}

/* 页面顶部工具栏 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.tool-bar {
  display: flex;
  gap: 10px;
}

.tool-bar .el-button .el-icon {
  margin-right: 4px;
}

/* 短信历史记录样式 */
.history-tools {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

.empty-history .el-icon {
  font-size: 48px;
  margin-bottom: 10px;
}
</style> 