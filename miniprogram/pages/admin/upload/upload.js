// pages/admin/upload/upload.js
Page({
  data: {
    userInfo: null,
    uploadForm: {
      category: '',
      departmentAccess: [],
      tags: []
    },
    categoryDisplayText: '请选择文档分类',
    documentCategories: [
      { label: '技术文档', value: 'technical' },
      { label: '设计图纸', value: 'design' },
      { label: '操作规程', value: 'operation' },
      { label: '质量手册', value: 'quality' },
      { label: '安全规范', value: 'safety' },
      { label: '报告分析', value: 'report' }
    ],
    departments: [
      // 科室
      { label: '机动组', value: '机动组', type: '科室' },
      { label: '安全组', value: '安全组', type: '科室' },
      { label: '环保组', value: '环保组', type: '科室' },
      { label: '生产组', value: '生产组', type: '科室' },
      // 车间
      { label: '原料一车间', value: '原料一车间', type: '车间' },
      { label: '原料二车间', value: '原料二车间', type: '车间' },
      { label: '原料三车间', value: '原料三车间', type: '车间' },
      { label: '原料四车间', value: '原料四车间', type: '车间' },
      { label: '物料缓冲车间', value: '物料缓冲车间', type: '车间' },
      { label: '管带运输车间', value: '管带运输车间', type: '车间' },
      { label: '维修车间', value: '维修车间', type: '车间' }
    ],
    selectedFiles: [],
    uploading: false,
    uploadProgress: 0,
    // 支持的文件类型
    supportedFileTypes: {
      // Word文档
      'doc': { mime: 'application/msword', maxSize: 50 * 1024 * 1024, icon: 'documents' },
      'docx': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', maxSize: 50 * 1024 * 1024, icon: 'documents' },
      // Excel文档
      'xls': { mime: 'application/vnd.ms-excel', maxSize: 50 * 1024 * 1024, icon: 'documents' },
      'xlsx': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', maxSize: 50 * 1024 * 1024, icon: 'documents' },
      // PowerPoint文档
      'ppt': { mime: 'application/vnd.ms-powerpoint', maxSize: 50 * 1024 * 1024, icon: 'documents' },
      'pptx': { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', maxSize: 50 * 1024 * 1024, icon: 'documents' },
      // PDF文档
      'pdf': { mime: 'application/pdf', maxSize: 100 * 1024 * 1024, icon: 'documents' },
      // 图片文件
      'jpg': { mime: 'image/jpeg', maxSize: 20 * 1024 * 1024, icon: 'documents' },
      'jpeg': { mime: 'image/jpeg', maxSize: 20 * 1024 * 1024, icon: 'documents' },
      'png': { mime: 'image/png', maxSize: 20 * 1024 * 1024, icon: 'documents' },
      'gif': { mime: 'image/gif', maxSize: 20 * 1024 * 1024, icon: 'documents' },
      'bmp': { mime: 'image/bmp', maxSize: 20 * 1024 * 1024, icon: 'documents' },
      // 文本文件
      'txt': { mime: 'text/plain', maxSize: 10 * 1024 * 1024, icon: 'documents' },
      'rtf': { mime: 'application/rtf', maxSize: 10 * 1024 * 1024, icon: 'documents' },
      // CAD文件
      'dwg': { mime: 'application/acad', maxSize: 100 * 1024 * 1024, icon: 'documents' },
      'dxf': { mime: 'application/dxf', maxSize: 100 * 1024 * 1024, icon: 'documents' },
      // 压缩文件
      'zip': { mime: 'application/zip', maxSize: 200 * 1024 * 1024, icon: 'documents' },
      'rar': { mime: 'application/x-rar-compressed', maxSize: 200 * 1024 * 1024, icon: 'documents' },
      '7z': { mime: 'application/x-7z-compressed', maxSize: 200 * 1024 * 1024, icon: 'documents' }
    }
  },

  onLoad() {
    this.checkLogin()
    console.log('页面加载完成，分类数据:', this.data.documentCategories)
    
    // 测试分类显示功能
    setTimeout(() => {
      console.log('测试分类显示功能:')
      console.log('uploadForm.category:', this.data.uploadForm.category)
      console.log('categoryDisplayText:', this.data.categoryDisplayText)
      console.log('getCategoryLabel测试:', this.getCategoryLabel('technical'))
    }, 1000)
  },

  onShow() {
    this.checkLogin()
    console.log('页面显示，分类数据:', this.data.documentCategories)
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.reLaunch({ url: '/pages/login/login' })
      return
    }

    // 检查是否为管理员
    if (userInfo.role !== 'admin') {
      wx.showToast({
        title: '只有管理员可以访问此页面',
        icon: 'none'
      })
      wx.navigateBack()
      return
    }

    this.setData({ userInfo })
  },

  // 选择文件
  onChooseFiles() {
    wx.chooseMessageFile({
      count: 10, // 支持选择多个文件
      type: 'file',
      success: (res) => {
        const files = res.tempFiles
        
        // 验证文件类型和大小
        const validationResults = files.map(file => this.validateFile(file))
        const invalidFiles = validationResults.filter(result => !result.valid)
        
        if (invalidFiles.length > 0) {
          wx.showToast({
            title: `文件选择失败: ${invalidFiles.map(f => f.message).join('; ')}`,
            icon: 'none',
            duration: 3000
          })
          return
        }

        // 处理中文文件名
        const processedFiles = files.map(file => ({
          ...file,
          name: this.processFileName(file.name),
          originalName: file.name, // 保留原始文件名
          customTitle: this.generateDocumentTitle(file.name) // 自动生成文档标题
        }))
        
        this.setData({
          selectedFiles: [...this.data.selectedFiles, ...processedFiles]
        })
        
        wx.showToast({
          title: `已选择 ${files.length} 个文件`,
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('选择文件失败:', err)
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        })
      }
    })
  },

  // 删除已选择的文件
  removeFile(e) {
    const index = e.currentTarget.dataset.index
    const selectedFiles = [...this.data.selectedFiles]
    selectedFiles.splice(index, 1)
    this.setData({ selectedFiles })
    
    wx.showToast({
      title: '文件已移除',
      icon: 'success'
    })
  },



  // 验证文件
  validateFile(file) {
    const extension = file.name.split('.').pop().toLowerCase()
    const fileTypeInfo = this.data.supportedFileTypes[extension]
    
    if (!fileTypeInfo) {
      return {
        valid: false,
        message: `不支持的文件类型: ${extension}`
      }
    }
    
    if (file.size > fileTypeInfo.maxSize) {
      const maxSizeMB = Math.round(fileTypeInfo.maxSize / (1024 * 1024))
      return {
        valid: false,
        message: `文件大小不能超过 ${maxSizeMB}MB`
      }
    }
    
    return { valid: true }
  },

  // 生成文档标题
  generateDocumentTitle(fileName) {
    // 移除文件扩展名
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    
    // 移除文件名中的特殊字符，保留中文、英文、数字和常用符号
    const cleanName = nameWithoutExt.replace(/[<>:"/\\|?*]/g, ' ')
    
    // 如果文件名过长，截取前50个字符
    if (cleanName.length > 50) {
      return cleanName.substring(0, 50) + '...'
    }
    
    return cleanName
  },

  // 处理中文文件名
  processFileName(fileName) {
    // 移除文件名中的特殊字符，保留中文、英文、数字和常用符号
    const cleanName = fileName.replace(/[<>:"/\\|?*]/g, '_')
    
    // 如果文件名过长，截取前50个字符
    if (cleanName.length > 50) {
      const extension = cleanName.split('.').pop()
      const nameWithoutExt = cleanName.substring(0, cleanName.lastIndexOf('.'))
      return nameWithoutExt.substring(0, 50) + '.' + extension
    }
    
    return cleanName
  },



  // 选择文档类型
  onTypeChange(e) {
    const index = e.detail.value
    const type = this.data.documentTypes[index].value
    this.setData({
      'uploadForm.type': type
    })
  },

  // 选择文档分类
  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.documentCategories[index].value
    const categoryLabel = this.data.documentCategories[index].label
    console.log('选择分类:', { index, category, categoryLabel, categories: this.data.documentCategories })
    
    this.setData({
      'uploadForm.category': category,
      categoryDisplayText: categoryLabel
    }, () => {
      // 在数据设置完成后检查状态
      console.log('分类设置完成，当前表单数据:', this.data.uploadForm)
      console.log('分类标签:', categoryLabel)
      console.log('categoryDisplayText:', this.data.categoryDisplayText)
    })
  },

  // 获取分类标签
  getCategoryLabel(categoryValue) {
    console.log('getCategoryLabel被调用，参数:', categoryValue)
    console.log('当前documentCategories:', this.data.documentCategories)
    
    if (!categoryValue) {
      console.log('categoryValue为空，返回空字符串')
      return ''
    }
    
    const category = this.data.documentCategories.find(cat => cat.value === categoryValue)
    console.log('找到的分类对象:', category)
    
    if (category) {
      console.log('返回分类标签:', category.label)
      return category.label
    } else {
      console.log('未找到分类，返回原值:', categoryValue)
      return categoryValue
    }
  },

  // 选择部门权限（支持多次选择累加）
  onDepartmentChange(e) {
    const index = Number(e.detail.value)
    const dept = this.data.departments[index]?.value
    if (!dept) return
    const current = this.data.uploadForm.departmentAccess || []
    if (current.includes(dept)) {
      wx.showToast({ title: '已选择该部门', icon: 'none' })
      return
    }
    this.setData({
      'uploadForm.departmentAccess': [...current, dept]
    })
  },

  // 移除已选部门
  removeDepartment(e) {
    const name = e.currentTarget.dataset.name
    const list = (this.data.uploadForm.departmentAccess || []).filter(d => d !== name)
    this.setData({ 'uploadForm.departmentAccess': list })
  },

  // 输入标签
  onTagsInput(e) {
    const tags = e.detail.value.split(',').map(tag => tag.trim()).filter(tag => tag)
    this.setData({
      'uploadForm.tags': tags
    })
  },

  // 验证表单
  validateForm() {
    const { uploadForm, selectedFiles } = this.data
    
    if (selectedFiles.length === 0) {
      wx.showToast({
        title: '请选择要上传的文件',
        icon: 'none'
      })
      return false
    }

    // 检查每个文件是否都有标题
    const filesWithoutTitle = selectedFiles.filter(file => !file.customTitle || !file.customTitle.trim())
    if (filesWithoutTitle.length > 0) {
      wx.showToast({
        title: `请为 ${filesWithoutTitle.length} 个文件填写标题`,
        icon: 'none',
        duration: 3000
      })
      return false
    }

    if (!uploadForm.category) {
      wx.showToast({
        title: '请选择文档分类',
        icon: 'none'
      })
      return false
    }

    // 如果没有选择部门权限，默认设置为所有部门
    if (uploadForm.departmentAccess.length === 0) {
      // 自动设置为所有部门，确保所有用户都能看到文档
      const allDepartments = this.data.departments.map(dept => dept.value)
      this.setData({
        'uploadForm.departmentAccess': allDepartments
      })
    }

    return true
  },

  // 上传文档
  async onUpload() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ uploading: true, uploadProgress: 0 })

    try {
      // 显示上传提示
      wx.showLoading({
        title: '正在上传...',
        mask: true
      })

      console.log('开始上传文档，文件信息:', this.data.selectedFiles)
      console.log('表单数据:', this.data.uploadForm)

      // 生成安全的文件名（避免中文路径问题）
      const timestamp = Date.now()
      const processedFiles = this.data.selectedFiles.map(file => {
        const extension = file.name.split('.').pop().toLowerCase()
        const safeFileName = `doc_${timestamp}.${extension}`
        return {
          ...file,
          name: safeFileName,
          originalName: file.originalName // 保留原始文件名
        }
      })
      
      console.log('准备上传到云存储:', {
        files: processedFiles
      })

      // 上传文件到云存储
      const uploadResults = await Promise.all(processedFiles.map(async file => {
        const cloudPath = `documents/${file.name}`
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath,
          filePath: file.path,
          onProgressUpdate: (res) => {
            console.log('上传进度更新:', res)
            this.setData({
              uploadProgress: res.progress
            })
          }
        })
        return uploadResult
      }))

      console.log('云存储上传结果:', uploadResults)

      if (uploadResults.every(result => result.fileID)) {
        console.log('文件上传成功，fileID:', uploadResults.map(r => r.fileID))
        
        // 获取文件信息
        const fileInfoPromises = uploadResults.map(result => wx.cloud.getTempFileURL({
          fileList: [result.fileID]
        }))
        const fileInfos = await Promise.all(fileInfoPromises)
        
        console.log('获取文件信息结果:', fileInfos)

        // 逐个上传文档
        const uploadPromises = uploadResults.map(async (res, index) => {
          const file = this.data.selectedFiles[index]
          
          return await wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: {
              type: 'uploadDocument',
              data: {
                title: file.customTitle || file.name, // 优先使用自定义标题，否则使用文件名
                category: this.data.uploadForm.category,
                filePath: res.fileID,
                uploaderId: this.data.userInfo.workId,
                departmentAccess: this.data.uploadForm.departmentAccess,
                tags: this.data.uploadForm.tags,
                fileSize: file.size,
                // 确保文件名使用UTF-8编码，并进行编码验证
                originalFileName: this.ensureUTF8Encoding(file.originalName || file.name || ''),
                fileExtension: file.name.split('.').pop().toLowerCase(),
                mimeType: this.data.supportedFileTypes[file.name.split('.').pop().toLowerCase()]?.mime || 'application/octet-stream'
              }
            }
          })
        })
        
        const results = await Promise.all(uploadPromises)
        const successResults = results.filter(r => r.result && r.result.success)
        const failedResults = results.filter(r => !r.result || !r.result.success)
        
        if (failedResults.length > 0) {
          console.error('部分文档上传失败:', failedResults)
          throw new Error(`${failedResults.length} 个文档上传失败`)
        }
        
        const result = {
          result: {
            success: true,
            data: {
              total: results.length,
              successful: successResults.length,
              failed: failedResults.length
            }
          }
        }

        console.log('云函数调用结果:', result)

        if (result.result && result.result.success) {
          console.log('文档上传成功，结果:', result.result)
          wx.hideLoading()
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          })
          
          // 重置表单
          this.resetForm()
          
          // 通知首页刷新活动数据
          this.notifyHomePageRefresh()
          
          // 延迟返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          console.error('文档上传失败:', result.result)
          throw new Error(result.result?.error || '上传失败')
        }
      } else {
        throw new Error('文件上传失败')
      }
    } catch (error) {
      console.error('上传文档失败:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      })
      wx.hideLoading()
      wx.showToast({
        title: error.message || '上传失败',
        icon: 'none',
        duration: 3000
      })
    } finally {
      this.setData({ uploading: false, uploadProgress: 0 })
    }
  },

  // 重置表单
  resetForm() {
    this.setData({
      uploadForm: {
        category: '',
        departmentAccess: [],
        tags: []
      },
      selectedFiles: [],
      categoryDisplayText: '请选择文档分类'
    })
  },

  // 获取文件类型
  getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase()
    const typeMap = {
      'pdf': '技术文档',
      'doc': '技术文档',
      'docx': '技术文档',
      'xls': '报告分析',
      'xlsx': '报告分析',
      'ppt': '技术文档',
      'pptx': '技术文档',
      'dwg': '设计图纸',
      'dxf': '设计图纸',
      'jpg': '设计图纸',
      'jpeg': '设计图纸',
      'png': '设计图纸',
      'gif': '设计图纸',
      'bmp': '设计图纸',
      'txt': '操作规程',
      'rtf': '操作规程',
      'zip': '其他文档',
      'rar': '其他文档',
      '7z': '其他文档'
    }
    return typeMap[extension] || '其他文档'
  },



  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // 获取文件图标
  getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase()
    const fileTypeInfo = this.data.supportedFileTypes[extension]
    return fileTypeInfo ? fileTypeInfo.icon : 'documents'
  },

  // 确保文件名使用UTF-8编码
  ensureUTF8Encoding(fileName) {
    if (!fileName) return '';
    
    try {
      // 方法1: 使用TextEncoder/TextDecoder确保UTF-8编码
      const encoder = new TextEncoder();
      const encodedBytes = encoder.encode(fileName);
      const decodedString = new TextDecoder('utf-8').decode(encodedBytes);
      
      // 方法2: 如果文件名包含编码字符，尝试解码
      let processedFileName = decodedString;
      if (fileName.includes('%') || fileName.includes('\\u')) {
        try {
          processedFileName = decodeURIComponent(fileName);
        } catch (e) {
          try {
            processedFileName = unescape(fileName);
          } catch (e2) {
            console.log('文件名解码失败，使用编码后的文件名');
          }
        }
      }
      
      // 方法3: 清理文件名中的特殊字符
      const cleanFileName = processedFileName.replace(/[<>:"/\\|?*]/g, '_');
      
      console.log('文件名编码处理:', {
        original: fileName,
        encoded: decodedString,
        decoded: processedFileName,
        cleaned: cleanFileName
      });
      
      return cleanFileName;
    } catch (e) {
      console.error('文件名编码处理失败:', e);
      // 如果所有方法都失败，返回清理后的原始文件名
      return fileName.replace(/[<>:"/\\|?*]/g, '_');
    }
  },

  // 通知首页刷新活动数据
  notifyHomePageRefresh() {
    try {
      // 获取页面栈
      const pages = getCurrentPages()
      console.log('当前页面栈:', pages.map(p => p.route))
      
      // 查找首页 - 支持多种路径格式
      const homePage = pages.find(page => {
        const route = page.route
        return route === 'pages/index/index' || 
               route === '/pages/index/index' ||
               route.endsWith('pages/index/index')
      })
      
      if (homePage) {
        console.log('找到首页，通知刷新活动数据')
        // 调用首页的刷新方法
        if (typeof homePage.loadRecentActivities === 'function') {
          homePage.loadRecentActivities(true)
          console.log('已通知首页刷新活动数据')
        }
        
        // 同时刷新统计数据
        if (typeof homePage.loadStats === 'function') {
          homePage.loadStats()
          console.log('已通知首页刷新统计数据')
        }
      } else {
        console.log('未找到首页，无法通知刷新')
        // 如果找不到首页，使用全局事件通知
        this.notifyHomePageViaEvent()
      }
    } catch (error) {
      console.error('通知首页刷新失败:', error)
      // 如果页面栈方式失败，尝试事件通知
      this.notifyHomePageViaEvent()
    }
  },

  // 通过全局事件通知首页刷新
  notifyHomePageViaEvent() {
    try {
      // 使用微信小程序的全局事件机制
      wx.$emit && wx.$emit('refreshHomePage')
      
      // 或者使用本地存储标记，让首页在onShow时检查
      wx.setStorageSync('needRefreshHomePage', true)
      console.log('已设置首页刷新标记')
    } catch (error) {
      console.error('事件通知失败:', error)
    }
  }

})