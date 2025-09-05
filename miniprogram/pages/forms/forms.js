// pages/forms/forms.js
const formDataManager = require('../../utils/formDataManager')

Page({
  data: {
    userInfo: null,
    
    // 统计信息
    statistics: {
      completionRate: 0,
      overdueTasks: 0,
      activeTasks: 0,
      totalForms: 0,
      publishedForms: 0
    },
    
    // 表单列表
    forms: [],
    
    // 待办任务列表
    todoTasks: [],
    
    // 筛选状态
    showFilterPanel: false,
    selectedStatus: 'all',
    selectedPriority: 'all',
    selectedFormType: 'all',
    
    // 视图模式
    viewMode: 'list', // 'list' 或 'grid'
    
    // 加载状态
    loading: false,
    
    // 表单类型
    formTypes: [
      { id: 'survey', name: '问卷调查', icon: 'form-fill', color: '#007BFF' },
      { id: 'registration', name: '报名登记', icon: 'user-management', color: '#10B981' },
      { id: 'feedback', name: '意见反馈', icon: 'chat', color: '#F59E0B' },
      { id: 'application', name: '申请表单', icon: 'document-center', color: '#8B5CF6' },
      { id: 'order', name: '订单表单', icon: 'shopping-cart', color: '#EF4444' }
    ],
    
    // 表单状态
    formStatuses: [
      { id: 'draft', name: '草稿', color: '#6B7280' },
      { id: 'published', name: '已发布', color: '#10B981' },
      { id: 'closed', name: '已关闭', color: '#EF4444' },
      { id: 'archived', name: '已归档', color: '#8B5CF6' }
    ]
  },

  onLoad() {
    this.checkLogin()
    this.loadUserInfo()
    this.loadStatistics()
    this.loadForms()
    this.loadTodoTasks()
    
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

  onShow() {
    this.refreshData()
  },

  // 处理数据更新
  handleDataUpdate(dataType, data) {
    // 静默处理数据更新，不显示通知
    switch (dataType) {
      case 'forms':
        this.loadForms();
        break;
      case 'form_created':
      case 'form_updated':
      case 'form_deleted':
      case 'form_distributed':
        // 静默重新加载统计数据和任务
        this.loadStatistics();
        this.loadTodoTasks();
        break;
    }
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    } else {
      // 如果没有登录信息，使用默认值
      this.setData({
        userInfo: {
          name: '管理员',
          role: '系统管理员',
          lastLogin: '今天'
        }
      })
    }
  },

  // 加载用户信息
  loadUserInfo() {
    // 这里可以调用API获取用户详细信息
    // 暂时使用默认值
  },

  // 加载统计数据
  async loadStatistics() {
    this.setData({
      loading: true
    })
    
    try {
      // 获取真实的统计数据
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        throw new Error('用户信息不存在')
      }

      // 并行获取各种统计数据
      const [formsData, distributionsData, submissionsData] = await Promise.all([
        // 获取协作表单数据
        formDataManager.getCollaborativeForms({}, true),
        // 获取表单分发数据
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'getFormDistributions',
            data: {
              userId: userInfo.workId
            }
          }
        }),
        // 获取表单提交数据
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'getFormSubmissions',
            data: {
              userId: userInfo.workId
            }
          }
        })
      ])

      // 处理表单数据
      const totalForms = formsData.length
      const publishedForms = formsData.filter(form => form.status === 'published').length

      // 处理分发数据
      const distributions = distributionsData.result?.success ? distributionsData.result.data.distributions : []
      const activeTasks = distributions.filter(d => d.status === 'pending' || d.status === 'in_progress').length
      
      // 计算逾期任务
      const now = new Date()
      const overdueTasks = distributions.filter(d => {
        if (!d.deadline) return false
        return new Date(d.deadline) < now && d.status !== 'completed'
      }).length

      // 计算完成率
      const completedTasks = distributions.filter(d => d.status === 'completed').length
      const totalTasks = distributions.length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      this.setData({
        loading: false,
        statistics: {
          completionRate,
          overdueTasks,
          activeTasks,
          totalForms,
          publishedForms
        }
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
      // 如果加载失败，使用默认值
      this.setData({
        loading: false,
        statistics: {
          completionRate: 0,
          overdueTasks: 0,
          activeTasks: 0,
          totalForms: 0,
          publishedForms: 0
        }
      })
    }
  },

  // 加载表单列表
  async loadForms() {
    try {
      // 获取真实的协作表单数据
      const formsData = await formDataManager.getCollaborativeForms({}, true)
      
      // 为每个表单添加预处理的类型和状态信息
      const processedForms = formsData.map(form => {
        // 根据文档类型确定表单类型
        let formType
        switch (form.documentType) {
          case 'excel':
            formType = { name: 'Excel表格', icon: 'document-center', color: '#10B981' }
            break
          case 'word':
            formType = { name: 'Word文档', icon: 'form-fill', color: '#007BFF' }
            break
          case 'pdf':
            formType = { name: 'PDF文档', icon: 'document-center', color: '#EF4444' }
            break
          default:
            formType = { name: '未知类型', icon: 'form-fill', color: '#64748B' }
        }
        
        const formStatus = this.data.formStatuses.find(s => s.id === form.status)
        
        return {
          id: form._id,
          title: form.title,
          type: form.documentType,
          status: form.status,
          createTime: form.createTime,
          updateTime: form.updateTime,
          responses: form.submittedCount || 0,
          targetResponses: form.totalDistributions || 0,
          deadline: form.deadline,
          creator: form.creatorName,
          description: form.description,
          fields: 0, // 协作表单没有字段概念
          isTemplate: false,
          documentName: form.documentName,
          documentUrl: form.documentUrl,
          typeInfo: formType,
          statusInfo: formStatus || { name: '未知状态', color: '#64748B' }
        }
      })
      
      this.setData({
        forms: processedForms
      })
    } catch (error) {
      console.error('加载表单列表失败:', error)
      this.setData({
        forms: []
      })
    }
  },

  // 刷新数据
  refreshData() {
    this.loadStatistics()
    this.loadForms()
    this.loadTodoTasks()
  },

  // 加载待办任务
  async loadTodoTasks() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        this.setData({ todoTasks: [] })
        return
      }

      // 获取用户的任务分配数据
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getFormDistributions',
          data: {
            userId: userInfo.workId
          }
        }
      })

      if (result.result && result.result.success) {
        const distributions = result.result.data.distributions
        
        // 为每个任务添加预处理的优先级信息
        const processedTasks = distributions.map(distribution => {
          const now = new Date()
          const deadline = distribution.deadline ? new Date(distribution.deadline) : null
          const isOverdue = deadline && deadline < now && distribution.status !== 'completed'
          
          let statusType = 'info'
          if (distribution.status === 'completed') {
            statusType = 'success'
          } else if (isOverdue) {
            statusType = 'error'
          } else if (distribution.status === 'in_progress') {
            statusType = 'warning'
          }

          return {
            id: distribution._id,
            title: distribution.formTitle || distribution.title,
            status: distribution.status,
            statusType: statusType,
            priority: distribution.priority || 'medium',
            deadline: distribution.deadline,
            isOverdue: isOverdue,
            assigner: distribution.assignerName || distribution.assigner,
            submitted: distribution.submittedCount || 0,
            total: distribution.targetCount || 1,
            progress: distribution.submittedCount || 0,
            description: distribution.description || '请按时完成表单填写',
            priorityText: distribution.priority === 'high' ? '高' : distribution.priority === 'medium' ? '中' : '低',
            formId: distribution.formId,
            distributeTime: distribution.distributeTime
          }
        })
        
        this.setData({
          todoTasks: processedTasks
        })
      } else {
        this.setData({ todoTasks: [] })
      }
    } catch (error) {
      console.error('加载待办任务失败:', error)
      this.setData({ todoTasks: [] })
    }
  },

  // 功能按钮点击事件
  onActionButtonTap(e) {
    const actionId = e.currentTarget.dataset.id
    
    switch (actionId) {
      case 'collaborative':
        this.openCollaborativeForms()
        break
      case 'assign':
        this.assignFormTask()
        break
      case 'query':
        this.queryTaskProgress()
        break
      default:
        console.log('未知操作:', actionId)
    }
  },

  // 分派表单任务
  assignFormTask() {
    wx.navigateTo({
      url: '/pages/task-assignment/task-assignment'
    })
  },

  // 查询任务进度
  queryTaskProgress() {
    wx.navigateTo({
      url: '/pages/task-query/task-query'
    })
  },

  // 打开协作表单系统
  openCollaborativeForms() {
    wx.navigateTo({
      url: '/pages/collaborative-forms/collaborative-forms'
    })
  },

  // 表单操作
  onFormAction(e) {
    const action = e.currentTarget.dataset.action
    const formId = e.currentTarget.dataset.id
    
    switch (action) {
      case 'edit':
        this.editForm(formId)
        break
      case 'preview':
        this.previewForm(formId)
        break
      case 'publish':
        this.publishForm(formId)
        break
      case 'close':
        this.closeForm(formId)
        break
      case 'duplicate':
        this.duplicateForm(formId)
        break
      case 'delete':
        this.deleteForm(formId)
        break
      case 'responses':
        this.viewFormResponses(formId)
        break
      default:
        console.log('未知操作:', action)
    }
  },

  // 编辑表单
  editForm(formId) {
    wx.navigateTo({
      url: `/pages/form-editor/form-editor?mode=edit&id=${formId}`
    })
  },

  // 预览表单
  previewForm(formId) {
    wx.navigateTo({
      url: `/pages/form-preview/form-preview?id=${formId}`
    })
  },

  // 发布表单
  publishForm(formId) {
    wx.showModal({
      title: '确认发布',
      content: '确定要发布这个表单吗？发布后将无法修改表单结构。',
      success: (res) => {
        if (res.confirm) {
          // 实际项目中调用API发布表单
          wx.showToast({
            title: '表单已发布',
            icon: 'success'
          })
          this.refreshData()
        }
      }
    })
  },

  // 关闭表单
  closeForm(formId) {
    wx.showModal({
      title: '确认关闭',
      content: '确定要关闭这个表单吗？关闭后将无法收集新的回复。',
      success: (res) => {
        if (res.confirm) {
          // 实际项目中调用API关闭表单
          wx.showToast({
            title: '表单已关闭',
            icon: 'success'
          })
          this.refreshData()
        }
      }
    })
  },

  // 复制表单
  duplicateForm(formId) {
    wx.showModal({
      title: '确认复制',
      content: '确定要复制这个表单吗？',
      success: (res) => {
        if (res.confirm) {
          // 实际项目中调用API复制表单
          wx.showToast({
            title: '表单已复制',
            icon: 'success'
          })
          this.refreshData()
        }
      }
    })
  },

  // 删除表单
  deleteForm(formId) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个表单吗？删除后将无法恢复。',
      success: (res) => {
        if (res.confirm) {
          // 实际项目中调用API删除表单
          wx.showToast({
            title: '表单已删除',
            icon: 'success'
          })
          this.refreshData()
        }
      }
    })
  },

  // 查看表单回复
  viewFormResponses(formId) {
    wx.navigateTo({
      url: `/pages/form-responses/form-responses?id=${formId}`
    })
  },

  // 切换筛选面板
  toggleFilterPanel() {
    this.setData({
      showFilterPanel: !this.data.showFilterPanel
    })
  },

  // 状态筛选
  onStatusFilter(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      selectedStatus: status
    })
    this.filterForms()
  },

  // 优先级筛选
  onPriorityFilter(e) {
    const priority = e.currentTarget.dataset.priority
    this.setData({
      selectedPriority: priority
    })
    this.filterTasks()
  },

  // 表单类型筛选
  onFormTypeFilter(e) {
    const formType = e.currentTarget.dataset.type
    this.setData({
      selectedFormType: formType
    })
    this.filterForms()
  },

  // 筛选表单
  filterForms() {
    // 这里实现表单筛选逻辑
    console.log('筛选状态:', this.data.selectedStatus)
    console.log('筛选类型:', this.data.selectedFormType)
    // 实际项目中根据筛选条件重新加载表单列表
  },

  // 筛选任务
  filterTasks() {
    // 这里实现任务筛选逻辑
    console.log('筛选状态:', this.data.selectedStatus)
    console.log('筛选优先级:', this.data.selectedPriority)
    // 实际项目中根据筛选条件重新加载任务列表
  },

  // 切换视图模式
  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      viewMode: mode
    })
  },

  // 任务卡片点击
  onTaskCardTap(e) {
    const taskId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    })
  },

  // 任务操作
  onTaskAction(e) {
    const action = e.currentTarget.dataset.action
    const taskId = e.currentTarget.dataset.id
    
    switch (action) {
      case 'view':
        this.viewTask(taskId)
        break
      case 'edit':
        this.editTask(taskId)
        break
      default:
        console.log('未知操作:', action)
    }
  },

  // 查看任务
  viewTask(taskId) {
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${taskId}`
    })
  },

  // 编辑任务
  editTask(taskId) {
    wx.navigateTo({
      url: `/pages/task-editor/task-editor?id=${taskId}`
    })
  },

  // 分享功能
  onShare() {
    return {
      title: '表单中心',
      path: '/pages/forms/forms'
    }
  }
})
