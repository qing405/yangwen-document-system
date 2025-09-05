// pages/records/records.js
Page({
  data: {
    userInfo: null,
    records: [],
    workshops: [],
    loading: true,
    page: 1,
    hasMore: true,
    selectedType: '',
    selectedWorkshop: '',
    selectedStatus: '',
    recordTypes: [
      { value: '', label: '全部类型' },
      { value: 'daily_check', label: '日常检查' },
      { value: 'equipment_maintenance', label: '设备维护' },
      { value: 'safety_check', label: '安全检查' },
      { value: 'quality_check', label: '质量检查' },
      { value: 'production_record', label: '生产记录' }
    ],
    recordStatus: [
      { value: '', label: '全部状态' },
      { value: 'pending', label: '待审批' },
      { value: 'approved', label: '已通过' },
      { value: 'rejected', label: '已拒绝' }
    ],
    userRole: '',
    canCreate: false,
    canDelete: false,
    canApprove: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (this.data.userInfo) {
      this.loadRecords(true)
    }
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    
    this.setData({ userInfo })
    this.loadUserPermissions()
    this.loadWorkshops()
    this.loadRecords(true)
  },

  // 加载用户权限
  async loadUserPermissions() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getUserWorkshopData',
          data: {
            userId: this.data.userInfo.userId
          }
        }
      })

      if (result.result.success) {
        const { userRole, permissions } = result.result.data
        this.setData({
          userRole,
          canCreate: permissions.includes('create_records'),
          canDelete: permissions.includes('delete_own_records') || permissions.includes('delete_all_records'),
          canApprove: permissions.includes('approve_records')
        })
      }
    } catch (error) {
      console.error('加载用户权限失败:', error)
    }
  },

  // 加载车间列表
  async loadWorkshops() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getWorkshops',
          data: {
            userId: this.data.userInfo.userId
          }
        }
      })

      if (result.result.success) {
        this.setData({
          workshops: result.result.data
        })
      }
    } catch (error) {
      console.error('加载车间列表失败:', error)
    }
  },

  // 加载台账列表
  async loadRecords(refresh = false) {
    if (refresh) {
      this.setData({ 
        page: 1, 
        hasMore: true,
        records: []
      })
    }

    if (!this.data.hasMore || this.data.loading) return

    this.setData({ loading: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getRecords',
          data: {
            userId: this.data.userInfo.userId,
            type: this.data.selectedType,
            workshop: this.data.selectedWorkshop,
            status: this.data.selectedStatus,
            page: this.data.page,
            pageSize: 20
          }
        }
      })

      if (result.result.success) {
        const newRecords = result.result.data
        const records = refresh ? newRecords : [...this.data.records, ...newRecords]
        
        this.setData({
          records,
          page: this.data.page + 1,
          hasMore: newRecords.length === 20
        })
      } else {
        wx.showToast({
          title: result.result.error || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载台账失败:', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 选择台账类型
  onTypeChange(e) {
    this.setData({
      selectedType: e.detail.value
    })
    this.loadRecords(true)
  },

  // 选择车间
  onWorkshopChange(e) {
    this.setData({
      selectedWorkshop: e.detail.value
    })
    this.loadRecords(true)
  },

  // 选择状态
  onStatusChange(e) {
    this.setData({
      selectedStatus: e.detail.value
    })
    this.loadRecords(true)
  },

  // 点击台账
  onRecordTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?id=${id}`
    })
  },

  // 创建台账
  onCreateRecord() {
    if (!this.data.canCreate) {
      wx.showToast({
        title: '无权限创建台账',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/record-create/record-create'
    })
  },

  // 删除台账
  async onDeleteRecord(e) {
    const { id } = e.currentTarget.dataset
    e.stopPropagation()

    if (!this.data.canDelete) {
      wx.showToast({
        title: '无权限删除台账',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个台账吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'quickstartFunctions',
              data: {
                type: 'deleteRecord',
                data: {
                  recordId: id,
                  userId: this.data.userInfo.userId
                }
              }
            })

            if (result.result.success) {
              wx.hideLoading()
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.loadRecords(true)
            } else {
              wx.hideLoading()
              wx.showToast({
                title: result.result.error || '删除失败',
                icon: 'none'
              })
            }
          } catch (error) {
            wx.hideLoading()
            console.error('删除台账失败:', error)
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 审批台账
  async onApproveRecord(e) {
    const { id, status } = e.currentTarget.dataset
    e.stopPropagation()

    if (!this.data.canApprove) {
      wx.showToast({
        title: '无权限审批台账',
        icon: 'none'
      })
      return
    }

    const isApproved = status === 'approved'
    const title = isApproved ? '确认通过' : '确认拒绝'
    const content = isApproved ? '确定要通过这个台账吗？' : '确定要拒绝这个台账吗？'

    wx.showModal({
      title,
      content,
      editable: !isApproved,
      placeholderText: '请输入拒绝原因（可选）',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' })
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'quickstartFunctions',
              data: {
                type: 'approveRecord',
                data: {
                  recordId: id,
                  userId: this.data.userInfo.userId,
                  approved: isApproved,
                  comment: res.content || ''
                }
              }
            })

            if (result.result.success) {
              wx.hideLoading()
              wx.showToast({
                title: result.result.message,
                icon: 'success'
              })
              this.loadRecords(true)
            } else {
              wx.hideLoading()
              wx.showToast({
                title: result.result.error || '操作失败',
                icon: 'none'
              })
            }
          } catch (error) {
            wx.hideLoading()
            console.error('审批台账失败:', error)
            wx.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadRecords(true)
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadRecords()
  }
})
