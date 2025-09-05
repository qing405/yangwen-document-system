// pages/task-query/task-query.js
const formDataManager = require('../../utils/formDataManager')

Page({
  data: {
    loading: false,
    tasks: [],
    filteredTasks: [],
    searchKeyword: '',
    selectedStatus: 'all',
    selectedPriority: 'all',
    selectedForm: 'all',
    statuses: [
      { value: 'all', label: '全部状态' },
      { value: 'pending', label: '待处理', color: '#F59E0B' },
      { value: 'in_progress', label: '进行中', color: '#007BFF' },
      { value: 'completed', label: '已完成', color: '#10B981' },
      { value: 'overdue', label: '已逾期', color: '#EF4444' }
    ],
    priorities: [
      { value: 'all', label: '全部优先级' },
      { value: 'high', label: '高', color: '#EF4444' },
      { value: 'medium', label: '中', color: '#F59E0B' },
      { value: 'low', label: '低', color: '#10B981' }
    ],
    forms: [],
    showFilterPanel: false,
    viewMode: 'list' // 'list' 或 'grid'
  },

  onLoad(options) {
    this.checkUserAuth()
    this.loadTasks()
    
    // 注册数据更新回调
    this.dataUpdateCallback = this.handleDataUpdate.bind(this);
    formDataManager.registerRefreshCallback(this.dataUpdateCallback);
  },

  onUnload() {
    // 移除数据更新回调
    if (this.dataUpdateCallback) {
      formDataManager.unregisterRefreshCallback(this.dataUpdateCallback);
    }
  },

  // 处理数据更新
  handleDataUpdate(dataType, data) {
    // 静默处理数据更新，不显示通知
    switch (dataType) {
      case 'distributions':
        this.setData({ 
          tasks: data,
          filteredTasks: data
        });
        break;
      case 'form_distributed':
        // 静默重新加载任务列表
        this.loadTasks(true);
        break;
    }
  },

  // 检查用户权限
  async checkUserAuth() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({ userInfo })
      } else {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }
    } catch (error) {
      console.error('检查用户权限失败:', error)
    }
  },

  // 加载任务列表
  async loadTasks(forceRefresh = false) {
    this.setData({ loading: true })
    
    try {
      // 获取用户的任务分配
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getFormDistributions',
          data: {
            userId: this.data.userInfo.workId
          }
        }
      })

      if (result.result && result.result.success) {
        const tasks = result.result.data.distributions.map(distribution => ({
          _id: distribution._id,
          id: distribution._id,
          title: distribution.formTitle || distribution.title,
          formTitle: distribution.formTitle || distribution.title,
          formId: distribution.formId,
          assigner: distribution.assignerName || distribution.assigner,
          assignee: distribution.assigneeName || distribution.userId,
          deadline: distribution.deadline,
          priority: distribution.priority,
          status: distribution.status,
          progress: distribution.submittedCount || 0,
          description: distribution.description,
          distributeTime: distribution.distributeTime
        }))

        this.setData({
          tasks: tasks,
          filteredTasks: tasks,
          loading: false
        })

        // 加载表单列表用于筛选
        this.loadForms()
      } else {
        throw new Error(result.result?.error || '获取任务列表失败')
      }
    } catch (error) {
      console.error('加载任务列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ 
        tasks: [],
        filteredTasks: [],
        loading: false 
      })
    }
  },

  // 加载表单列表
  async loadForms() {
    try {
      const formsData = await formDataManager.getCollaborativeForms({
        status: 'published'
      })
      
      const forms = [
        { value: 'all', label: '全部表单' },
        ...formsData.map(form => ({
          value: form._id,
          label: form.title
        }))
      ]
      this.setData({ forms })
    } catch (error) {
      console.error('加载表单列表失败:', error)
    }
  },

  // 获取任务状态
  getTaskStatus(distribution) {
    if (distribution.status === 'completed') return 'completed'
    if (distribution.status === 'in_progress') return 'in_progress'
    if (this.isOverdue(distribution.deadline)) return 'overdue'
    return 'pending'
  },

  // 获取任务优先级
  getTaskPriority(distribution) {
    // 根据截止时间和重要性判断优先级
    if (this.isOverdue(distribution.deadline)) return 'high'
    if (distribution.priority === 'urgent') return 'high'
    if (distribution.priority === 'normal') return 'medium'
    return 'low'
  },

  // 计算进度
  calculateProgress(distribution) {
    const total = distribution.targetCount || 0
    const submitted = distribution.submittedCount || 0
    return total > 0 ? Math.round((submitted / total) * 100) : 0
  },

  // 判断是否逾期
  isOverdue(deadline) {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  },

  // 填写表单
  fillForm(e) {
    const { taskId } = e.currentTarget.dataset
    const task = this.data.tasks.find(t => t.id === taskId)
    
    if (task) {
      // 传递分发记录的ID，而不是任务ID
      wx.navigateTo({
        url: `/pages/form-fill/form-fill?distributionId=${task._id || taskId}`
      })
    }
  },

  // 查看任务详情
  viewTaskDetail(e) {
    const { taskId } = e.currentTarget.dataset
    const task = this.data.tasks.find(t => t.id === taskId)
    
    if (task) {
      wx.showModal({
        title: task.title,
        content: `分派人：${task.assigner}\n截止时间：${task.deadline}\n进度：${task.progress}%`,
        showCancel: false,
        confirmText: '知道了'
      })
    }
  },

  // 搜索任务
  onSearch(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterTasks()
  },

  // 状态筛选
  onStatusFilter(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      selectedStatus: status
    })
    this.filterTasks()
  },

  // 优先级筛选
  onPriorityFilter(e) {
    const priority = e.currentTarget.dataset.priority
    this.setData({
      selectedPriority: priority
    })
    this.filterTasks()
  },

  // 表单筛选
  onFormFilter(e) {
    const form = e.currentTarget.dataset.form
    this.setData({
      selectedForm: form
    })
    this.filterTasks()
  },

  // 筛选任务
  filterTasks() {
    let filtered = this.data.tasks
    
    // 按状态筛选
    if (this.data.selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === this.data.selectedStatus)
    }
    
    // 按优先级筛选
    if (this.data.selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === this.data.selectedPriority)
    }
    
    // 按表单筛选
    if (this.data.selectedForm !== 'all') {
      filtered = filtered.filter(task => task.formId === this.data.selectedForm)
    }
    
    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(keyword) ||
        task.formTitle.toLowerCase().includes(keyword) ||
        task.assignee.toLowerCase().includes(keyword) ||
        task.assigner.toLowerCase().includes(keyword)
      )
    }
    
    this.setData({
      filteredTasks: filtered
    })
  },

  // 切换筛选面板
  toggleFilterPanel() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    })
  },

  // 切换视图模式
  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      viewMode: mode
    })
  },

  // 重置筛选
  resetFilters() {
    this.setData({
      searchKeyword: '',
      selectedStatus: 'all',
      selectedPriority: 'all',
      selectedForm: 'all'
    })
    this.filterTasks()
  },

  // 查看任务详情
  viewTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    })
  },

  // 编辑任务
  editTask(e) {
    const taskId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/task-editor/task-editor?id=${taskId}`
    })
  },

  // 完成任务
  completeTask(e) {
    const taskId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认完成',
      content: '确定要将此任务标记为已完成吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateTaskStatus(taskId, 'completed')
        }
      }
    })
  },

  // 更新任务状态
  updateTaskStatus(taskId, status) {
    const tasks = this.data.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status }
      }
      return task
    })
    
    const filteredTasks = this.data.filteredTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status }
      }
      return task
    })
    
    this.setData({
      tasks,
      filteredTasks
    })
    
    wx.showToast({
      title: '任务状态已更新',
      icon: 'success'
    })
  },

  // 刷新数据
  refreshData() {
    this.loadTasks(true) // 强制刷新
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
