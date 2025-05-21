<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
<!--
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['manageusers:manageusers:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manageusers:manageusers:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manageusers:manageusers:remove']"
        >删除</el-button>
      </el-col>
-->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['manageusers:manageusers:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="manageusersList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="viewDetail(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>

      <el-table-column label="手机号" align="center" prop="phone" />
      <el-table-column label="邮箱" align="center" prop="email" />
      <el-table-column label="用户角色" align="center" prop="userRole" />
      <el-table-column label="用户名" align="center" prop="username" />
      <el-table-column label="生日" align="center" prop="birthday" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="age" />
      <el-table-column label="性别" align="center" prop="gender" />
      <el-table-column label="身高" align="center" prop="height" />
      <el-table-column label="原始体重" align="center" prop="originalweight" />
      <el-table-column label="当前" align="center" prop="currentweight" />
      <el-table-column label="体脂率" align="center" prop="fatPercentage" />
      <el-table-column label="健康状况" align="center" prop="healthStatus" />
      <el-table-column label="预期体重" align="center" prop="targetWeight" />
      <el-table-column label="饮食偏好" align="center" prop="preference" />
      <el-table-column label="过敏原" align="center" prop="allergies" />
      <el-table-column label="最后记录时间" align="center" prop="lastLogin" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastLogin, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改管理用户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="manageusersRef" :model="form" :rules="rules" label-width="80px">
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Manageusers">
import { listManageusers, getManageusers, delManageusers, addManageusers, updateManageusers } from "@/api/manageusers/manageusers";
import { useRouter } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();

const manageusersList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    username: null,
    healthStatus: null,
  },
  rules: {
    username: [
      { required: true, message: "用户名不能为空", trigger: "blur" }
    ],
    healthStatus: [
      { required: true, message: "健康状况不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询管理用户列表 */
function getList() {
  loading.value = true;
  listManageusers(queryParams.value).then(response => {
    manageusersList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查看用户详情 */
function viewDetail(row) {
  router.push({
    path: '/manageusers/detail/index',
    query: {
      id: row.peopleId
    }
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    peopleId: null,
    phone: null,
    email: null,
    thirdPartyId: null,
    password: null,
    userRole: null,
    username: null,
    birthday: null,
    age: null,
    gender: null,
    height: null,
    originalweight: null,
    currentweight: null,
    fatPercentage: null,
    healthStatus: null,
    targetWeight: null,
    preference: null,
    allergies: null,
    registration: null,
    lastLogin: null,
    isActive: null,
    userId: null
  };
  proxy.resetForm("manageusersRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.peopleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["manageusersRef"].validate(valid => {
    if (valid) {
      if (form.value.peopleId != null) {
        updateManageusers(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addManageusers(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _peopleIds = row.peopleId || ids.value;
  proxy.$modal.confirm('是否确认删除管理用户编号为"' + _peopleIds + '"的数据项？').then(function() {
    return delManageusers(_peopleIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('manageusers/manageusers/export', {
    ...queryParams.value
  }, `manageusers_${new Date().getTime()}.xlsx`)
}

getList();
</script>
