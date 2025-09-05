// pages/activity-history/activity-history.js
Page({
  data: {
    userInfo: null,
    activities: [],
    loading: true,
    activitiesLoading: false,
    activitiesPage: 1,
    activitiesPageSize: 20,
    hasMoreActivities: true,
    refreshing: false
  },

  onLoad() {
    this.checkUserAuth()
  },

  onShow() {
    if (this.data.userInfo) {
      this.loadActivities(true)
    }
  },

  // 检查用户登录状态
  async checkUserAuth() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        wx.showModal({
          title: '提示',
          content: '请先登录',
          showCancel: false,
          success: () => {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
        })
        return
      }
      this.setData({ userInfo })
    } catch (error) {
      console.error('检查用户登录状态失败:', error)
    }
  },

  // 加载活动列表
  async loadActivities(refresh = false) {
    if (refresh) {
      this.setData({ 
        activitiesPage: 1, 
        hasMoreActivities: true,
        activities: [],
        refreshing: true
      })
    }
    
    if (this.data.activitiesLoading) return
    
    this.setData({ activitiesLoading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getRecentActivities',
          data: {
            userId: this.data.userInfo._id || this.data.userInfo.workId,
            page: this.data.activitiesPage,
            pageSize: this.data.activitiesPageSize
          }
        }
      })

      if (result.result && result.result.success) {
        const { activities, total } = result.result.data
        
        if (refresh) {
          this.setData({ activities: activities })
        } else {
          this.setData({ 
            activities: [...this.data.activities, ...activities]
          })
        }
        
        // 检查是否还有更多数据
        const hasMore = this.data.activities.length < total
        this.setData({ hasMoreActivities: hasMore })
        
      } else {
        console.error('获取活动数据失败:', result.result?.error)
        wx.showToast({
          title: '获取活动数据失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载活动失败:', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ 
        activitiesLoading: false,
        loading: false,
        refreshing: false
      })
    }
  },

  // 加载更多活动
  async loadMoreActivities() {
    if (this.data.activitiesLoading || !this.data.hasMoreActivities) return
    
    this.setData({ 
      activitiesPage: this.data.activitiesPage + 1 
    })
    
    await this.loadActivities(false)
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadActivities(true)
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadMoreActivities()
  },

  // 返回首页
  goBack() {
    wx.navigateBack()
  }
})
