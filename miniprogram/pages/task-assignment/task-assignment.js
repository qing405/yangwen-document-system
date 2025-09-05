// pages/task-assignment/task-assignment.js
const formDataManager = require('../../utils/formDataManager')

Page({
  data: {
    loading: false,
    forms: [],
    users: [],
    selectedForm: null,
    selectedUsers: [],
    assignmentData: {
      deadline: '',
      priority: 'medium',
      description: '',
      notifyUsers: true
    },
    priorities: [
      { value: 'high', label: '高', color: '#EF4444' },
      { value: 'medium', label: '中', color: '#F59E0B' },
      { value: 'low', label: '低', color: '#10B981' }
    ],
    showFormSelector: false,
    showUserSelector: false,
    searchKeyword: '',
    priorityIndex: 0, // 新增：用于存储优先级索引
    priorityInfo: {}, // 新增：用于存储优先级信息
    filteredUsers: [] // 新增：用于存储筛选后的用户列表
  },

  onLoad(options) {
    this.loadForms()
    this.loadUsers()
    
    // 预处理优先级信息
    this.updatePriorityInfo()
    
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
      case 'forms':
        this.setData({ forms: data });
        break;
      case 'users':
        this.setData({ users: data });
        this.updateFilteredUsers();
        break;
      case 'form_distributed':
        // 静默处理任务分派成功
        break;
    }
  },

  // 更新优先级信息
  updatePriorityInfo() {
    const { priorities, assignmentData } = this.data
    const priorityIndex = priorities.findIndex(p => p.value === assignmentData.priority)
    const priorityInfo = priorities.find(p => p.value === assignmentData.priority)
    
    this.setData({
      'priorityIndex': priorityIndex,
      'priorityInfo': priorityInfo
    })
  },

  // 检查用户是否被选中
  isUserSelected(userId) {
    return this.data.selectedUsers.some(user => user.id === userId)
  },

  // 更新筛选后的用户列表
  updateFilteredUsers() {
    const filteredUsers = this.getFilteredUsers()
    this.setData({ filteredUsers })
  },

  // 加载表单列表 - 从协作表单获取真实数据
  async loadForms(forceRefresh = false) {
    this.setData({ loading: true })
    
    try {
      const formsData = await formDataManager.getCollaborativeForms({
        status: 'published' // 只获取已发布的表单
      }, forceRefresh)
      
      const forms = formsData.map(form => ({
        id: form._id,
        title: form.title,
        description: form.description || '无描述',
        type: form.documentType === 'excel' ? 'Excel表格' : form.documentType === 'word' ? 'Word文档' : 'PDF文档',
        status: form.status,
        documentName: form.documentName,
        documentUrl: form.documentUrl
      }))
      
      this.setData({
        forms: forms,
        loading: false
      })
    } catch (error) {
      console.error('加载表单列表失败:', error)
      wx.showToast({
        title: '加载表单失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 加载用户列表 - 从真实用户数据获取
  async loadUsers(forceRefresh = false) {
    try {
      const users = await formDataManager.getUsers(forceRefresh)
      
      this.setData({ users: users })
      
      // 更新筛选后的用户列表
      this.updateFilteredUsers()
    } catch (error) {
      console.error('加载用户列表失败:', error)
      wx.showToast({
        title: '加载用户失败',
        icon: 'none'
      })
    }
  },

  // 选择表单
  selectForm(e) {
    const formId = e.currentTarget.dataset.id
    const form = this.data.forms.find(f => f.id === formId)
    
    this.setData({
      selectedForm: form,
      showFormSelector: false
    })
  },

  // 选择用户
  selectUser(e) {
    const userId = e.currentTarget.dataset.id
    const selectedUsers = [...this.data.selectedUsers]
    const userIndex = selectedUsers.findIndex(u => u.id === userId)
    
    if (userIndex > -1) {
      selectedUsers.splice(userIndex, 1)
    } else {
      const user = this.data.users.find(u => u.id === userId)
      selectedUsers.push(user)
    }
    
    this.setData({ selectedUsers })
    
    // 更新预处理信息
    this.updatePriorityInfo()
  },

  // 移除已选用户
  removeUser(e) {
    const userId = e.currentTarget.dataset.id
    const selectedUsers = this.data.selectedUsers.filter(u => u.id !== userId)
    this.setData({ selectedUsers })
    
    // 更新预处理信息
    this.updatePriorityInfo()
  },

  // 设置截止日期
  onDateChange(e) {
    this.setData({
      'assignmentData.deadline': e.detail.value
    })
  },

  // 设置优先级
  onPriorityChange(e) {
    const index = e.detail.value
    const selectedPriority = this.data.priorities[index]
    this.setData({
      'assignmentData.priority': selectedPriority.value
    })
    
    // 更新预处理信息
    this.updatePriorityInfo()
  },

  // 设置描述
  onDescriptionInput(e) {
    this.setData({
      'assignmentData.description': e.detail.value
    })
  },

  // 切换通知设置
  toggleNotification() {
    this.setData({
      'assignmentData.notifyUsers': !this.data.assignmentData.notifyUsers
    })
  },

  // 显示表单选择器
  showFormSelector() {
    this.setData({ showFormSelector: true })
  },

  // 隐藏表单选择器
  hideFormSelector() {
    this.setData({ showFormSelector: false })
  },

  // 显示用户选择器
  showUserSelector() {
    this.setData({ showUserSelector: true })
  },

  // 隐藏用户选择器
  hideUserSelector() {
    this.setData({ showUserSelector: false })
  },

  // 搜索用户
  onUserSearch(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 获取筛选后的用户
  getFilteredUsers() {
    if (!this.data.searchKeyword) {
      return this.data.users
    }
    
    const keyword = this.data.searchKeyword.toLowerCase()
    return this.data.users.filter(user => 
      user.name.toLowerCase().includes(keyword) ||
      user.department.toLowerCase().includes(keyword) ||
      user.role.toLowerCase().includes(keyword)
    )
  },

  // 提交任务分派
  async submitAssignment() {
    if (!this.data.selectedForm) {
      wx.showToast({
        title: '请选择要分派的表单',
        icon: 'none'
      })
      return
    }
    
    if (this.data.selectedUsers.length === 0) {
      wx.showToast({
        title: '请选择分派给的用户',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.assignmentData.deadline) {
      wx.showToast({
        title: '请设置截止日期',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({ title: '分派中...' })
      
      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo')
      
      await formDataManager.distributeCollaborativeForm({
        formId: this.data.selectedForm.id,
        userIds: this.data.selectedUsers.map(user => user.id),
        assignerId: userInfo.workId,
        assignerName: userInfo.name,
        deadline: this.data.assignmentData.deadline,
        priority: this.data.assignmentData.priority,
        description: this.data.assignmentData.description,
        notifyUsers: this.data.assignmentData.notifyUsers
      })

      wx.hideLoading()
      wx.showToast({
        title: '任务分派成功',
        icon: 'success'
      })
      
      // 如果启用了通知，显示通知信息
      if (this.data.assignmentData.notifyUsers) {
        setTimeout(() => {
          wx.showModal({
            title: '分派完成',
            content: `已成功分派给 ${this.data.selectedUsers.length} 个用户，他们将在任务查询页面看到新任务。`,
            showCancel: false,
            confirmText: '知道了'
          })
        }, 1500)
      }
      
      // 重置表单
      this.resetForm()
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    } catch (error) {
      console.error('分派任务失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '分派失败',
        icon: 'error'
      })
    }
  },

  // 重置表单
  resetForm() {
    this.setData({
      selectedForm: null,
      selectedUsers: [],
      assignmentData: {
        deadline: '',
        priority: 'medium',
        description: '',
        notifyUsers: true
      }
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
