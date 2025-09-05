// 表单数据统一管理工具
class FormDataManager {
  constructor() {
    this.cache = new Map()
    this.listeners = new Map()
    this.refreshCallbacks = []
  }

  // 注册数据刷新回调
  registerRefreshCallback(callback) {
    this.refreshCallbacks.push(callback)
  }

  // 移除数据刷新回调
  unregisterRefreshCallback(callback) {
    const index = this.refreshCallbacks.indexOf(callback)
    if (index > -1) {
      this.refreshCallbacks.splice(index, 1)
    }
  }

  // 通知所有监听器数据已更新
  notifyDataUpdate(dataType, data) {
    // 对于重要操作（如创建、更新、删除），立即通知
    if (['form_created', 'form_updated', 'form_deleted', 'form_distributed'].includes(dataType)) {
      this.refreshCallbacks.forEach(callback => {
        try {
          callback(dataType, data)
        } catch (error) {
          console.error('数据更新回调执行失败:', error)
        }
      })
    } else {
      // 对于其他数据更新，使用防抖处理
      if (this.notifyTimeout) {
        clearTimeout(this.notifyTimeout)
      }
      
      this.notifyTimeout = setTimeout(() => {
        this.refreshCallbacks.forEach(callback => {
          try {
            callback(dataType, data)
          } catch (error) {
            console.error('数据更新回调执行失败:', error)
          }
        })
      }, 100) // 100ms防抖
    }
  }

  // 获取协作表单列表
  async getCollaborativeForms(options = {}, forceRefresh = false) {
    const cacheKey = `forms_${JSON.stringify(options)}`
    
    // 检查缓存（除非强制刷新）
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < 10000) { // 减少到10秒缓存
        return cached.data
      }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getCollaborativeForms',
          data: options
        }
      })

      if (result.result && result.result.success) {
        const formsData = result.result.data?.forms || []
        const forms = formsData.map(form => ({
          _id: form._id,
          id: form._id,
          title: form.title,
          description: form.description,
          documentType: form.documentType,
          documentName: form.documentName,
          documentUrl: form.documentUrl,
          status: form.status,
          createTime: form.createTime,
          creatorId: form.creatorId,
          creatorName: form.creatorName,
          progressText: form.progressText || '0/0 已提交',
          statusColor: form.status === 'published' ? '#10B981' : form.status === 'draft' ? '#F59E0B' : '#6B7280',
          statusText: form.status === 'published' ? '已发布' : form.status === 'draft' ? '草稿' : '未知'
        }))

        // 缓存数据
        this.cache.set(cacheKey, {
          data: forms,
          timestamp: Date.now()
        })

        // 通知数据更新（静默更新，不显示通知）
        this.notifyDataUpdate('forms', forms)
        
        return forms
      } else {
        throw new Error(result.result?.error || '获取表单列表失败')
      }
    } catch (error) {
      console.error('获取协作表单失败:', error)
      throw error
    }
  }

  // 获取用户列表
  async getUsers(forceRefresh = false) {
    const cacheKey = 'users'
    
    // 检查缓存（除非强制刷新）
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < 30000) { // 减少到30秒缓存
        return cached.data
      }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getUsers',
          data: {}
        }
      })

      if (result.result && result.result.success) {
        const usersData = result.result.data?.users || []
        const users = usersData.map(user => ({
          _id: user._id,
          id: user._id || user.workId,
          workId: user.workId || user._id,
          name: user.name,
          department: user.department || '未知部门',
          role: user.role === 'admin' ? '管理员' : '普通用户',
          avatar: user.avatar || '/images/avatar.png',
          email: user.email || ''
        }))

        // 缓存数据
        this.cache.set(cacheKey, {
          data: users,
          timestamp: Date.now()
        })

        // 通知数据更新（静默更新，不显示通知）
        this.notifyDataUpdate('users', users)
        
        return users
      } else {
        throw new Error(result.result?.error || '获取用户列表失败')
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  // 获取任务分配列表
  async getFormDistributions(userId, forceRefresh = false) {
    const cacheKey = `distributions_${userId}`
    
    // 检查缓存（除非强制刷新）
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < 10000) { // 10秒缓存
        return cached.data
      }
    }
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getFormDistributions',
          data: { userId }
        }
      })

      if (result.result && result.result.success) {
        const distributionsData = result.result.data?.distributions || []
        const tasks = distributionsData.map(distribution => ({
          id: distribution._id,
          title: distribution.formTitle || '未命名任务',
          formId: distribution.formId,
          formTitle: distribution.formTitle || '未命名表单',
          assignee: distribution.assigneeName || '未知',
          assigner: distribution.assignerName || '未知',
          status: this.getTaskStatus(distribution),
          priority: this.getTaskPriority(distribution),
          deadline: distribution.deadline || '无截止时间',
          progress: this.calculateProgress(distribution),
          submitted: distribution.submittedCount || 0,
          total: distribution.targetCount || 0,
          createTime: distribution.createTime || new Date().toISOString(),
          isOverdue: this.isOverdue(distribution.deadline)
        }))

        // 缓存数据
        this.cache.set(cacheKey, {
          data: tasks,
          timestamp: Date.now()
        })

        // 通知数据更新（静默更新，不显示通知）
        this.notifyDataUpdate('distributions', tasks)
        
        return tasks
      } else {
        throw new Error(result.result?.error || '获取任务分配失败')
      }
    } catch (error) {
      console.error('获取任务分配失败:', error)
      throw error
    }
  }

  // 获取统计数据
  async getStatistics(userId, forceRefresh = false) {
    const cacheKey = `statistics_${userId}`
    
    // 检查缓存（除非强制刷新）
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < 15000) { // 减少到15秒缓存
        return cached.data
      }
    }

    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getStatistics',
          data: { userId }
        }
      })

      if (result.result && result.result.success) {
        const stats = result.result.data

        // 缓存数据
        this.cache.set(cacheKey, {
          data: stats,
          timestamp: Date.now()
        })

        // 通知数据更新（静默更新，不显示通知）
        this.notifyDataUpdate('statistics', stats)
        
        return stats
      } else {
        throw new Error(result.result?.error || '获取统计数据失败')
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw error
    }
  }

  // 创建协作表单
  async createCollaborativeForm(formData) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'createCollaborativeForm',
          data: formData
        }
      })

      if (result.result && result.result.success) {
        // 立即清除相关缓存
        this.clearCacheByPattern('forms_')
        this.clearCacheByPattern('statistics_')
        
        // 通知数据更新
        this.notifyDataUpdate('form_created', result.result.data)
        
        // 立即刷新相关数据
        setTimeout(() => {
          this.refreshRelatedData(formData.creatorId)
        }, 200) // 减少延迟时间
        
        return result.result.data
      } else {
        throw new Error(result.result?.error || '创建表单失败')
      }
    } catch (error) {
      console.error('创建协作表单失败:', error)
      throw error
    }
  }

  // 分发表单
  async distributeCollaborativeForm(distributionData) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'distributeCollaborativeForm',
          data: distributionData
        }
      })

      if (result.result && result.result.success) {
        // 立即清除相关缓存
        this.clearCacheByPattern('forms_')
        this.clearCacheByPattern('distributions_')
        this.clearCacheByPattern('statistics_')
        
        // 通知数据更新
        this.notifyDataUpdate('form_distributed', result.result.data)
        
        // 立即刷新相关数据
        setTimeout(() => {
          this.refreshRelatedData(distributionData.assignerId)
        }, 200) // 减少延迟时间
        
        return result.result.data
      } else {
        throw new Error(result.result?.error || '分发表单失败')
      }
    } catch (error) {
      console.error('分发表单失败:', error)
      throw error
    }
  }

  // 更新表单状态
  async updateCollaborativeForm(formId, updateData, userInfo) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'updateCollaborativeForm',
          data: {
            formId,
            updateData,
            userId: userInfo.workId,
            userName: userInfo.name,
            userDepartment: userInfo.department
          }
        }
      })

      if (result.result && result.result.success) {
        // 立即清除相关缓存
        this.clearCacheByPattern('forms_')
        this.clearCacheByPattern('statistics_')
        
        // 通知数据更新
        this.notifyDataUpdate('form_updated', { formId, updateData })
        
        // 立即刷新相关数据
        setTimeout(() => {
          this.refreshRelatedData(userInfo.workId)
        }, 200) // 减少延迟时间
        
        return result.result.data
      } else {
        throw new Error(result.result?.error || '更新表单失败')
      }
    } catch (error) {
      console.error('更新表单失败:', error)
      throw error
    }
  }

  // 删除表单
  async deleteCollaborativeForm(formId, userInfo) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'deleteCollaborativeForm',
          data: {
            formId,
            userId: userInfo.workId
          }
        }
      })

      if (result.result && result.result.success) {
        // 立即清除相关缓存
        this.clearCacheByPattern('forms_')
        this.clearCacheByPattern('statistics_')
        
        // 通知数据更新
        this.notifyDataUpdate('form_deleted', { formId })
        
        // 立即刷新相关数据
        setTimeout(() => {
          this.refreshRelatedData(userInfo.workId)
        }, 200) // 减少延迟时间
        
        return result.result.data
      } else {
        throw new Error(result.result?.error || '删除表单失败')
      }
    } catch (error) {
      console.error('删除表单失败:', error)
      throw error
    }
  }

  // 获取任务状态
  getTaskStatus(distribution) {
    if (distribution.status === 'completed') return 'completed'
    if (distribution.status === 'in_progress') return 'in_progress'
    if (this.isOverdue(distribution.deadline)) return 'overdue'
    return 'pending'
  }

  // 获取任务优先级
  getTaskPriority(distribution) {
    if (this.isOverdue(distribution.deadline)) return 'high'
    if (distribution.priority === 'urgent') return 'high'
    if (distribution.priority === 'normal') return 'medium'
    return 'low'
  }

  // 计算进度
  calculateProgress(distribution) {
    const total = distribution.targetCount || 0
    const submitted = distribution.submittedCount || 0
    return total > 0 ? Math.round((submitted / total) * 100) : 0
  }

  // 判断是否逾期
  isOverdue(deadline) {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  // 清除指定模式的缓存
  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // 清除所有缓存
  clearAllCache() {
    this.cache.clear()
  }

  // 刷新相关数据
  async refreshRelatedData(userId) {
    try {
      // 并行刷新所有相关数据（静默刷新，不触发通知）
      await Promise.all([
        this.getCollaborativeForms({ creatorId: userId }, true),
        this.getStatistics(userId, true),
        this.getUsers(true)
      ])
      // 静默刷新，不显示日志
    } catch (error) {
      console.error('刷新相关数据失败:', error)
    }
  }

  // 强制刷新所有数据
  async forceRefreshAll(userId) {
    try {
      this.clearAllCache()
      await this.refreshRelatedData(userId)
      // 静默刷新，不显示日志
    } catch (error) {
      console.error('强制刷新所有数据失败:', error)
    }
  }

  // 获取缓存统计
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// 创建单例实例
const formDataManager = new FormDataManager()

module.exports = formDataManager
