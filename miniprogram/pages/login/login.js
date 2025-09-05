// pages/login/login.js
Page({
  data: {
    workId: '',
    password: '',
    loading: false
  },

  onLoad() {
    console.log('=== 登录页面加载 ===')
    console.log('页面数据:', this.data)
    
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      console.log('已登录用户:', userInfo)
      this.redirectToIndex()
    } else {
      console.log('用户未登录，显示登录页面')
    }
  },

  // 输入工号
  onWorkIdInput(e) {
    this.setData({
      workId: e.detail.value
    })
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  async onLogin() {
    const { workId, password } = this.data
    
    if (!workId || !password) {
      wx.showToast({
        title: '请输入工号和密码',
        icon: 'none'
      })
      return
    }

    console.log('开始登录:', { workId, password })
    this.setData({ loading: true })

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'login',
          data: {
            workId,
            password
          }
        }
      })

      console.log('登录结果:', result)

      if (result.result && result.result.success) {
        // 保存用户信息
        wx.setStorageSync('userInfo', result.result.data)
        console.log('用户信息已保存:', result.result.data)
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 跳转到首页
        setTimeout(() => {
          this.redirectToIndex()
        }, 1500)
      } else {
        console.error('登录失败:', result.result?.error)
        wx.showToast({
          title: result.result?.error || '登录失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('登录错误:', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳转到首页
  redirectToIndex() {
    console.log('跳转到首页')
    wx.reLaunch({
      url: '/pages/index/index',
      success: () => {
        console.log('跳转成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    })
  }
})
