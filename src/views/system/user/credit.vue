<template>
  <div class="app-container">
    <el-row :gutter="40">
      <el-col :span="24" :xs="30">

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
          <el-table-column align="center" label="Event Name" prop="eventName" width="200" />
          <el-table-column align="center" label="Description" prop="description" />
          <el-table-column align="center" label="Credit" prop="creditChange" width="75" />
          <el-table-column align="center" label="Change" prop="isAdd" width="125" />
          <el-table-column align="center" label="Operation" width="100">
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
          <el-input v-model="form.new" placeholder="new credit" />
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
import { getList, update } from '@/api/system/credit'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Pagination from '@/components/Pagination'
import { removeToken } from '@/utils/auth'
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
    async handleAdd() {
      this.resetForm()
      this.dialog = {
        title: 'new user added',
        visible: true
      }
    },
    handleSelectionChange(selection) {
      this.id = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    async handleUpdate(row) {
      this.dialog = {
        title: 'change password',
        visible: true
      }
      this.id = row.id
    },
    handleSubmit: function() {
      update(this.id, { creditChange: this.form.new }).then(() => {
        this.$message.success('modify credit change successfully')
        this.dialog.visible = false
        this.$router.go(0)
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
      getList().then(response => {
        if (response.data.errCode === 401) {
          removeToken()
          this.$router.go(0)
          console.log('token has expired')
        }
        this.pageList = []
        this.pageList = response.data.data
        this.pagination.total = response.data.data.total
        for (let i = 0; i < response.data.data.length; i++) {
          if (this.pageList[i].isAdd === true) {
            this.pageList[i].isAdd = 'add'
          } else {
            this.pageList[i].isAdd = 'deduct'
          }
        }
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
