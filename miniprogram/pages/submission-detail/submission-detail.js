// pages/submission-detail/submission-detail.js
Page({
  data: {
    userInfo: null,
    submissionId: '',
    submission: null,
    loading: true,
    error: null
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      this.setData({ 
        loading: false, 
        error: '缺少提交ID参数' 
      })
      return
    }
    this.setData({ submissionId: id })
    this.checkLogin()
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
    this.loadSubmissionDetail()
  },

  // 加载提交详情
  async loadSubmissionDetail() {
    this.setData({ loading: true, error: null })

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getSubmissionDetail',
          data: {
            submissionId: this.data.submissionId,
            userId: this.data.userInfo.userId
          }
        }
      })

      if (result.result && result.result.success) {
        this.setData({
          submission: result.result.data,
          loading: false
        })
      } else {
        const errorMsg = result.result?.error || '加载失败'
        this.setData({ 
          loading: false, 
          error: errorMsg 
        })
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        })
      }
    } catch (error) {
      this.setData({ 
        loading: false, 
        error: '网络错误，请重试' 
      })
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  },

  // 重试加载
  onRetry() {
    this.loadSubmissionDetail()
  }
})
