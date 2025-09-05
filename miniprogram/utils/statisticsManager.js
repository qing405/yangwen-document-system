// 统计数据管理工具
const formDataManager = require('./formDataManager')

class StatisticsManager {
  constructor() {
    this.updateInterval = null
    this.updateCallbacks = []
    this.isUpdating = false
    this.lastUpdateTime = 0
    this.updateFrequency = 30000 // 30秒更新一次，减少频繁更新
  }

  // 注册统计数据更新回调
  registerUpdateCallback(callback) {
    this.updateCallbacks.push(callback)
  }

  // 移除统计数据更新回调
  unregisterUpdateCallback(callback) {
    const index = this.updateCallbacks.indexOf(callback)
    if (index > -1) {
      this.updateCallbacks.splice(index, 1)
    }
  }

  // 开始自动更新
  startAutoUpdate() {
    if (this.updateInterval) {
      return // 已经在更新中
    }

    this.updateInterval = setInterval(() => {
      this.updateStatistics()
    }, this.updateFrequency)

    console.log('统计数据自动更新已启动')
  }

  // 停止自动更新
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      console.log('统计数据自动更新已停止')
    }
  }

  // 更新统计数据
  async updateStatistics() {
    if (this.isUpdating) {
      return // 避免重复更新
    }

    this.isUpdating = true
    this.lastUpdateTime = Date.now()

    try {
      // 获取所有用户的统计数据
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        const stats = await formDataManager.getStatistics(userInfo.userId, true) // 强制刷新
        
        // 通知所有监听器（静默更新，不显示通知）
        this.updateCallbacks.forEach(callback => {
          try {
            callback(stats)
          } catch (error) {
            console.error('统计数据更新回调执行失败:', error)
          }
        })
      }
    } catch (error) {
      console.error('更新统计数据失败:', error)
    } finally {
      this.isUpdating = false
    }
  }

  // 手动触发更新
  async forceUpdate() {
    await this.updateStatistics()
  }

  // 获取更新状态
  getUpdateStatus() {
    return {
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      updateFrequency: this.updateFrequency,
      hasInterval: !!this.updateInterval
    }
  }

  // 设置更新频率
  setUpdateFrequency(frequency) {
    this.updateFrequency = frequency
    
    // 如果正在自动更新，重启以应用新频率
    if (this.updateInterval) {
      this.stopAutoUpdate()
      this.startAutoUpdate()
    }
  }

  // 计算表单完成率
  calculateCompletionRate(forms) {
    if (!forms || forms.length === 0) return 0
    
    const completedForms = forms.filter(form => form.status === 'completed')
    return Math.round((completedForms.length / forms.length) * 100)
  }

  // 计算任务进度统计
  calculateTaskProgress(tasks) {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
        completionRate: 0
      }
    }

    const total = tasks.length
    const completed = tasks.filter(task => task.status === 'completed').length
    const inProgress = tasks.filter(task => task.status === 'in_progress').length
    const overdue = tasks.filter(task => task.status === 'overdue').length
    const completionRate = Math.round((completed / total) * 100)

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate
    }
  }

  // 获取实时统计概览
  async getRealTimeOverview(userId) {
    try {
      const [forms, tasks, stats] = await Promise.all([
        formDataManager.getCollaborativeForms({ creatorId: userId }),
        formDataManager.getFormDistributions(userId),
        formDataManager.getStatistics(userId)
      ])

      const formCompletionRate = this.calculateCompletionRate(forms)
      const taskProgress = this.calculateTaskProgress(tasks)

      return {
        // 表单统计
        formStats: {
          total: forms.length,
          published: forms.filter(f => f.status === 'published').length,
          draft: forms.filter(f => f.status === 'draft').length,
          completionRate: formCompletionRate
        },
        // 任务统计
        taskStats: taskProgress,
        // 系统统计
        systemStats: stats,
        // 更新时间
        lastUpdate: new Date().toISOString()
      }
    } catch (error) {
      console.error('获取实时统计概览失败:', error)
      throw error
    }
  }
}

// 创建单例实例
const statisticsManager = new StatisticsManager()

module.exports = statisticsManager
