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

          <!--          <el-form-item prop="search">
                      <el-input
                        v-model="searchKeyword"
                        clearable
                        placeholder="search keyword"
                        size="small"
                        style="width: 240px"
                        @keyup.enter.native="search">
                      </el-input>

                    </el-form-item>-->
          <!--          <el-form-item prop="mobile" style="margin-left: 10px">
                      <el-input
                        v-model="queryParams.mobile"
                        clearable
                        placeholder="手机号码"
                        size="small"
                        style="width: 240px"
                        @keyup.enter.native="handleQuery"
                      />
                    </el-form-item>-->
          <el-form-item prop="status" style="margin-left: 100px">
            <!--            <el-select
                          v-model="queryParams.status"
                          clearable
                          size="small"
                          style="width: 150px"
                          placeholder="all"
                        >
                          <el-option label="normal" value="1"/>
                          <el-option label="banned" value="0"/>
                        </el-select>-->
          </el-form-item>
          <el-form-item>
            <!--            <el-button icon="el-icon-search" type="primary" @click="search">search</el-button>-->
            <!--            <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>-->
          </el-form-item>
        </el-form>

        <el-table
          :v-loading="loading"
          element-loading-spinner="el-icon-loading"
          border
          :data="pageList"
        >
          <el-table-column v-if="false" align="center" label="id" prop="id" width="150" />
          <el-table-column align="center" label="Type Name" prop="typeName" />
          <el-table-column align="center" label="Operation" width="500">

            <template slot-scope="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                plain
                @click.stop="handleUpdate(scope.row)"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.stop="handleDelete(scope.row)"
              />
              <el-button
                type="info"
                icon="el-icon-top"
                size="mini"
                circle
                plain
                @click.stop="move_Up(scope.$index,scope.row)"
              />
              <el-button
                type="info"
                icon="el-icon-bottom"
                size="mini"
                circle
                plain
                @click.stop="move_Down(scope.$index,scope.row)"
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
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="Type Name">
          <el-input v-model="form.name" placeholder="input the name of the new type" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">confirm</el-button>
        <el-button @click="dialog.visible=false">cancel</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="dialog1.title" :visible.sync="dialog1.visible" width="800px">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="New Name">
          <el-input v-model="form.name" placeholder="please input the new name of this type" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="UpdateSubmit">confirm</el-button>
        <el-button @click="dialog1.visible=false">cancel</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { add, del, getList, moveDown, moveUp, update } from '@/api/pms/category'
import TreeSelect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { removeToken } from '@/utils/auth'
import Pagination from '@/components/Pagination'

export default {
  components: { TreeSelect, Pagination },
  data() {
    return {
      searchKeyword: '',
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
      dialog1: {
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
      form: {},
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
    move_Up(index, row) {
      var that = this
      console.log('上移', index, row.id)
      console.log(that.pageList[index])
      if (index > 0) {
        const upDate = that.pageList[index - 1]
        that.pageList.splice(index - 1, 1)
        that.pageList.splice(index, 0, upDate)
        this.handleMoveUp(row)
      } else {
        alert('Already the last one')
      }
    },
    move_Down(index, row) {
      var that = this
      console.log('下移', index, row)
      if ((index + 1) === that.pageList.length) {
        alert('Already the first one')
      } else {
        console.log(index)
        const downDate = that.pageList[index + 1]
        that.pageList.splice(index + 1, 1)
        that.pageList.splice(index, 0, downDate)
        this.handleMoveDown(row)
      }
    },
    handleMoveUp(row) {
      moveUp(row.id).then(() => {
        this.$message.success('move successfully')
      }).catch(err => {
        console.log(err)
      })
    },
    handleMoveDown(row) {
      moveDown(row.id).then(() => {
        this.$message.success('move successfully')
      }).catch(err => {
        console.log(err)
      })
    },
    // 多选框选中数据
    async handleAdd() {
      this.dialog = {
        title: 'add new type',
        visible: true
      }
    },
    async handleUpdate(row) {
      this.dialog1 = {
        title: 'Modify good type',
        visible: true
      }
      this.id = row.id
    },
    UpdateSubmit() {
      const name = this.form.name
      update(this.id, { typeName: name }).then(() => {
        this.$message.success('modify successfully')
        this.dialog.visible = false
        this.$router.go(0)
      })
    },
    handleSubmit: function() {
      const name = this.form.name
      console.log(this.form.name)
      add({ typeName: name }).then(() => {
        this.$message.success('add successfully')
        this.dialog.visible = false
        // this.handleQuery()
        this.$router.go(0)
      })
    },
    handleDelete(row) {
      const ids = row.id
      this.$confirm('Do you want to delete this good type?', 'warning', {
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        type: 'Warning'
      }).then(function() {
        return del(ids)
      }).then(() => {
        this.$message.success('delete successfully')
        this.$router.go(0)
      }).catch(() =>
        this.$message.info('cancelled')
      )
    },

    loadData() {
      getList({ pageNo: this.pagination.page, pageSize: this.pagination.limit }).then(response => {
        if (response.code === 401) {
          removeToken()
          this.$router.go(0)
          console.log('token has expired')
        }
        this.pageList = response.data.data.list
        this.pagination.total = response.data.data.total
      })
        .catch(err => {
          console.log(err)
          /*          if (err === 'Error: Request failed with status code 401') {
                        removeToken()
                        this.$router.go(0)
                      }*/
        })
    }

  }
}
</script>
