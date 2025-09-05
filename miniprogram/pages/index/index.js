// pages/index/index.js
const formDataManager = require('../../utils/formDataManager')
const statisticsManager = require('../../utils/statisticsManager')

Page({
  data: {
    userInfo: null,
    currentDate: '',
    currentTime: '',
    stats: {
      documentCount: 0,
      formCount: 0,
      submissionCount: 0,
      userCount: 0
    },
    recentActivities: [],
    loading: true,
    activitiesLoading: false,
    activitiesPage: 1,
    activitiesPageSize: 10,
    hasMoreActivities: true,
    maxDisplayActivities: 4 // 首页最多显示的活动数量
  },

  onLoad() {
    this.checkLogin()
    this.startDateTimeUpdate()
    
    // 注册数据更新回调
    this.dataUpdateCallback = this.handleDataUpdate.bind(this);
    formDataManager.registerRefreshCallback(this.dataUpdateCallback);
    
    // 注册统计数据更新回调
    this.statsUpdateCallback = this.handleStatsUpdate.bind(this);
    statisticsManager.registerUpdateCallback(this.statsUpdateCallback);
  },

  onUnload() {
    // 清除定时器
    if (this.dateTimeTimer) {
      clearInterval(this.dateTimeTimer)
    }
    
    // 移除数据更新回调
    if (this.dataUpdateCallback) {
      formDataManager.unregisterRefreshCallback(this.dataUpdateCallback);
    }
    
    // 移除统计数据更新回调
    if (this.statsUpdateCallback) {
      statisticsManager.unregisterUpdateCallback(this.statsUpdateCallback);
    }
  },

  // 处理数据更新
  handleDataUpdate(dataType, data) {
    // 静默处理数据更新，不显示通知
    switch (dataType) {
      case 'statistics':
        this.setData({ stats: data });
        break;
      case 'form_created':
      case 'form_updated':
      case 'form_deleted':
      case 'form_distributed':
        // 静默重新加载统计数据和活动
        this.loadStats(true);
        this.loadRecentActivities(true);
        break;
    }
  },

  // 处理统计数据更新
  handleStatsUpdate(stats) {
    // 静默更新统计数据，不显示通知
    this.setData({ stats });
  },

  onShow() {
    if (this.data.userInfo) {
      this.loadStats()
      this.loadRecentActivities(true)
      
      // 启动统计数据自动更新
      statisticsManager.startAutoUpdate()
      
      // 检查是否需要刷新（来自其他页面的通知）
      this.checkRefreshFlag()
    }
  },

  onHide() {
    // 停止统计数据自动更新
    statisticsManager.stopAutoUpdate()
  },


  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecentActivities(true)
    this.loadStats(true) // 强制刷新统计数据
    wx.stopPullDownRefresh()
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
    
    // 处理用户信息，添加角色显示名称
    const processedUserInfo = this.processUserInfo(userInfo)
    this.setData({ userInfo: processedUserInfo })
    this.loadStats()
    this.loadRecentActivities(true)
  },

  // 处理用户信息，添加角色显示名称
  processUserInfo(userInfo) {
    const roleMap = {
      'admin': '管理员',
      'manager': '车间长',
      'operator': '操作员'
    }
    
    return {
      ...userInfo,
      roleDisplay: roleMap[userInfo.role] || userInfo.role
    }
  },

  // 开始日期时间更新
  startDateTimeUpdate() {
    this.updateDateTime()
    this.dateTimeTimer = setInterval(() => {
      this.updateDateTime()
    }, 1000)
  },

  // 更新日期时间
  updateDateTime() {
    const now = new Date()
    
    // 中文日期格式
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '9月', '十月', '十一月', '十二月']
    
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}日 ${now.getFullYear()}年 ${weekdays[now.getDay()]}`
    
    // 24小时制时间格式
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    
    this.setData({
      currentDate: dateStr,
      currentTime: timeStr
    })
  },

  // 加载统计数据
  async loadStats(forceRefresh = false) {
    this.setData({ loading: true })
    
    try {
      const stats = await formDataManager.getStatistics(this.data.userInfo.userId, forceRefresh)
      this.setData({ stats })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载最近活动
  async loadRecentActivities(refresh = false) {
    if (refresh) {
      this.setData({ 
        activitiesPage: 1, 
        hasMoreActivities: true,
        recentActivities: []
      })
    }
    
    if (this.data.activitiesLoading) return
    
    this.setData({ activitiesLoading: true })
    
    try {
      const userId = this.data.userInfo._id || this.data.userInfo.workId
      console.log('加载最近活动，用户ID:', userId, '用户信息:', this.data.userInfo)
      
      // 首页获取最新的活动记录
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getRecentActivities',
          data: {
            userId: userId,
            page: 1,
            pageSize: 10 // 获取更多记录，确保有足够的数据显示
          }
        }
      })
      
      console.log('获取活动结果:', result)

      if (result.result && result.result.success) {
        const { activities, total } = result.result.data
        console.log('解析后的活动数据:', {
          activitiesCount: activities ? activities.length : 0,
          total: total,
          activities: activities ? activities.slice(0, 2) : [] // 只打印前2条
        })
        
        // 首页只显示最新的4条记录
        const displayActivities = (activities || []).slice(0, this.data.maxDisplayActivities)
        this.setData({ 
          recentActivities: displayActivities,
          hasMoreActivities: total > this.data.maxDisplayActivities
        })
        
      } else {
        console.error('获取活动数据失败:', result.result?.error)
        wx.showToast({
          title: '获取活动数据失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载最近活动失败:', error)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ activitiesLoading: false })
    }
  },


  // 跳转到活动历史页面
  goToActivityHistory() {
    wx.navigateTo({
      url: '/pages/activity-history/activity-history'
    })
  },


  // 检查刷新标记
  checkRefreshFlag() {
    try {
      const needRefresh = wx.getStorageSync('needRefreshHomePage')
      if (needRefresh) {
        console.log('检测到刷新标记，执行刷新')
        // 清除标记
        wx.removeStorageSync('needRefreshHomePage')
        // 执行刷新
        this.loadStats()
        this.loadRecentActivities(true)
      }
    } catch (error) {
      console.error('检查刷新标记失败:', error)
    }
  }
})
