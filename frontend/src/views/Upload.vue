<template>
  <div class="upload-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>上传写真数据集</span>
        </div>
      </template>
      
      <div class="upload-content">
        <!-- Upload Options -->
        <div class="upload-options">
          <el-form :inline="false" label-width="120px" class="model-config-form">
            <el-form-item label="焦点检测模型">
              <el-select
                v-model="formData.focus_model"
                placeholder="选择焦点检测模型"
                style="width: 350px"
                :loading="loadingModels"
                filterable
                clearable
              >
                <el-option
                  v-for="model in focusModels"
                  :key="model"
                  :label="model"
                  :value="model"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="标签模型">
              <el-select
                v-model="formData.tag_model"
                placeholder="选择标签模型"
                style="width: 350px"
                :loading="loadingModels"
                filterable
                clearable
              >
                <el-option
                  v-for="model in tagModels"
                  :key="model"
                  :label="model"
                  :value="model"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button 
                type="warning" 
                :disabled="uploadingFiles.length === 0"
                @click="startUpload"
              >
                <el-icon>
                  <VideoPlay />
                </el-icon>
                开始上传
              </el-button>
            </el-form-item>
          </el-form>
          
          <el-divider />
          
          <!-- Upload Methods -->
          <div class="upload-methods">
            <div class="method-item">
              <el-upload
                ref="fileUploadRef"
                class="upload-demo"
                action="#"
                multiple
                accept=".zip"
                :auto-upload="false"
                :on-change="handleFileChange"
                :show-file-list="false"
              >
                <el-button type="primary">
                  <el-icon>
                    <UploadFilled />
                  </el-icon>
                  选择多个ZIP文件
                </el-button>
              </el-upload>
              <div class="method-hint">支持多个 .zip 文件</div>
            </div>
            
            <div class="method-divider">或</div>
            
            <div class="method-item">
              <el-button type="success" @click="selectFolder">
                <el-icon>
                  <Folder />
                </el-icon>
                选择父文件夹
              </el-button>
              <input
                ref="folderInputRef"
                type="file"
                webkitdirectory
                multiple
                class="folder-input"
                @change="handleFolderChange"
              />
              <div class="method-hint">选择父文件夹，自动按一级子文件夹分任务（仅处理图片）</div>
            </div>
          </div>
          <div class="selected-hint" v-if="uploadingFiles.length">
            <div class="selected-title">已选上传项 (文件夹/ZIP)</div>
            <ul>
              <li v-for="(file, idx) in uploadingFiles" :key="idx">
                {{ formatItemLabel(file) }}
              </li>
            </ul>
          </div>
          
          <div class="upload-tips">
            <el-alert
              title="提示"
              type="info"
              :closable="false"
              :center="true"
            >
              <div>
                <div>支持上传多个 .zip 文件，每个文件对应一个任务</div>
                <div>选择父文件夹时，自动按一级子文件夹拆分为任务（忽略视频，仅处理图片）</div>
                <div>自动去重，每簇保留最多{{ keepPerCluster }}张清晰度最高的图片</div>
                <div>并发上传限制：{{ concurrentLimit }} 个文件</div>
              </div>
            </el-alert>
          </div>
        </div>
        
        <!-- Upload Queue -->
        <div class="upload-queue-section">
          <upload-queue
            :uploading-files="uploadingFiles"
            @retry="handleRetryUpload"
            @clear="handleClearQueue"
          />
        </div>
        <div class="task-board">
          <div class="board-header">
            <div>
              <div class="board-title">任务列表 / 处理进度</div>
              <div class="board-sub">支持 ZIP 与文件夹任务，按任务展示处理进度</div>
            </div>
            <el-button text :icon="Refresh" @click="loadTaskBoard" :loading="loadingTasks">刷新</el-button>
          </div>
          <div v-if="tasksBoard.length" class="task-grid">
            <div v-for="task in tasksBoard" :key="task.id" class="task-card">
              <div class="card-head">
                <div class="task-card-title">{{ task.name }}</div>
                <el-tag size="small" :type="statusTag(task.status)">{{ statusLabel(task.status) }}</el-tag>
              </div>
              <div class="task-meta-row">
                <span>图片: {{ task.stats?.image_files || 0 }}</span>
                <span>保留: {{ task.stats?.kept_files || 0 }}</span>
              </div>
              <el-progress :percentage="task.progress" :status="getProgressStatus(task.status)" :stroke-width="6" />
              <div class="task-message">{{ task.message }}</div>
              <div class="task-actions">
                <el-button size="small" @click="startDedup(task)" :disabled="task.status === 'processing'">去重</el-button>
                <el-button size="small" @click="startCrop(task)" :disabled="task.status === 'processing'">裁切</el-button>
                <el-button size="small" @click="startCaption(task)" :disabled="task.status === 'processing'">提示词</el-button>
                <el-button size="small" type="primary" plain @click="startRunAll(task)" :loading="task.status === 'processing'">一键</el-button>
              </div>
              <div class="task-links">
                <el-button
                  text
                  size="small"
                  v-if="task.stage === 'de_duplication' || task.stage === 'preview_generation'"
                  @click="openReview(task.id, 'dedup')"
                >
                  查看去重
                </el-button>
                <el-button
                  text
                  size="small"
                  v-if="task.stage === 'cropping' || task.stage === 'focus_detection'"
                  @click="openReview(task.id, 'crop')"
                >
                  裁切预览
                </el-button>
                <el-button text size="small" @click="goTaskDetail(task.id)">查看详情</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="还没有任务，先上传 ZIP 或选择文件夹吧" />
        </div>
        <div class="log-panel">
          <div class="log-panel-header">
            <div>
              <div class="board-title">后端日志（最近）</div>
              <div class="board-sub">包含上传/解压/去重/裁切/提示词的详细进度与错误</div>
            </div>
            <el-button size="small" :loading="logsLoading" @click="loadLogs">刷新日志</el-button>
          </div>
          <div class="log-list">
            <div v-for="log in logs" :key="log.id" class="log-row">
              <span class="log-time">{{ formatTime(log.created_at) }}</span>
              <span class="log-level" :class="`lv-${log.level}`">{{ log.level }}</span>
              <span class="log-task">#{{ log.task_id || '-' }}</span>
              <span class="log-msg">{{ log.message }}</span>
            </div>
            <div v-if="!logs.length" class="log-empty">暂无日志</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>

  <el-dialog
    v-model="reviewDialog.visible"
    :title="reviewDialog.type === 'dedup' ? '查看去重结果' : '裁切预览'"
    width="90%"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <div v-if="reviewDialog.loading">
      <el-skeleton :rows="4" animated />
    </div>
    <div v-else class="review-grid">
      <div
        v-for="image in reviewDialog.images"
        :key="image.id"
        class="review-card"
        :class="{ inactive: !image.selected }"
        @click="toggleReviewSelection(image)"
      >
        <el-image
          :src="reviewDialog.type === 'crop' ? (image.crop_url || image.preview_url) : image.preview_url"
          fit="cover"
          :preview-src-list="[
            reviewDialog.type === 'crop'
              ? (image.crop_url || image.preview_url)
              : image.preview_url
          ].filter(Boolean)"
        />
        <div class="review-info">
          <span class="review-name">{{ image.orig_name }}</span>
          <el-tag size="small" :type="image.selected ? 'success' : 'danger'">
            {{ image.selected ? '保留' : '删除' }}
          </el-tag>
        </div>
        <div v-if="reviewDialog.type === 'dedup' && image.meta_json?.dedup" class="review-meta">
          清晰度: {{ image.meta_json?.dedup?.sharpness?.toFixed?.(1) || '-' }}
        </div>
        <div v-if="reviewDialog.type === 'crop' && image.meta_json?.focus" class="review-meta">
          置信度: {{ (image.meta_json?.focus?.confidence || 0).toFixed(2) }}
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="reviewDialog.visible = false">取消</el-button>
      <el-button type="primary" :loading="reviewDialog.saving" @click="saveReviewChanges">
        保存选择
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled, Folder, VideoPlay, Refresh } from '@element-plus/icons-vue'
import UploadQueue from '../components/UploadQueue.vue'
import type { UploadItem } from '../types/upload'
import type { Task, TaskImage } from '../types/task'
import type { LogEntry } from '../services/api'
import {
  uploadTask,
  uploadFolderTask,
  getModels,
  getTasks,
  triggerDedup,
  triggerCrop,
  triggerCaption,
  triggerRunAll,
  getProcessingSettings,
  getTaskImages,
  updateImageSelection,
  getLogs
} from '../services/api'

defineOptions({ name: 'UploadView' })

const router = useRouter()
const route = useRoute()

const fileUploadRef = ref()
const folderInputRef = ref<HTMLInputElement | null>(null)

const formData = reactive({
  focus_model: '',
  tag_model: ''
})

const uploadingFiles = ref<UploadItem[]>([])
const pendingFiles = ref<UploadItem[]>([])
const concurrentLimit = 2
const keepPerCluster = ref(2)
const logs = ref<LogEntry[]>([])
const logsLoading = ref(false)
const logsTimer = ref<number | null>(null)

const focusModels = ref<string[]>([])
const tagModels = ref<string[]>([])
const loadingModels = ref(false)

const tasksBoard = ref<Task[]>([])
const loadingTasks = ref(false)
const boardTimer = ref<number | null>(null)

const reviewDialog = reactive({
  visible: false,
  type: 'dedup' as 'dedup' | 'crop',
  taskId: null as number | null,
  images: [] as TaskImage[],
  loading: false,
  saving: false,
  originalSelections: new Map<number, boolean>()
})

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    uploading: '上传中',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    error: '错误'
  }
  return map[status] || status
}

const statusTag = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'error':
      return 'danger'
    case 'processing':
      return 'warning'
    case 'uploading':
      return 'info'
    default:
      return ''
  }
}

const getProgressStatus = (status: string) => {
  if (status === 'completed') return 'success'
  if (status === 'error') return 'exception'
  return undefined
}

const loadModels = async () => {
  loadingModels.value = true
  try {
    const models = await getModels()
    focusModels.value = models.focus_models
    tagModels.value = models.tag_models
    if (!formData.focus_model) {
      formData.focus_model = models.default_focus_model
    }
    if (!formData.tag_model) {
      formData.tag_model = models.default_tag_model
    }
  } catch (error) {
    console.error('Failed to load models:', error)
  } finally {
    loadingModels.value = false
  }
}

const loadProcessingSettings = async () => {
  try {
    const settings = await getProcessingSettings()
    if (settings?.dedup_params?.keep_per_cluster) {
      keepPerCluster.value = settings.dedup_params.keep_per_cluster
    }
  } catch (error) {
    console.error('Failed to load processing settings', error)
  }
}

const loadTaskBoard = async () => {
  loadingTasks.value = true
  try {
    const list = await getTasks()
    tasksBoard.value = list.sort((a, b) => b.id - a.id)
  } catch (error) {
    console.error('加载任务失败', error)
  } finally {
    loadingTasks.value = false
  }
}

const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const getRelativePath = (file: File) => {
  return (file as any).webkitRelativePath || file.name
}

const getGroupName = (relativePath: string) => {
  const cleaned = relativePath.replace(/\\/g, '/')
  const parts = cleaned.split('/').filter(Boolean)
  if (parts.length <= 1) return ''
  const dirs = parts.slice(0, -1)
  if (dirs.length >= 2) return dirs[1]
  return dirs[0] || ''
}

const isImageFile = (file: File) => {
  const name = file.name.toLowerCase()
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex === -1) return false
  return imageExts.has(name.slice(dotIndex))
}

const buildUploadItem = (kind: 'zip' | 'folder', files: File[], displayName: string): UploadItem => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const lastModified = files.reduce((latest, file) => Math.max(latest, file.lastModified || 0), 0)
  return {
    kind,
    files,
    displayName,
    totalSize,
    fileCount: files.length,
    lastModified,
    taskId: undefined,
    progress: 0,
    status: 'pending',
    message: ''
  }
}

const handleFileChange = (file: any) => {
  const newFile = file.raw as File
  if (newFile) {
    const item = buildUploadItem('zip', [newFile], newFile.name)
    addItemsToQueue([item])
  }
}

const selectFolder = () => {
  folderInputRef.value?.click()
}

const handleFolderChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  const groups = new Map<string, File[]>()

  files.forEach(file => {
    if (!isImageFile(file)) return
    const relativePath = getRelativePath(file)
    const folderName = getGroupName(relativePath) || 'folder'
    if (!groups.has(folderName)) {
      groups.set(folderName, [])
    }
    groups.get(folderName)?.push(file)
  })

  if (!groups.size) {
    ElMessage.warning('所选文件夹中未找到图片文件')
    input.value = ''
    return
  }

  const items: UploadItem[] = []
  groups.forEach((groupFiles, folderName) => {
    if (groupFiles.length) {
      items.push(buildUploadItem('folder', groupFiles, folderName))
    }
  })

  addItemsToQueue(items)
  input.value = ''
}

const addItemsToQueue = (items: UploadItem[]) => {
  pendingFiles.value.push(...items)
  uploadingFiles.value.push(...items)
  startUpload()
}

const loadLogs = async () => {
  logsLoading.value = true
  try {
    logs.value = await getLogs(200)
  } catch (error) {
    console.error('加载日志失败', error)
  } finally {
    logsLoading.value = false
  }
}

const startUpload = async () => {
  const uploadingCount = uploadingFiles.value.filter(f => f.status === 'uploading').length
  if (uploadingCount >= concurrentLimit) return

  const nextFileIndex = uploadingFiles.value.findIndex(f => f.status === 'pending')
  if (nextFileIndex === -1) return

  const item = uploadingFiles.value[nextFileIndex]
  item.status = 'uploading'

  const updateProgress = (progressEvent: any) => {
    const total = progressEvent.total || item.totalSize
    const percentCompleted = total ? Math.min(100, Math.round((progressEvent.loaded * 100) / total)) : 0
    item.progress = percentCompleted
  }

  try {
    let task: Task
    if (item.kind === 'folder') {
      if (!item.files.length) {
        throw new Error('没有可上传的文件')
      }
      task = await uploadFolderTask(
        item.displayName,
        item.files,
        formData.focus_model || '',
        formData.tag_model || '',
        updateProgress
      )
    } else {
      const file = item.files[0]
      if (!file) {
        throw new Error('缺少上传文件')
      }
      task = await uploadTask(
        file,
        formData.focus_model || '',
        formData.tag_model || '',
        updateProgress
      )
    }

    item.status = 'success'
    item.progress = 100
    item.taskId = task.id
    await loadTaskBoard()
    startUpload()
  } catch (error: any) {
    item.status = 'error'
    item.message = error.response?.data?.detail || error.message || '上传失败，请重试'
    startUpload()
  }
}

const handleRetryUpload = (fileToRetry: UploadItem) => {
  const fileIndex = uploadingFiles.value.findIndex(f => f === fileToRetry)
  if (fileIndex !== -1) {
    const file = uploadingFiles.value[fileIndex]
    file.status = 'pending'
    file.progress = 0
    file.message = ''
    file.taskId = undefined
    startUpload()
  }
}

const handleClearQueue = () => {
  uploadingFiles.value = []
  pendingFiles.value = []
}

const formatItemLabel = (item: UploadItem) => {
  if (item.kind === 'folder') {
    return `${item.displayName} (${item.fileCount})`
  }
  return item.displayName
}

const formatTime = (timeStr: string) => {
  const d = new Date(timeStr)
  return d.toLocaleString()
}

const startDedup = async (task: Task) => {
  if (task.status === 'processing') return
  try {
    const settings = await getProcessingSettings()
    const dedupParams = settings?.dedup_params || {}
    await triggerDedup(task.id, dedupParams)
    ElMessage.success('已启动去重流程')
    loadTaskBoard()
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const startCrop = async (task: Task) => {
  if (task.status === 'processing') return
  try {
    await triggerCrop(task.id)
    ElMessage.success('已启动裁切流程')
    loadTaskBoard()
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const startCaption = async (task: Task) => {
  if (task.status === 'processing') return
  try {
    await triggerCaption(task.id)
    ElMessage.success('已启动提示词生成')
    loadTaskBoard()
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const startRunAll = async (task: Task) => {
  if (task.status === 'processing') return
  try {
    await triggerRunAll(task.id)
    ElMessage.success('一键流程已启动')
    loadTaskBoard()
  } catch (error) {
    ElMessage.error('启动失败')
  }
}

const openReview = async (taskId: number, type: 'dedup' | 'crop') => {
  reviewDialog.visible = true
  reviewDialog.type = type
  reviewDialog.taskId = taskId
  reviewDialog.loading = true
  reviewDialog.originalSelections = new Map<number, boolean>()
  try {
    const imgs = await getTaskImages(taskId)
    reviewDialog.images = imgs
    imgs.forEach(img => reviewDialog.originalSelections.set(img.id, img.selected))
  } catch (error) {
    ElMessage.error('加载图片失败')
  } finally {
    reviewDialog.loading = false
  }
}

const toggleReviewSelection = (image: TaskImage) => {
  image.selected = !image.selected
}

const saveReviewChanges = async () => {
  if (!reviewDialog.taskId) return
  const toSelect: number[] = []
  const toUnselect: number[] = []
  reviewDialog.images.forEach(img => {
    const original = reviewDialog.originalSelections.get(img.id)
    if (img.selected && original === false) {
      toSelect.push(img.id)
    } else if (!img.selected && original === true) {
      toUnselect.push(img.id)
    }
  })

  if (!toSelect.length && !toUnselect.length) {
    reviewDialog.visible = false
    return
  }

  reviewDialog.saving = true
  try {
    if (toSelect.length) {
      await updateImageSelection(reviewDialog.taskId, toSelect, true)
    }
    if (toUnselect.length) {
      await updateImageSelection(reviewDialog.taskId, toUnselect, false)
    }
    ElMessage.success('宸蹭繚瀛橀€夋嫨')
    reviewDialog.visible = false
    loadTaskBoard()
  } catch (error) {
    ElMessage.error('淇濆瓨澶辫触')
  } finally {
    reviewDialog.saving = false
  }
}

const goTaskDetail = (id: number) => {
  router.push({ path: '/tasks', query: { taskId: id } })
}

onMounted(() => {
  loadModels()
  loadProcessingSettings()
  loadTaskBoard()
  loadLogs()
  // Only set up refresh timer if no taskId is in URL initially
  if (!route.query.taskId) {
    boardTimer.value = window.setInterval(loadTaskBoard, 6000)
  }
  logsTimer.value = window.setInterval(loadLogs, 5000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// Watch for route changes to pause/resume board timer
watch(() => route.query.taskId, (newTaskId, oldTaskId) => {
  if (newTaskId && !oldTaskId && boardTimer.value) {
    // Pause refresh timer when taskId is added to URL
    clearInterval(boardTimer.value)
    boardTimer.value = null
  } else if (!newTaskId && oldTaskId && !boardTimer.value) {
    // Resume refresh timer when taskId is removed from URL
    boardTimer.value = window.setInterval(loadTaskBoard, 6000)
  }
})

onBeforeUnmount(() => {
  if (boardTimer.value) {
    clearInterval(boardTimer.value)
  }
  if (logsTimer.value) {
    clearInterval(logsTimer.value)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

const handleVisibilityChange = () => {
  if (!document.hidden) {
    startUpload()
    loadTaskBoard()
    loadLogs()
  }
}

onActivated(() => {
  startUpload()
  loadTaskBoard()
  loadLogs()
})
</script>

<style scoped>
.upload-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-content {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  align-items: flex-start;
}

.upload-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.model-config-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px 16px;
  padding: 12px;
  border: 1px solid var(--border, #ebeef5);
  border-radius: 12px;
  background: var(--panel, #f5f7fa);
}

.model-config-form .el-form-item {
  margin-bottom: 0;
}

.upload-methods {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 12px 0;
  flex-wrap: wrap;
}

.method-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.method-divider {
  font-size: 16px;
  color: #909399;
}

.method-hint {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.selected-hint {
  background: var(--panel, #f5f7fa);
  border: 1px solid var(--border, #ebeef5);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--muted, #606266);
}

.selected-title {
  font-weight: 600;
}

.selected-hint ul {
  margin: 8px 0 0;
  padding-left: 18px;
  max-height: 140px;
  overflow: auto;
}

.folder-input {
  display: none;
}

.upload-tips {
  margin-top: 10px;
}

.upload-queue-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-board {
  grid-column: 1 / -1;
  margin-top: 10px;
  padding-top: 6px;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.board-title {
  font-weight: 600;
}

.board-sub {
  font-size: 12px;
  color: var(--muted, #606266);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.task-card {
  background: var(--panel, #f5f7fa);
  border: 1px solid var(--border, #ebeef5);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.08));
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-card-title {
  font-weight: 600;
}

.task-meta-row {
  display: flex;
  justify-content: space-between;
  color: var(--muted, #606266);
  font-size: 12px;
}

.task-message {
  font-size: 12px;
  color: var(--muted, #606266);
  min-height: 18px;
}

.task-actions,
.task-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.log-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid var(--border, #ebeef5);
  border-radius: 10px;
  background: var(--panel, #f5f7fa);
}

.log-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.log-list {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.log-row {
  display: grid;
  grid-template-columns: 150px 70px 60px 1fr;
  gap: 8px;
  font-size: 12px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.7);
}

.log-time {
  color: var(--muted, #606266);
}

.log-level {
  text-transform: uppercase;
  font-weight: 600;
}

.log-level.lv-error,
.log-level.lv-critical {
  color: #f56c6c;
}

.log-level.lv-warning {
  color: #e6a23c;
}

.log-level.lv-info {
  color: #409eff;
}

.log-level.lv-debug {
  color: #909399;
}

.log-task {
  color: var(--text, #303133);
}

.log-msg {
  color: var(--text, #303133);
  word-break: break-all;
}

.log-empty {
  color: var(--muted, #606266);
  font-size: 12px;
  padding: 8px 0;
  text-align: center;
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.review-card {
  background: var(--panel, #f5f7fa);
  border: 1px solid var(--border, #ebeef5);
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-card.inactive {
  opacity: 0.6;
  border-color: #f56c6c;
}

.review-card .el-image {
  width: 100%;
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
}

.review-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text, #303133);
}

.review-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted, #606266);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .upload-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .model-config-form {
    grid-template-columns: 1fr;
  }
  
  .upload-methods {
    flex-direction: column;
    gap: 15px;
  }
  
  .method-divider {
    transform: rotate(90deg);
    margin: 10px 0;
  }

  .task-grid {
    grid-template-columns: 1fr;
  }
}
</style>
