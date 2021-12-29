<template>
  <div class="app-container">
    <el-row :gutter="40">

      <el-col :span="24" :xs="24">
        <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px" size="small">
          <el-form-item />

          <el-form-item prop="search">
            <el-input
              v-model="searchKeyword"
              clearable
              placeholder="keyword"
              size="small"
              style="width: 240px"
              @keyup.enter.native="search"
            />
            <el-input
              v-model="searchNickname"
              clearable
              placeholder="nickname"
              size="small"
              style="width: 240px; margin-left:10px"
              @keyup.enter.native="search"
            />
            <el-input
              v-model="searchPhoneNumber"
              clearable
              placeholder="phoneNumber"
              size="small"
              style="width: 240px; margin-left:10px"
              @keyup.enter.native="search"
            />

            <el-button icon="el-icon-search" type="primary" style="margin-left:10px" @click="search">Search</el-button>
            <!--            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>-->
          </el-form-item>
        </el-form>

        <el-table
          :v-loading="loading"
          element-loading-spinner="el-icon-loading"
          border
          :data="pageList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column v-if="false" align="center" label="id" prop="id" width="100" />
          <el-table-column align="center" label="Title" prop="title" width="150" fixed />
          <el-table-column align="center" label="Good Type" prop="goodType" width="150" />
          <el-table-column align="center" label="Price" prop="price" width="100" />
          <el-table-column align="center" label="Publisher Name" prop="publisherName" width="150" />
          <el-table-column align="center" label="Publisher Phone" prop="publisherPhone" width="150" />
          <el-table-column align="center" label="Description" prop="description" width="150" />
          <el-table-column align="center" label="Sold" prop="sold" />
          <el-table-column align="center" label="Created Time" prop="createdTime" width="200" />
          <el-table-column align="center" label="Updated Time" prop="updatedTime" width="200" />
          <el-table-column align="center" label="Operation" fixed="right" width="100">
            <template slot-scope="scope">
              <el-button
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
          <el-input v-model="form.password" placeholder="please input your password" />
        </el-form-item>
        <el-form-item label="role">
          <el-select v-model="form.roleId" placeholder="please choose">
            <el-option label="Admin" :value="2" />
            <el-option label="Checker" :value="1" />
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
import { add, del, detail, getList, patch, update } from '@/api/pms/goods'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { removeToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  components: { TreeSelect, Pagination },
  data() {
    return {
      searchKeyword: '',
      searchNickname: '',
      searchPhoneNumber: '',
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
          { required: true, message: 'password can not be null', trigger: 'blur' }
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
      getList({
        pageNo: this.pagination.page,
        pageSize: this.pagination.limit,
        searchKeyword: this.searchKeyword,
        searchNickname: this.searchNickname,
        searchPhoneNumber: this.searchPhoneNumber
      }).then(response => {
        if (response.data.errCode === 401) {
          removeToken()
          this.$router.go(0)
          console.log('token has expired')
        }
        this.pageList = response.data.data.list
        this.pagination.total = response.data.data.total
        for (let i = 0; i < this.pageList.length; i++) {
          this.pageList[i].sold = this.pageList[i].sold.toString()
        }
      })
        .catch(err => {
          console.log(err)
        })
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) {
        return true
      }
      return data.label.indexOf(value) !== -1
    },
    // 用户状态修改
    handleStatusChange(row) {
      const text = row.status === 1 ? '启用' : '停用'
      this.$confirm('确认要"' + text + row.username + '"用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return patch(row.id, { status: row.status })
      }).then(() => {
        this.$message.success(text + '成功')
      }).catch(function() {
        row.status = row.status === 0 ? 1 : 0
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
        title: 'new user added',
        visible: true
      }
      // await this.loadData()
      // await this.loadDeptOptions()
    },
    async handleUpdate(row) {
      this.resetForm()
      this.dialog = {
        title: '修改用户',
        visible: true
      }
      await this.loadRoleOptions()
      // await this.loadDeptOptions()
      const id = row.id || this.ids
      detail(id).then(response => {
        this.form = response.data
      })
    },
    handleSubmit: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const id = this.form.id
          if (id !== undefined) {
            update(this.form.id, this.form).then(() => {
              this.$message.success('修改成功')
              this.dialog.visible = false
              this.handleQuery()
            })
          } else {
            console.log(this.form)
            add(this.form).then(() => {
              this.$message.success('add successfully')
              this.dialog.visible = false
              // this.handleQuery()
              this.$router.go(0)
            })
          }
        }
      })
    },
    handleDelete(row) {
      const ids = row.id
      this.$confirm('Do you want to delete this good', 'warning', {
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

    loadData() {
      getList({ pageNo: this.pagination.page, pageSize: this.pagination.limit }).then(response => {
        if (response.data.errCode === 401) {
          removeToken()
          this.$router.go(0)
          console.log('token has expired')
        }
        this.pageList = response.data.data.list
        this.pagination.total = response.data.data.total
        for (let i = 0; i < this.pageList.length; i++) {
          this.pageList[i].sold = this.pageList[i].sold.toString()
        }
      })
        .catch(err => {
          console.log(err)
        })
    }

  }
}
</script>
