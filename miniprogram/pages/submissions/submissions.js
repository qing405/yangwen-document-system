// pages/submissions/submissions.js
Page({
  data: {
    userInfo: null,
    submissions: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    this.checkLogin()
  },

  onShow() {
    if (this.data.userInfo) {
      this.loadSubmissions(true)
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
    this.loadSubmissions(true)
  },

  // 加载提交列表
  async loadSubmissions(refresh = false) {
    if (refresh) {
      this.setData({ 
        page: 1, 
        hasMore: true,
        submissions: []
      })
    }

    if (!this.data.hasMore || this.data.loading) return

    this.setData({ loading: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getSubmissions',
          data: {
            userId: this.data.userInfo.userId,
            page: this.data.page,
            pageSize: 20
          }
        }
      })

      if (result.result && result.result.success) {
        const newSubmissions = result.result.data
        const submissions = refresh ? newSubmissions : [...this.data.submissions, ...newSubmissions]
        
        this.setData({
          submissions,
          page: this.data.page + 1,
          hasMore: newSubmissions.length === 20
        })
      } else {
        wx.showToast({
          title: result.result?.error || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载提交列表失败:', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 查看提交详情
  onViewSubmission(e) {
    const { id } = e.currentTarget.dataset
    console.log('跳转到提交详情，ID:', id)
    wx.navigateTo({
      url: `/pages/submission-detail/submission-detail?id=${id}`,
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadSubmissions(true)
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  onReachBottom() {
    this.loadSubmissions()
  }
})