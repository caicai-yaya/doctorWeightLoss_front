<template>
   <div class="app-container">
      <el-row :gutter="24" class="profile-container">
         <el-col :span="10" :xs="24">
            <el-card class="user-info-card" shadow="hover">
               <template v-slot:header>
                 <div class="clearfix">
                   <span class="header-title">个人信息</span>
                 </div>
               </template>
               <div>
                  <div class="text-center">
                     <userAvatar />
                  </div>
                  <ul class="list-group list-group-striped">
                     <li class="list-group-item">
                        <svg-icon icon-class="user" />
                        <span class="info-label">用户名称</span>
                        <div class="info-value">{{ state.user.userName }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="phone" />
                        <span class="info-label">手机号码</span>
                        <div class="info-value">{{ state.user.phonenumber }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="email" />
                        <span class="info-label">用户邮箱</span>
                        <div class="info-value">{{ state.user.email }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="tree" />
                        <span class="info-label">所属医院</span>
                        <div class="info-value" v-if="state.user.dept">{{ state.user.dept.deptName }} / {{ state.postGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="peoples" />
                        <span class="info-label">所属角色</span>
                        <div class="info-value">{{ state.roleGroup }}</div>
                     </li>
                     <li class="list-group-item">
                        <svg-icon icon-class="date" />
                        <span class="info-label">创建日期</span>
                        <div class="info-value">{{ state.user.createTime }}</div>
                     </li>
                  </ul>
               </div>
            </el-card>
         </el-col>
         <el-col :span="14" :xs="24">
            <el-card class="user-detail-card" shadow="hover">
               <template v-slot:header>
                 <div class="clearfix">
                   <span class="header-title">基本资料</span>
                 </div>
               </template>
               <el-tabs v-model="activeTab">
                  <el-tab-pane label="基本资料" name="userinfo">
                     <userInfo :user="state.user" />
                  </el-tab-pane>
                  <el-tab-pane label="修改密码" name="resetPwd">
                     <resetPwd />
                  </el-tab-pane>
               </el-tabs>
            </el-card>
         </el-col>
      </el-row>
   </div>
</template>

<script setup name="Profile">
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";

const activeTab = ref("userinfo");
const state = reactive({
  user: {},
  roleGroup: {},
  postGroup: {}
});

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data;
    state.roleGroup = response.roleGroup;
    state.postGroup = response.postGroup;
  });
};

getUser();
</script>

<style lang="scss" scoped>
.profile-container {
  display: flex;
  
  @media (max-width: 768px) {
    display: block;
  }
  
  .el-col {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.user-info-card, .user-detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .el-card__body {
    flex: 1;
    overflow: auto;
  }
  
  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.list-group {
  padding-left: 0;
  margin-top: 15px;
  
  .list-group-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 12px 5px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    
    &:last-child {
      border-bottom: none;
    }
    
    .svg-icon {
      margin-right: 8px;
      font-size: 18px;
      color: #409EFF;
    }
    
    .info-label {
      color: #606266;
      font-weight: 500;
      flex: 1;
    }
    
    .info-value {
      color: #303133;
      text-align: right;
      word-break: break-all;
      max-width: 60%;
    }
  }
}

.text-center {
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .user-info-card, .user-detail-card {
    margin-bottom: 15px;
    height: auto;
  }
  
  .list-group-item {
    padding: 10px 0;
    
    .info-value {
      max-width: 70%;
    }
  }
}
</style>
