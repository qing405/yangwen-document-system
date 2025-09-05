// pages/form-fill/form-fill.js
Page({
  data: {
    distributionId: '',
    formData: null,
    userInfo: null,
    formResponses: {},
    loading: false,
    submitting: false
  },

  onLoad(options) {
    const { distributionId } = options
    if (distributionId) {
      this.setData({ distributionId })
      this.loadFormData()
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载表单数据
  async loadFormData() {
    try {
      this.setData({ loading: true })
      
      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo')
      this.setData({ userInfo })
      
      // 获取分发记录
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getFormDistribution',
          data: {
            distributionId: this.data.distributionId,
            userId: userInfo.workId
          }
        }
      })

      if (result.result && result.result.success) {
        const distribution = result.result.data.distribution
        console.log('获取到的分发记录:', distribution)
        
        // 确保表单数据包含必要的字段
        const formData = {
          ...distribution,
          formTitle: distribution.formTitle || distribution.title,
          formDescription: distribution.formDescription || distribution.description,
          formDocumentUrl: distribution.formDocumentUrl || distribution.documentUrl,
          formDocumentName: distribution.formDocumentName || distribution.documentName,
          formDocumentType: distribution.formDocumentType || distribution.documentType,
          assignerName: distribution.assignerName || distribution.assigner,
          deadline: distribution.deadline,
          priority: distribution.priority,
          description: distribution.description
        }
        
        this.setData({ formData })
        
        // 检查是否已经提交过
        if (distribution.status === 'completed') {
          this.loadExistingResponse()
        }
      } else {
        throw new Error(result.result?.error || '获取表单数据失败')
      }
    } catch (error) {
      console.error('加载表单数据失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载已存在的回复
  async loadExistingResponse() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getFormSubmission',
          data: {
            distributionId: this.data.distributionId,
            userId: this.data.userInfo.workId
          }
        }
      })

      if (result.result && result.result.success) {
        const submission = result.result.data.submission
        this.setData({ formResponses: submission.responses || {} })
      }
    } catch (error) {
      console.error('加载已存在回复失败:', error)
    }
  },

  // 输入处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formResponses.${field}`]: value
    })
  },

  // 选择处理
  onSelectChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formResponses.${field}`]: value
    })
  },

  // 多选处理
  onCheckboxChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail.value
    
    this.setData({
      [`formResponses.${field}`]: value
    })
  },

  // 提交表单
  async submitForm() {
    if (!this.validateForm()) {
      return
    }

    try {
      this.setData({ submitting: true })
      
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'submitFormResponse',
          data: {
            distributionId: this.data.distributionId,
            formId: this.data.formData.formId,
            userId: this.data.userInfo.workId,
            userName: this.data.userInfo.name,
            userDepartment: this.data.userInfo.department,
            responses: this.data.formResponses,
            submitTime: new Date()
          }
        }
      })

      if (result.result && result.result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(result.result?.error || '提交失败')
      }
    } catch (error) {
      console.error('提交表单失败:', error)
      wx.showToast({
        title: '提交失败',
        icon: 'error'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 验证表单
  validateForm() {
    // 这里可以添加表单验证逻辑
    // 目前简单检查是否有内容
    const responses = this.data.formResponses
    if (Object.keys(responses).length === 0) {
      wx.showToast({
        title: '请填写表单内容',
        icon: 'none'
      })
      return false
    }
    return true
  },

  // 查看文档
  viewDocument() {
    if (this.data.formData.formDocumentUrl) {
      wx.previewFile({
        fileID: this.data.formData.formDocumentUrl,
        success: (res) => {
          console.log('预览文档成功:', res)
        },
        fail: (err) => {
          console.error('预览文档失败:', err)
          wx.showToast({
            title: '文档预览失败',
            icon: 'error'
          })
        }
      })
    }
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})