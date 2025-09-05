// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    userStats: {
      forms: 0
    },
    unreadCount: 0
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.loadUserInfo()
    this.loadUserStats()
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
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getUserInfo',
          data: {
            userId: this.data.userInfo.userId
          }
        }
      })

      if (result.result.success) {
        this.setData({
          userInfo: result.result.data
        })
        // 更新本地存储
        wx.setStorageSync('userInfo', result.result.data)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  },

  // 加载用户统计信息
  async loadUserStats() {
    try {
      const userId = this.data.userInfo?.userId
      if (!userId) return

      // 获取上传文档模板数量（如果有相关接口）
      const formsResult = await Promise.resolve({ result: { success: true, data: { total: 0 } } })

      const stats = {
        forms: formsResult.result.success ? formsResult.result.data.total : 0
      }

      this.setData({
        userStats: stats
      })
    } catch (error) {
      console.error('加载用户统计信息失败:', error)
    }
  },

  // 修改密码
  onChangePassword() {
    wx.showModal({
      title: '修改密码',
      content: '请联系管理员修改密码',
      showCancel: false
    })
  },




  // 查看我的表单
  onMyForms() {
    wx.navigateTo({
      url: '/pages/forms/forms'
    })
  },

  // 联系客服
  onContactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服热线：400-123-4567\n工作时间：9:00-18:00\n或通过微信客服号：service_help',
      showCancel: false,
      confirmText: '知道了'
    })
  },


  // 帮助中心
  onHelp() {
    wx.showModal({
      title: '帮助中心',
      content: '常见问题：\n1. 如何上传文档？\n2. 如何填写表单？\n3. 如何查看提交记录？\n\n更多帮助请查看使用手册',
      showCancel: false,
      confirmText: '知道了'
    })
  },



  // 账户设置
  onAccountSettings() {
    wx.showModal({
      title: '账户信息',
      content: '姓名：' + this.data.userInfo.name + '\n工号：' + this.data.userInfo.workId + '\n部门：' + this.data.userInfo.department,
      showCancel: false
    })
  },



  // 清理缓存
  onCacheClear() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理应用缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({
            title: '缓存已清理',
            icon: 'success'
          })
        }
      }
    })
  },

  // 关于系统
  onAbout() {
    wx.showModal({
      title: '关于系统',
      content: '原料文档管理系统 v2.0\n钢铁集团原料管理部\n技术支持：微信云开发\n\n新版本特性：\n• 现代化界面设计\n• 快捷操作面板\n• 智能数据统计',
      showCancel: false
    })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})
