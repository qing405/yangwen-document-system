// pages/template-center/template-center.js
Page({
  data: {
    loading: false,
    templates: [],
    categories: [
      { id: 'all', name: '全部', icon: 'all' },
      { id: 'survey', name: '问卷调查', icon: 'survey' },
      { id: 'registration', name: '报名登记', icon: 'registration' },
      { id: 'feedback', name: '意见反馈', icon: 'feedback' },
      { id: 'application', name: '申请表单', icon: 'application' },
      { id: 'order', name: '订单表单', icon: 'order' }
    ],
    selectedCategory: 'all',
    searchKeyword: '',
    viewMode: 'grid' // 'grid' 或 'list'
  },

  onLoad(options) {
    this.loadTemplates()
  },

  // 加载模板列表
  loadTemplates() {
    this.setData({ loading: true })
    
    // 模拟API调用
    setTimeout(() => {
      const mockTemplates = [
        {
          id: 'template_001',
          title: '员工满意度调查模板',
          category: 'survey',
          description: '标准化的员工满意度调查问卷，包含工作环境、薪资福利、职业发展等维度',
          tags: ['员工管理', '满意度', '标准化'],
          usageCount: 156,
          rating: 4.8,
          author: 'HR部门',
          createTime: '2024-01-10',
          preview: 'https://example.com/preview1.png'
        },
        {
          id: 'template_002',
          title: '客户反馈收集模板',
          category: 'feedback',
          description: '专业的客户反馈收集表单，支持多维度评价和意见收集',
          tags: ['客户服务', '反馈', '评价'],
          usageCount: 89,
          rating: 4.6,
          author: '客服部门',
          createTime: '2024-01-15',
          preview: 'https://example.com/preview2.png'
        },
        {
          id: 'template_003',
          title: '活动报名登记模板',
          category: 'registration',
          description: '适用于各类活动的报名登记，支持个人信息收集和活动选择',
          tags: ['活动管理', '报名', '登记'],
          usageCount: 234,
          rating: 4.9,
          author: '市场部门',
          createTime: '2024-01-08',
          preview: 'https://example.com/preview3.png'
        },
        {
          id: 'template_004',
          title: '产品试用申请模板',
          category: 'application',
          description: '产品试用申请表单，包含用户信息、试用需求、反馈计划等',
          tags: ['产品试用', '申请', '用户调研'],
          usageCount: 67,
          rating: 4.7,
          author: '产品部门',
          createTime: '2024-01-12',
          preview: 'https://example.com/preview4.png'
        }
      ]
      
      this.setData({
        templates: mockTemplates,
        loading: false
      })
    }, 1000)
  },

  // 分类筛选
  onCategoryFilter(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: category
    })
    this.filterTemplates()
  },

  // 搜索
  onSearch(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterTemplates()
  },

  // 筛选模板
  filterTemplates() {
    // 实际项目中根据筛选条件重新加载数据
    console.log('筛选分类:', this.data.selectedCategory)
    console.log('搜索关键词:', this.data.searchKeyword)
  },

  // 切换视图模式
  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({
      viewMode: mode
    })
  },

  // 预览模板
  previewTemplate(e) {
    const templateId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/template-preview/template-preview?id=${templateId}`
    })
  },

  // 使用模板
  useTemplate(e) {
    const templateId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认使用',
      content: '确定要使用这个模板创建新表单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/form-editor/form-editor?mode=create&template=${templateId}`
          })
        }
      }
    })
  },

  // 收藏模板
  toggleFavorite(e) {
    const templateId = e.currentTarget.dataset.id
    const templates = this.data.templates.map(t => {
      if (t.id === templateId) {
        return { ...t, isFavorite: !t.isFavorite }
      }
      return t
    })
    
    this.setData({ templates })
    
    wx.showToast({
      title: templates.find(t => t.id === templateId).isFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    })
  },

  // 分享模板
  shareTemplate(e) {
    const templateId = e.currentTarget.dataset.id
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 分享功能
  onShare() {
    return {
      title: '表单模板中心',
      path: '/pages/template-center/template-center'
    }
  }
})
