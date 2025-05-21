<template>
  <div class="app-container">
    <!-- 用户基本信息 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card user-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="el-icon-user"></i> 用户详细信息</span>
              <el-button type="primary" plain size="small" icon="el-icon-back" @click="goBack">返回</el-button>
            </div>
          </template>
          <el-descriptions class="user-descriptions" :column="3" border>
            <el-descriptions-item label="用户ID">{{ form.peopleId }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ form.username }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ form.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ form.email }}</el-descriptions-item>
            <el-descriptions-item label="用户角色">{{ form.userRole }}</el-descriptions-item>
            <el-descriptions-item label="生日">{{ parseTime(form.birthday, '{y}-{m}-{d}') }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ form.age }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ form.gender }}</el-descriptions-item>
            <el-descriptions-item label="身高">{{ form.height }}</el-descriptions-item>
            <el-descriptions-item label="原始体重">{{ form.originalweight }}</el-descriptions-item>
            <el-descriptions-item label="当前体重">{{ form.currentweight }}</el-descriptions-item>
            <el-descriptions-item label="体脂率">{{ form.fatPercentage }}</el-descriptions-item>
            <el-descriptions-item label="健康状况">{{ form.healthStatus }}</el-descriptions-item>
            <el-descriptions-item label="预期体重">{{ form.targetWeight }}</el-descriptions-item>
            <el-descriptions-item label="饮食偏好">{{ form.preference }}</el-descriptions-item>
            <el-descriptions-item label="过敏原">{{ form.allergies }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ parseTime(form.registration, '{y}-{m}-{d}') }}</el-descriptions-item>
            <el-descriptions-item label="最后登录时间">{{ parseTime(form.lastLogin, '{y}-{m}-{d}') }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 减重趋势图 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="box-card weight-chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="el-icon-data-line"></i> 减重趋势图</span>
            </div>
          </template>
          <div class="chart-container">
            <div ref="weightChart" class="weight-chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 饮食记录 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="box-card food-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="el-icon-dish"></i> 饮食记录</span>
              <div class="filter-group">
                <el-radio-group v-model="foodDateType" size="small" @change="handleFoodDateChange">
                  <el-radio-button label="today">当日记录</el-radio-button>
                  <el-radio-button label="all">全部日期</el-radio-button>
                  <el-radio-button label="custom">自定义日期</el-radio-button>
                </el-radio-group>
                <el-date-picker
                  v-if="foodDateType === 'custom'"
                  v-model="foodCustomDate"
                  type="date"
                  placeholder="选择日期"
                  style="margin-left: 10px; width: 160px;"
                  value-format="YYYY-MM-DD"
                  @change="handleFoodDateChange"
                />
              </div>
            </div>
          </template>
          
          <el-table 
            v-loading="foodLoading" 
            :data="paginatedFoodList" 
            border 
            stripe
            highlight-current-row
            class="data-table"
            :header-cell-style="tableHeaderStyle"
            empty-text="暂无饮食记录"
          >
            <el-table-column label="日期" align="center" prop="date" width="120">
              <template #default="scope">
                {{ parseTime(scope.row.date, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column label="餐次" align="center" prop="mealType" width="100" />
            <el-table-column label="食物名称" align="center" prop="foodName" />
            <el-table-column label="数量(份)" align="center" prop="sum" width="90" />
            <el-table-column label="卡路里" align="center" prop="calories" width="90" />
            <el-table-column label="记录方式" align="center" prop="method" width="100" />
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              v-model:current-page="foodPagination.currentPage"
              v-model:page-size="foodPagination.pageSize"
              :total="filteredFoodList.length"
              layout="total, prev, pager, next"
              @current-change="handleFoodCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 运动记录 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="box-card exercise-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="el-icon-timer"></i> 运动记录</span>
              <div class="filter-group">
                <el-radio-group v-model="exerciseDateType" size="small" @change="handleExerciseDateChange">
                  <el-radio-button label="today">当日记录</el-radio-button>
                  <el-radio-button label="all">全部日期</el-radio-button>
                  <el-radio-button label="custom">自定义日期</el-radio-button>
                </el-radio-group>
                <el-date-picker
                  v-if="exerciseDateType === 'custom'"
                  v-model="exerciseCustomDate"
                  type="date"
                  placeholder="选择日期"
                  style="margin-left: 10px; width: 160px;"
                  value-format="YYYY-MM-DD"
                  @change="handleExerciseDateChange"
                />
              </div>
            </div>
          </template>
          
          <el-table 
            v-loading="exerciseLoading" 
            :data="paginatedExerciseList" 
            border 
            stripe
            highlight-current-row
            class="data-table"
            :header-cell-style="tableHeaderStyle"
            empty-text="暂无运动记录"
          >
            <el-table-column label="日期" align="center" prop="date" width="120">
              <template #default="scope">
                {{ parseTime(scope.row.date, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column label="运动名称" align="center" prop="exerciseName" />
            <el-table-column label="时长" align="center" prop="duration" width="100" />
            <el-table-column label="消耗卡路里" align="center" prop="caloriesBurned" width="120" />
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              background
              v-model:current-page="exercisePagination.currentPage"
              v-model:page-size="exercisePagination.pageSize"
              :total="filteredExerciseList.length"
              layout="total, prev, pager, next"
              @current-change="handleExerciseCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 医生建议 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="box-card advice-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span><i class="el-icon-chat-dot-round"></i> 医生建议</span>
              <div class="filter-group">
                <el-radio-group v-model="adviceDateType" size="small" @change="handleAdviceDateChange">
                  <el-radio-button label="today">当日建议</el-radio-button>
                  <el-radio-button label="all">全部建议</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          
          <!-- 历史建议列表 -->
          <div v-if="filteredAdviceList.length > 0" class="advice-history">
            <h4 class="advice-section-title">历史建议</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(advice, index) in paginatedAdviceList"
                :key="index"
                :timestamp="parseTime(advice.createTime)"
                placement="top"
                :type="adviceTypeColors[advice.adviceType] || 'primary'"
                :size="'large'"
              >
                <el-card class="advice-item-card" shadow="hover">
                  <template #header>
                    <div class="advice-item-header">
                      <span class="advice-type-tag" :class="'advice-type-' + (adviceTypeColors[advice.adviceType] || 'primary')">{{ advice.adviceType || '综合建议' }}</span>
                    </div>
                  </template>
                  <div class="advice-content">{{ advice.adviceContent }}</div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            
            <div class="pagination-container">
              <el-pagination
                background
                v-model:current-page="advicePagination.currentPage"
                v-model:page-size="advicePagination.pageSize"
                :total="filteredAdviceList.length"
                layout="total, prev, pager, next"
                @current-change="handleAdviceCurrentChange"
              />
            </div>
          </div>
          <div v-else>
            <el-empty description="暂无医生建议" />
          </div>
          
          <!-- 添加新建议 -->
          <div class="add-advice">
            <h4 class="advice-section-title">添加新建议</h4>
            <el-form :model="adviceForm" ref="adviceFormRef" class="advice-form">
              <el-form-item prop="adviceType">
                <el-select v-model="adviceForm.adviceType" placeholder="请选择建议类型">
                  <el-option label="饮食建议" value="饮食建议" />
                  <el-option label="运动建议" value="运动建议" />
                  <el-option label="睡眠建议" value="睡眠建议" />
                  <el-option label="综合建议" value="综合建议" />
                </el-select>
              </el-form-item>
              <el-form-item prop="adviceContent">
                <el-input
                  v-model="adviceForm.adviceContent"
                  type="textarea"
                  placeholder="请输入建议内容"
                  :rows="4"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitAdvice" :loading="submitLoading" icon="el-icon-s-promotion">发送建议</el-button>
                <el-button plain @click="resetAdviceForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="UserDetail">
import { getManageusers } from "@/api/manageusers/manageusers";
import { getWeightLogs, getFoodLogs, getExerciseLogs, getDoctorAdvice, addDoctorAdvice } from "@/api/manageusers/userdetail";
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { getCurrentInstance, ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
import { parseTime } from '@/utils/ruoyi';
import * as echarts from 'echarts';

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const form = ref({});
const peopleId = ref(route.query.id);

// 公共样式
const tableHeaderStyle = {
  backgroundColor: '#f5f7fa',
  color: '#303133',
  fontWeight: 'bold',
  borderBottom: '1px solid #EBEEF5',
  height: '44px'
};

// 减重趋势图相关
const weightChart = ref(null);
let weightChartInstance = null;
const weightLogs = ref([]);

// 饮食记录相关
const foodList = ref([]);
const foodLoading = ref(false);
const foodDateType = ref('today');
const foodCustomDate = ref(null);
const foodPagination = reactive({
  currentPage: 1,
  pageSize: 5
});
const filteredFoodList = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (foodDateType.value === 'all') {
    return foodList.value;
  } else if (foodDateType.value === 'today') {
    return foodList.value.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  } else if (foodDateType.value === 'custom' && foodCustomDate.value) {
    const customDate = new Date(foodCustomDate.value);
    customDate.setHours(0, 0, 0, 0);
    return foodList.value.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === customDate.getTime();
    });
  }
  return foodList.value;
});
const paginatedFoodList = computed(() => {
  const start = (foodPagination.currentPage - 1) * foodPagination.pageSize;
  const end = start + foodPagination.pageSize;
  return filteredFoodList.value.slice(start, end);
});

// 运动记录相关
const exerciseList = ref([]);
const exerciseLoading = ref(false);
const exerciseDateType = ref('today');
const exerciseCustomDate = ref(null);
const exercisePagination = reactive({
  currentPage: 1,
  pageSize: 5
});
const filteredExerciseList = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (exerciseDateType.value === 'all') {
    return exerciseList.value;
  } else if (exerciseDateType.value === 'today') {
    return exerciseList.value.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  } else if (exerciseDateType.value === 'custom' && exerciseCustomDate.value) {
    const customDate = new Date(exerciseCustomDate.value);
    customDate.setHours(0, 0, 0, 0);
    return exerciseList.value.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === customDate.getTime();
    });
  }
  return exerciseList.value;
});
const paginatedExerciseList = computed(() => {
  const start = (exercisePagination.currentPage - 1) * exercisePagination.pageSize;
  const end = start + exercisePagination.pageSize;
  return filteredExerciseList.value.slice(start, end);
});

// 医生建议相关
const adviceList = ref([]);
const adviceDateType = ref('today');
const adviceForm = reactive({
  peopleId: peopleId.value,
  adviceType: '综合建议',
  adviceContent: ''
});
const submitLoading = ref(false);
const adviceTypeColors = {
  '饮食建议': 'success',
  '运动建议': 'warning',
  '睡眠建议': 'info',
  '综合建议': 'primary'
};
const advicePagination = reactive({
  currentPage: 1,
  pageSize: 5
});
const filteredAdviceList = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (adviceDateType.value === 'all') {
    return adviceList.value;
  } else if (adviceDateType.value === 'today') {
    return adviceList.value.filter(item => {
      const itemDate = new Date(item.createTime);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });
  }
  return adviceList.value;
});
const paginatedAdviceList = computed(() => {
  const start = (advicePagination.currentPage - 1) * advicePagination.pageSize;
  const end = start + advicePagination.pageSize;
  return filteredAdviceList.value.slice(start, end);
});

/** 查询用户详细信息 */
function getDetail() {
  getManageusers(peopleId.value).then(response => {
    form.value = response.data;
  });
}

/** 查询用户减重记录 */
function getWeightLogData() {
  getWeightLogs(peopleId.value).then(response => {
    weightLogs.value = response.data;
    initWeightChart();
  });
}

/** 查询用户饮食记录 */
function getFoodLogData() {
  foodLoading.value = true;
  getFoodLogs(peopleId.value).then(response => {
    foodList.value = response.data;
    foodLoading.value = false;
  });
}

/** 查询用户运动记录 */
function getExerciseLogData() {
  exerciseLoading.value = true;
  getExerciseLogs(peopleId.value).then(response => {
    exerciseList.value = response.data;
    exerciseLoading.value = false;
  });
}

/** 查询医生建议 */
function getDoctorAdviceData() {
  getDoctorAdvice(peopleId.value).then(response => {
    adviceList.value = response.data;
  });
}

/** 初始化减重趋势图 */
function initWeightChart() {
  if (weightChartInstance) {
    weightChartInstance.dispose();
  }
  weightChartInstance = echarts.init(weightChart.value);
  
  const dates = weightLogs.value.map(item => parseTime(item.date, '{y}-{m}-{d}'));
  const weights = weightLogs.value.map(item => item.currentweight);
  
  const option = {
    title: {
      text: '用户体重变化趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} kg',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      textStyle: {
        color: '#333'
      },
      borderColor: '#ccc',
      borderWidth: 1
    },
    grid: {
      top: 60,
      right: 20,
      bottom: 60,
      left: 60
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        interval: 0,
        rotate: 45,
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '体重(kg)',
      nameTextStyle: {
        padding: [0, 0, 0, 40],
        color: '#666'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#ddd'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#eee'
        }
      }
    },
    series: [
      {
        name: '体重',
        type: 'line',
        data: weights,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [{ type: 'average', name: '平均值' }]
        },
        lineStyle: {
          width: 4,
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowBlur: 10
        },
        itemStyle: {
          color: '#409EFF',
          borderWidth: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: '#ff7043',
            borderColor: '#ff7043',
            borderWidth: 3,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 10
          }
        }
      }
    ]
  };
  
  weightChartInstance.setOption(option);
}

/** 提交医生建议 */
function submitAdvice() {
  if (!adviceForm.adviceContent) {
    proxy.$modal.msgError('请输入建议内容');
    return;
  }
  
  submitLoading.value = true;
  adviceForm.peopleId = peopleId.value;
  
  addDoctorAdvice(adviceForm).then(response => {
    proxy.$modal.msgSuccess('建议提交成功');
    adviceForm.adviceContent = '';
    getDoctorAdviceData();
    submitLoading.value = false;
  }).catch(() => {
    submitLoading.value = false;
  });
}

/** 重置建议表单 */
function resetAdviceForm() {
  adviceForm.adviceType = '综合建议';
  adviceForm.adviceContent = '';
}

/** 返回按钮操作 */
function goBack() {
  router.go(-1);
}

/** 清理组件资源 */
function cleanup() {
  // 清理图表实例
  if (weightChartInstance) {
    weightChartInstance.dispose();
    weightChartInstance = null;
  }
  
  // 清理数据
  form.value = {};
  weightLogs.value = [];
  foodList.value = [];
  exerciseList.value = [];
  adviceList.value = [];
  adviceForm.adviceContent = '';
  
  // 重置分页和过滤状态
  foodDateType.value = 'today';
  foodCustomDate.value = null;
  foodPagination.currentPage = 1;
  
  exerciseDateType.value = 'today';
  exerciseCustomDate.value = null;
  exercisePagination.currentPage = 1;
  
  adviceDateType.value = 'today';
  advicePagination.currentPage = 1;
}

// 路由离开钩子
onBeforeRouteLeave(() => {
  cleanup();
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  cleanup();
  // 移除事件监听
  window.removeEventListener('resize', function() {
    if (weightChartInstance) {
      weightChartInstance.resize();
    }
  });
});

// 窗口大小改变时重绘图表
const resizeHandler = function() {
  if (weightChartInstance) {
    weightChartInstance.resize();
  }
};
window.addEventListener('resize', resizeHandler);

onMounted(() => {
  getDetail();
  getWeightLogData();
  getFoodLogData();
  getExerciseLogData();
  getDoctorAdviceData();
});

// 处理饮食记录日期筛选
function handleFoodDateChange() {
  foodPagination.currentPage = 1;
}

// 处理运动记录日期筛选
function handleExerciseDateChange() {
  exercisePagination.currentPage = 1;
}

// 处理饮食记录分页
function handleFoodCurrentChange(page) {
  foodPagination.currentPage = page;
}

// 处理运动记录分页
function handleExerciseCurrentChange(page) {
  exercisePagination.currentPage = page;
}

// 处理医生建议日期筛选
function handleAdviceDateChange() {
  advicePagination.currentPage = 1;
}

// 处理医生建议分页
function handleAdviceCurrentChange(page) {
  advicePagination.currentPage = page;
}
</script>

<style scoped>
/* 全局样式 */
.app-container {
  padding: 20px;
  animation: fadeIn 0.5s ease-in-out;
  background-color: #f5f7fa;
}

.mt-20 {
  margin-top: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 卡片样式 */
.box-card {
  border-radius: 8px;
  transition: all 0.3s;
  margin-bottom: 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.box-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  font-size: 16px;
  padding: 12px 20px;
}

.card-header i {
  margin-right: 8px;
  font-size: 18px;
}

.filter-group {
  display: flex;
  align-items: center;
}

/* 用户信息卡片 */
.user-info-card {
  border-top: 4px solid #409EFF;
}

.user-descriptions {
  margin-top: 20px;
}

.user-descriptions :deep(.el-descriptions__label) {
  font-weight: bold;
  background-color: #f5f7fa;
}

.user-descriptions :deep(.el-descriptions__content) {
  padding: 12px 15px;
}

/* 减重趋势图卡片 */
.weight-chart-card {
  border-top: 4px solid #67C23A;
}

.weight-chart {
  width: 100%;
  height: 450px;
  padding: 10px;
}

/* 饮食记录卡片 */
.food-card {
  border-top: 4px solid #E6A23C;
}

/* 运动记录卡片 */
.exercise-card {
  border-top: 4px solid #F56C6C;
}

/* 表格样式 */
.data-table {
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.data-table :deep(th) {
  background-color: #f5f7fa !important;
  color: #303133;
  font-weight: bold;
}

.data-table :deep(td) {
  padding: 12px 0;
}

.data-table :deep(.el-table__row:hover) {
  background-color: #f0f5ff !important;
}

.pagination-container {
  text-align: right;
  padding: 15px 0;
}

/* 医生建议卡片 */
.advice-card {
  border-top: 4px solid #909399;
}

.advice-section-title {
  position: relative;
  padding-left: 12px;
  margin-bottom: 20px;
  font-size: 16px;
  color: #303133;
}

.advice-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  border-radius: 2px;
}

.advice-history {
  max-height: 650px;
  overflow-y: auto;
  padding-right: 10px;
  margin-bottom: 20px;
}

.advice-item-card {
  margin-bottom: 15px;
  border-radius: 8px;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.advice-item-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.advice-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.advice-type-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 4px;
  display: inline-block;
}

.advice-type-primary {
  background-color: #ecf5ff;
  color: #409EFF;
}

.advice-type-success {
  background-color: #f0f9eb;
  color: #67C23A;
}

.advice-type-warning {
  background-color: #fdf6ec;
  color: #E6A23C;
}

.advice-type-info {
  background-color: #f4f4f5;
  color: #909399;
}

.advice-content {
  font-size: 14px;
  line-height: 1.8;
  padding: 15px 0;
  white-space: pre-wrap;
}

.advice-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.add-advice {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.advice-form {
  max-width: 800px;
  margin: 0 auto;
}

.advice-form :deep(.el-form-item__content) {
  margin-bottom: 20px;
}

.advice-form :deep(.el-input__inner) {
  border-radius: 4px;
}

.advice-form :deep(.el-textarea__inner) {
  border-radius: 4px;
  padding: 10px;
  min-height: 120px;
  resize: vertical;
}

.advice-form :deep(.el-select) {
  width: 100%;
}
</style> 