<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="24" :xs="30">
        <!--        <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px" size="small">

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
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="search">search</el-button>
            &lt;!&ndash;            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>&ndash;&gt;
          </el-form-item>
        </el-form>-->

        <el-table
          :v-loading="loading"
          element-loading-spinner="el-icon-loading"
          border
          highlight-current-row
          style="width: 100%"
          :data="pageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column v-if="false" align="center" label="id" prop="id" width="100" />
          <el-table-column align="center" label="Username" prop="username" width="250" />
          <el-table-column align="center" label="Role Name" prop="roleName" width="250" />
          <el-table-column align="center" label="Banned" prop="banned" width="250" />
          <el-table-column align="center" label="Operation">
            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                plain
                @click.stop="handleUpdate(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>

      </el-col>
    </el-row>
    <!-- 新增或修改参数配置对话框 -->
    <el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="800px">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="new">
          <el-input type="password" v-model="form.new" placeholder="new password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit()">confirm</el-button>
        <el-button @click="dialog.visible=false">cancel</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { add, del, ban, unban, list, patch } from '@/api/system/user'
import { getinfo, update } from '@/api/pms/account'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
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
    handleSelectionChange(selection) {
      this.id = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleQuery() {
      this.queryParams.page = this.pagination.page
      this.queryParams.limit = this.pagination.limit
      list({}).then(response => {
        const { data, total } = response
        this.pageList = data
        this.pagination.total = total
        this.loading = false
      })
    },
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
    async handleAdd() {
      this.resetForm()
      this.dialog = {
        title: 'new user added',
        visible: true
      }
      // await this.loadData()
      // await this.loadDeptOptions()
    },
    async handleUpdate(row) {
      this.dialog = {
        title: 'Change Password',
        visible: true
      }
    },
    handleSubmit: function() {
      update({ password: this.form.new }).then(() => {
        this.$message.success('modify password successfully')
        this.dialog.visible = false
        // this.handleQuery()
        // this.$router.go(0)
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

    loadData() {
      getinfo().then(response => {
        if (response.code === 401) {
          removeToken()
          this.$router.go(0)
          console.log('token has expired')
        }
        let data_tmp = {}
        data_tmp = response.data.data
        const tmp = {}
        tmp['id'] = data_tmp.id
        tmp['username'] = data_tmp.username
        tmp['banned'] = data_tmp.banned.toString()
        const roleId = data_tmp.roleId
        if (roleId === 1) {
          tmp['roleName'] = 'Checker'
        } else if (roleId === 2) {
          tmp['roleName'] = 'Admin'
        } else {
          tmp['roleName'] = 'Super'
        }
        this.pageList.push(tmp)
      })
        .catch(err => {
          // this.$router.go(0)
          /*        removeToken()
                  this.$router.go(0)*/
          console.log(err)
        })
    },

    resetForm() {
      this.form = {
        id: undefined,
        oldPassword: undefined,
        /*        mobile: undefined,
                email: undefined,
                gender: undefined,
                remark: undefined,*/
        newPassword: undefined
      }
      if (this.$refs['form']) {
        this.$refs['form'].resetFields()
      }
    }
  }
}
</script>
