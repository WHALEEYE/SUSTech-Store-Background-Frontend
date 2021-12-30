<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="24" :xs="30">
        <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px" size="small">
          <el-form-item>
            <el-button
              icon="el-icon-plus"
              type="primary"
              @click="handleAdd"
            >add
            </el-button>
          </el-form-item>

          <el-form-item prop="search">
            <el-input
              v-model="searchName"
              clearable
              placeholder="username"
              size="small"
              style="width: 240px"
              @keyup.enter.native="search"
            />
          </el-form-item>
          <!--          <el-form-item prop="status" style="margin-left: 100px" />-->
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search">search</el-button>
            <!--            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>-->
          </el-form-item>
        </el-form>

        <el-table
          v-if=""
          :v-loading="loading"
          element-loading-spinner="el-icon-loading"
          border
          highlight-current-row
          style="width: 100%"
          :data="pageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column v-if="false" align="center" label="id" prop="id" width="100" />
          <el-table-column align="center" label="Username" prop="username" width="160" />
          <el-table-column align="center" label="Role Name" prop="roleName" width="160" />
          <el-table-column align="center" label="Banned" prop="banned" width="160" />
          <el-table-column align="center" label="Created Time" prop="createdTime" width="300" />
          <el-table-column align="center" label="Updated Time" prop="updatedTime" width="300" />
          <el-table-column align="center" label="Operation">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.banned==='false'&& scope.row.id!==2"
                type="primary"
                icon="el-icon-close"
                size="mini"
                circle
                plain
                @click.stop="banUser(scope.row)"
              />
              <el-button
                v-if="scope.row.banned==='true'&& scope.row.id!==2"
                type="primary"
                icon="el-icon-check"
                size="mini"
                circle
                plain
                @click.stop="unbanUser(scope.row)"
              />
              <el-button
                v-if="scope.row.id!==2"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.stop="handleDelete(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="pagination.total>0"
          :limit.sync="pagination.limit"
          :page.sync="pagination.page"
          :total="pagination.total"
          @pagination="loadData"
        />
      </el-col>
    </el-row>
    <!-- 新增或修改参数配置对话框 -->
    <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="username" prop="username">
          <el-input v-model="form.username" placeholder="please input username" />
        </el-form-item>
        <el-form-item label="password" prop="password">
          <el-input v-model="form.password" type="password" placeholder="password: 6-20 numbers+letters" />
        </el-form-item>
        <el-form-item label="role">
          <el-select v-model="form.roleId" placeholder="please choose">
            <el-option label="Admin" :value="2" />
            <!--            <el-option label="Checker" :value="1" />-->
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">confirm</el-button>
        <el-button @click="dialog.visible=false">cancel</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { add, ban, del, list, patch, unban } from '@/api/system/user'
import { getList } from '@/api/system/role'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { removeToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  components: { TreeSelect, Pagination },
  data() {
    return {
      searchName: '',
      // 遮罩层
      loading: true,
      // 选中数组
      id: undefined,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      queryParams: {
        username: undefined,
        mobile: undefined
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 10
      },
      pageList: [],
      dialog: {
        title: undefined,
        visible: false
      },
      // 部门名称
      deptName: undefined,
      // 部门树选项
      deptOptions: undefined,
      // 角色选项
      roleOptions: [{ name: 'Super', id: 3 }, { name: 'Admin', id: 2 }, { name: 'Normal', id: 1 }],
      // 表单参数
      form: {
        roleIds: []
      },
      // 表单校验
      rules: {
        username: [
          { required: true, message: 'username can not be null', trigger: 'blur' }
        ],
        password: [
          { required: true, pattern: /^[a-zA-Z0-9]{6,20}$/, message: 'password is not valid', trigger: 'blur' }
        ],
        roleId: [
          { required: true, message: 'role can not be null', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    search() {
      console.log(this.pagination.page)
      console.log(this.pagination.limit)
      console.log(this.searchName)
      getList({
        pageNo: this.pagination.page,
        pageSize: this.pagination.limit,
        searchKeyword: this.searchName
      }).then(response => {
        let data_tmp = {}
        data_tmp = response.data.data.list
        this.pageList = []
        this.pagination.total = response.data.data.total
        for (let i = 0; i < data_tmp.length; i++) {
          const tmp = {}
          tmp['id'] = data_tmp[i].id
          tmp['username'] = data_tmp[i].username
          tmp['roleName'] = data_tmp[i].roleName
          tmp['createdTime'] = data_tmp[i].createdTime
          tmp['updatedTime'] = data_tmp[i].updatedTime
          tmp['banned'] = data_tmp[i].banned.toString()
          this.pageList.push(tmp)
        }
        console.log(this.pageList[0])
      })
        .catch(err => {
          console.log('token has expired')
        })
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.id = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    async handleAdd() {
      this.resetForm()
      this.dialog = {
        title: 'Add New User',
        visible: true
      }
      // await this.loadData()
      // await this.loadDeptOptions()
    },
    handleSubmit: function() {
      const username = this.form.username
      if (this.checkName(username)) {
        add(this.form).then(() => {
          this.$message.success('add successfully')
          this.dialog.visible = false
          // this.handleQuery()
          this.$router.go(0)
        })
      }
    },
    banUser(row) {
      const ids = row.id
      this.$confirm('Do you want to ban this user?', 'warning', {
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        type: 'Warning'
      }).then(function() {
        return ban(ids)
      }).then(() => {
        this.$message.success('ban successfully')
        this.$router.go(0)
        // this.handleQuery()
      }).catch(() =>
        this.$message.info('cancelled')
      )
    },
    unbanUser(row) {
      const ids = row.id
      this.$confirm('Do you want to unban this user?', 'warning', {
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        type: 'Warning'
      }).then(function() {
        return unban(ids)
      }).then(() => {
        this.$message.success('unban successfully')
        this.$router.go(0)
      }).catch(() =>
        this.$message.info('cancelled')
      )
    },
    handleDelete(row) {
      const ids = row.id
      this.$confirm('Do you want to delete this user?', 'warning', {
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        type: 'Warning'
      }).then(function() {
        return del(ids)
      }).then(() => {
        this.$message.success('delete successfully')
        this.$router.go(0)
        // this.handleQuery()
      }).catch(() =>
        this.$message.info('cancelled')
      )
    },
    handleResetPassword(row) {
      this.$prompt('请输入' + row.username + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: (value) => {
          if (!value || value.trim().length < 1) {
            return '请填写新密码'
          }
        }
      }).then(({ value }) => {
        patch(row.id, {
          password: value
        }).then(() => {
          this.$message.success('修改成功，新密码是：' + value)
        })
      }).catch(() => {
      })
    },
    async loadData() {
      list({ pageNo: this.pagination.page, pageSize: this.pagination.limit }).then(response => {
        if (response.data.errCode === 401) {
          removeToken()
          this.$router.go(0)
          console.log('token has expired')
        }
        let data_tmp = {}
        data_tmp = response.data.data.list
        this.pageList = []
        this.pagination.total = response.data.data.total
        for (let i = 0; i < data_tmp.length; i++) {
          const tmp = {}
          tmp['id'] = data_tmp[i].id
          tmp['username'] = data_tmp[i].username
          tmp['roleName'] = data_tmp[i].roleName
          tmp['createdTime'] = data_tmp[i].createdTime
          tmp['updatedTime'] = data_tmp[i].updatedTime
          tmp['banned'] = data_tmp[i].banned.toString()
          this.pageList.push(tmp)
        }
      })
        .catch(err => {
          /*        removeToken()
            this.$router.go(0)*/
          console.log('token has expired')
        })
    },

    checkName(username) {
      for (var i in this.pageList) {
        if (this.pageList[i].username === username) {
          this.$message.error('the username has been used')
          return false
        }
      }
      return true
    },

    resetForm() {
      this.form = {
        id: undefined,
        username: undefined,
        roleIds: undefined
      }
      if (this.$refs['form']) {
        this.$refs['form'].resetFields()
      }
    }
  }
}
</script>
