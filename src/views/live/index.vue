<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.streamerId"
        placeholder="请输入主播ID"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.streamerName"
        placeholder="请输入直播ID"
        style="width: 200px; margin-left: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        查询
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新建
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        align="center"
        width="40"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="直播ID" width="110" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.liveId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="房间号" width="110" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.roomId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主播ID" width="110" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.streamerId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="直播封面" width="170" align="center">
        <template slot-scope="{row}">
          <img :src=" row.liveCover " width="100" height="100">
        </template>
      </el-table-column>
      <el-table-column label="简介" width="110" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="直播状态" width="80" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.liveStatusShow }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划开播时间" width="170" align="center">
        <template slot-scope="{ row }">
          <span>{{
            row.planStartTime | parseTime("{y}-{m}-{d} {h}:{i}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="计划下播时间" width="170" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.planEndTime | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="240"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button
            type="primary"
            size="mini"
            style="margin-left: 4px; margin-top: 4px"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            type="primary"
            size="mini"
            style="margin-left: 4px; margin-top: 4px"
            @click="playLive(row)"
          >
            直播预览
          </el-button>
          <el-button
            class="copyPushUrlBtn"
            type="success"
            size="mini"
            style="margin-left: 4px; margin-top: 4px"
            v-bind:data-clipboard-text="row.pushUrl"
            @click="copyPushUrl(row)"
          >
            推流地址
          </el-button>
          <el-button
            class="copyPullUrlBtn"
            type="success"
            size="mini"
            style="margin-left: 4px; margin-top: 4px"
            v-bind:data-clipboard-text="row.pullUrl"
            @click="copyPullUrl(row)"
          >
            拉流地址
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            style="margin-left: 4px; margin-top: 4px"
            @click="handleDelete(row, $index)"
          >
            禁流
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="warning"
            style="margin-left: 4px; margin-top: 4px"
            @click="handleDelete(row, $index)"
          >
            恢复推流
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
    <el-dialog title="实时预览" :visible.sync="dialogVideoVisible" @opened="openPlay()">
      <div id="mse"></div>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="直播间号" prop="roomId">
          <el-input
            v-model="temp.roomId"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="input"
            placeholder="Please input"
          />
        </el-form-item>
        <el-form-item label="主播ID" prop="streamerId">
          <el-input
            v-model="temp.streamerId"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="input"
            placeholder="Please input"
          />
        </el-form-item>
        <el-form-item label="直播介绍" prop="description">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
        <el-form-item label="开播时间" prop="planStartTime">
          <el-date-picker
            v-model="temp.planStartTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="Please pick a date"
          />
        </el-form-item>
        <el-form-item label="下播时间" prop="planEndTime">
          <el-date-picker
            v-model="temp.planEndTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="Please pick a date"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import Player from 'xgplayer';
import FlvPlayer from 'xgplayer-flv';
import { pageList ,createLive} from '@/api/live'
import Clipboard from 'clipboard';
import 'xgplayer/dist/index.min.css'


const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      playingPullUrl:'',
      dialogVideoVisible: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  mounted() {
  },
  methods: {
    copyPullUrl(row) {
      const clipboard = new Clipboard('.copyPullUrlBtn');
      clipboard.on('success', (e) => {
        console.log('已成功将内容复制到剪贴板！');

        e.clearSelection(); // 清除选定文本
      });

      clipboard.on('error', () => {
        console.warn('无法复制到剪贴板！');
      });
      this.$message('已复制拉流地址');
      console.log(row)
    },
    copyPushUrl(row) {
      const clipboard = new Clipboard('.copyPushUrlBtn');
      clipboard.on('success', (e) => {
        console.log('已成功将内容复制到剪贴板！');

        e.clearSelection(); // 清除选定文本
      });

      clipboard.on('error', () => {
        console.warn('无法复制到剪贴板！');
      });
      this.$message('已复制推流地址');
      console.log(row)
    },
    playLive(row) {
      this.dialogVideoVisible = true
      this.playingPullUrl=row.pullUrl
    },
    openPlay(){
      let player = new Player({
        id: 'mse',
        plugins: [FlvPlayer],
        // poster: this.live.liveCover,
        url: this.playingPullUrl,
        isLive: true,
        playsinline: true
      });
      this.player=player
    },
    getList() {
      this.listLoading = true
      pageList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data.list
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
      // this.list = [{ id: '1',liveId:'112233', roomId:'123',streamerId:'Qin',description:'稻米香香香',liveStatus:'待开播',planStartTime:'2023-10-26 18:00:00', planEndTime:'2023-10-26 23:59:59'} ]
      // this.total = 1
      this.listLoading = false
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createLive(this.temp).then(() => {
            // this.list.unshift(this.temp)
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
