// pages/documents/documents.js
Page({
  data: {
    userInfo: null,
    documents: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20,
    
    // 视图模式
    viewMode: 'grid', // list, grid, detail
    simplifyMode: true,
    
    // 搜索和筛选
    keyword: '',
    searchSuggestions: [],
    selectedType: '',
    selectedCategory: 'all',
    sortBy: 'uploadedAt',
    sortOrder: 'desc',
    sortText: '最近更新',
    
    // 高级筛选
    showFilterPanel: false,
    showSortMenu: false,
    selectedTimeRange: '',
    selectedSize: '',
    selectedUploaderIndex: -1,
    selectedUploaderName: '',
    activeFilters: [],
    
    // 批量选择
    isSelectionMode: false,
    selectedDocuments: [],
    

    
    // 筛选选项
    documentTypes: [
      { label: '全部类型', value: '' },
      { label: '技术文档', value: '技术文档' },
      { label: '设计图纸', value: '设计图纸' },
      { label: '操作规程', value: '操作规程' },
      { label: '质量手册', value: '质量手册' },
      { label: '安全规范', value: '安全规范' },
      { label: '报告分析', value: '报告分析' }
    ],
    
    timeRanges: [
      { label: '全部时间', value: '' },
      { label: '今天', value: 'today' },
      { label: '本周', value: 'week' },
      { label: '本月', value: 'month' },
      { label: '今年', value: 'year' }
    ],
    
    fileSizes: [
      { label: '全部大小', value: '' },
      { label: '小于1MB', value: 'small' },
      { label: '1-10MB', value: 'medium' },
      { label: '大于10MB', value: 'large' }
    ],
    
    uploaders: []
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    if (this.data.userInfo) {
      // 重置加载状态和页码
      this.setData({ 
        loading: false,
        page: 1,
        documents: []
      })
      this.loadDocuments()
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
    this.loadDocuments()
  },

  // 加载文档列表
  async loadDocuments() {
    this.setData({ loading: true })
    
    // 设置超时机制，防止加载状态一直卡住
    const timeoutId = setTimeout(() => {
      this.setData({ loading: false })
      wx.showToast({
        title: '加载超时，请重试',
        icon: 'none'
      })
    }, 10000) // 10秒超时
    
    try {
      // 将中文分类转换为英文标识符用于查询
      const categoryMap = {
        '技术文档': 'technical',
        '设计图纸': 'design', 
        '操作规程': 'operation',
        '质量手册': 'quality',
        '安全规范': 'safety',
        '报告分析': 'report'
      }
      
      const queryCategory = this.data.selectedCategory === 'all' ? 'all' : 
        (categoryMap[this.data.selectedCategory] || this.data.selectedCategory)
      
      const requestData = {
        userId: this.data.userInfo.userId,
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.keyword,
        type: this.data.selectedType,
        category: queryCategory,
        sortBy: this.data.sortBy,
        sortOrder: this.data.sortOrder
      }
      
      console.log('文档查询参数:', { 
        selectedCategory: this.data.selectedCategory, 
        queryCategory: queryCategory,
        requestData 
      })
      
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getDocuments',
          data: requestData
        }
      })

      // 清除超时定时器
      clearTimeout(timeoutId)

      if (result.result && result.result.success) {
        const newDocuments = result.result.data.documents || []
        const hasMore = newDocuments.length === this.data.pageSize
        
        // 修复文件名编码问题并进行本地化处理
        const fixedDocuments = newDocuments.map(doc => {
          // 文件名编码修复
          if (doc.originalFileName) {
            try {
              let decodedName = doc.originalFileName
              try {
                decodedName = decodeURIComponent(doc.originalFileName)
              } catch (e) {
                try {
                  decodedName = unescape(doc.originalFileName)
                } catch (e2) {
                  console.log('文件名解码失败，使用原始名称:', doc.originalFileName)
                }
              }
              doc.originalFileName = decodedName
            } catch (e) {
              console.log('文件名编码处理失败:', e.message)
            }
          }
          
          // 标题编码修复
          if (doc.title) {
            try {
              let decodedTitle = doc.title
              try {
                decodedTitle = decodeURIComponent(doc.title)
              } catch (e) {
                try {
                  decodedTitle = unescape(doc.title)
                } catch (e2) {
                  console.log('标题解码失败，使用原始标题:', doc.title)
                }
              }
              doc.title = decodedTitle
            } catch (e) {
              console.log('标题编码处理失败:', e.message)
            }
          }
          
          // 本地化处理：将英文标识符转换为中文显示
          if (doc.type) {
            doc.displayType = this.localizeDocumentType(doc.type)
          }
          
          if (doc.category) {
            doc.displayCategory = this.localizeDocumentCategory(doc.category)
          }
          
          // 格式化文件大小显示
          if (doc.fileSize) {
            doc.displayFileSize = this.formatFileSize(doc.fileSize)
          }
          
          // 格式化时间显示
          if (doc.uploadedAt) {
            doc.displayUploadTime = this.formatUploadTime(doc.uploadedAt)
          }
          
          return doc
        })
        
        console.log('文档加载成功，数量:', fixedDocuments.length)
        console.log('修复后的文档数据:', fixedDocuments)
        
        this.setData({
          documents: this.data.page === 1 ? fixedDocuments : [...this.data.documents, ...fixedDocuments],
          hasMore,
          loading: false
        })
      } else {
        console.error('文档加载失败:', result.result)
        this.setData({ loading: false })
        // 显示错误提示
        wx.showToast({
          title: result.result?.error || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      // 清除超时定时器
      clearTimeout(timeoutId)
      
      this.setData({ loading: false })
      // 不显示错误提示，静默处理
    }
  },

  // 本地化文档类型
  localizeDocumentType(type) {
    const typeMap = {
      'technical': '技术文档',
      'design': '设计图纸',
      'operation': '操作规程',
      'quality': '质量手册',
      'safety': '安全规范',
      'report': '报告分析',
      'Technical Document': '技术文档',
      'Design Drawing': '设计图纸',
      'Operation Manual': '操作规程',
      'Quality Manual': '质量手册',
      'Safety Standard': '安全规范',
      'Analysis Report': '报告分析'
    }
    return typeMap[type] || type
  },

  // 本地化文档分类
  localizeDocumentCategory(category) {
    const categoryMap = {
      'technical': '技术文档',
      'design': '设计图纸',
      'operation': '操作规程',
      'quality': '质量手册',
      'safety': '安全规范',
      'report': '报告分析',
      // 反向映射，支持中文分类
      '技术文档': '技术文档',
      '设计图纸': '设计图纸',
      '操作规程': '操作规程',
      '质量手册': '质量手册',
      '安全规范': '安全规范',
      '报告分析': '报告分析'
    }
    return categoryMap[category] || category
  },

  // 格式化文件大小
  formatFileSize(size) {
    if (typeof size === 'string') {
      // 如果已经是格式化的字符串，直接返回
      if (size.includes('KB') || size.includes('MB') || size.includes('GB')) {
        return size
      }
      // 尝试解析数字
      const numSize = parseFloat(size)
      if (isNaN(numSize)) return size
      size = numSize
    }
    
    if (typeof size === 'number') {
      if (size < 1024) {
        return size + ' B'
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + ' KB'
      } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(1) + ' MB'
      } else {
        return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
      }
    }
    
    return size
  },

  // 格式化上传时间
  formatUploadTime(time) {
    if (!time) return ''
    
    try {
      const date = new Date(time)
      if (isNaN(date.getTime())) return time
      
      const now = new Date()
      const diff = now - date
      const oneDay = 24 * 60 * 60 * 1000
      const oneWeek = 7 * oneDay
      const oneMonth = 30 * oneDay
      
      if (diff < oneDay) {
        // 今天显示具体时间（24小时制）
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `今天 ${hours}:${minutes}`
      } else if (diff < oneWeek) {
        const days = Math.floor(diff / oneDay)
        return `${days}天前`
      } else if (diff < oneMonth) {
        const weeks = Math.floor(diff / oneWeek)
        return `${weeks}周前`
      } else {
        // 超过一个月显示完整日期（24小时制）
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
      }
    } catch (e) {
      return time
    }
  },

  // 视图模式切换
  onViewModeChange(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ viewMode: mode })
  },

  // 简化模式切换
  toggleSimplify() {
    this.setData({ simplifyMode: !this.data.simplifyMode })
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    
    // 防抖搜索
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.setData({ page: 1 })
      this.loadDocuments()
    }, 500)
  },

  // 选择搜索建议
  onSelectSuggestion(e) {
    const suggestion = e.currentTarget.dataset.suggestion
    this.setData({ 
      keyword: suggestion,
      searchSuggestions: [],
      page: 1
    })
    this.loadDocuments()
  },

  // 类型筛选
  onTypeChange(e) {
    const index = e.detail.value
    const selectedType = this.data.documentTypes[index].value
    this.setData({ 
      selectedType,
      page: 1
    })
    this.loadDocuments()
  },

  // 分类切换
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    console.log('分类切换:', category)
    
    // 将中文分类转换为英文标识符用于查询
    const categoryMap = {
      '技术文档': 'technical',
      '设计图纸': 'design', 
      '操作规程': 'operation',
      '质量手册': 'quality',
      '安全规范': 'safety',
      '报告分析': 'report'
    }
    
    const queryCategory = category === 'all' ? 'all' : (categoryMap[category] || category)
    
    this.setData({ 
      selectedCategory: category, // 保持中文用于显示
      page: 1
    })
    console.log('当前选中的分类:', { display: category, query: queryCategory })
    this.loadDocuments()
  },

  // 排序切换
  onSortChange(e) {
    const value = e.currentTarget.dataset.value
    const [sortBy, sortOrder] = value.split('-')
    
    const sortTextMap = {
      'uploadedAt-desc': '最近更新',
      'uploadedAt-asc': '最早上传',
      'title-asc': '按名称排序',
      'fileSize-desc': '按大小排序',
      'downloadCount-desc': '按下载量排序'
    }
    
    this.setData({ 
      sortBy,
      sortOrder,
      sortText: sortTextMap[value] || '最近更新',
      showSortMenu: false,
      page: 1
    })
    this.loadDocuments()
  },

  // 切换排序菜单
  toggleSortMenu() {
    this.setData({ 
      showSortMenu: !this.data.showSortMenu,
      showFilterPanel: false
    })
  },

  // 切换筛选面板
  toggleFilterPanel() {
    this.setData({ 
      showFilterPanel: !this.data.showFilterPanel,
      showSortMenu: false
    })
  },

  // 时间范围筛选
  onTimeRangeChange(e) {
    const index = e.detail.value
    const selectedTimeRange = this.data.timeRanges[index].label
    this.setData({ selectedTimeRange })
  },

  // 文件大小筛选
  onSizeChange(e) {
    const index = e.detail.value
    const selectedSize = this.data.fileSizes[index].label
    this.setData({ selectedSize })
  },

  // 上传者筛选
  onUploaderChange(e) {
    const index = e.detail.value
    const selectedUploaderName = this.data.uploaders[index].name
    this.setData({ 
      selectedUploaderIndex: index,
      selectedUploaderName
    })
  },

  // 应用筛选
  applyFilters() {
    this.setData({ 
      showFilterPanel: false,
      page: 1
    })
    this.loadDocuments()
  },

  // 移除筛选条件
  removeFilter(e) {
    const key = e.currentTarget.dataset.key
    const activeFilters = this.data.activeFilters.filter(f => f.key !== key)
    this.setData({ activeFilters })
  },

  // 清除所有筛选
  clearAllFilters() {
    this.setData({ 
      activeFilters: [],
      selectedType: '',
      selectedTimeRange: '',
      selectedSize: '',
      selectedUploaderIndex: -1,
      selectedUploaderName: '',
      page: 1
    })
    this.loadDocuments()
  },

  // 切换选择模式
  toggleSelectionMode() {
    this.setData({ 
      isSelectionMode: !this.data.isSelectionMode,
      selectedDocuments: []
    })
  },

  // 切换全选
  toggleSelectAll() {
    if (this.data.selectedDocuments.length === this.data.documents.length) {
      this.setData({ selectedDocuments: [] })
    } else {
      const selectedDocuments = this.data.documents.map(doc => doc._id)
      this.setData({ selectedDocuments })
    }
  },

  // 批量下载
  async batchDownload() {
    if (this.data.selectedDocuments.length === 0) {
      wx.showToast({
        title: '请选择要下载的文档',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '下载中...' })
    
    try {
      // 这里实现批量下载逻辑
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      wx.hideLoading()
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      })
      
      this.setData({ 
        isSelectionMode: false,
        selectedDocuments: []
      })
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '下载失败',
        icon: 'none'
      })
    }
  },

  // 文档点击 - 直接预览，跳过中间页面
  onDocumentTap(e) {
    const id = e.currentTarget.dataset.id
    // 直接调用预览函数，跳过中间页面
    this.onPreview(e)
  },

  // 收藏文档
  onFavoriteDocument(e) {
    const id = e.currentTarget.dataset.id
    // 实现收藏逻辑
    wx.showToast({
      title: '收藏成功',
      icon: 'success'
    })
  },

  // 分享文档
  onShareDocument(e) {
    const id = e.currentTarget.dataset.id
    // 实现分享逻辑
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    })
  },

  // 预览文档
  async onPreview(e) {
    const id = e.currentTarget.dataset.id
    const document = this.data.documents.find(doc => doc._id === id)
    
    if (!document) {
      wx.showToast({
        title: '文档不存在',
        icon: 'none'
      })
      return
    }

    // 修复文件名编码
    let fixedTitle = document.title
    let fixedOriginalFileName = document.originalFileName
    
    try {
      // 使用完善的UTF-8解码方法
      if (document.title) {
        fixedTitle = this.decodeUTF8String(document.title)
      }
      
      if (document.originalFileName) {
        fixedOriginalFileName = this.decodeUTF8String(document.originalFileName)
      }
      
      console.log('预览文件名编码修复:', {
        title: { original: document.title, fixed: fixedTitle },
        originalFileName: { original: document.originalFileName, fixed: fixedOriginalFileName }
      })
    } catch (e) {
      console.log('文件名编码修复失败:', e.message)
    }

    try {
      wx.showLoading({
        title: '准备预览...',
        mask: true
      })

      // 调用云函数获取预览信息
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'previewDocument',
          data: {
            docId: id,
            userId: this.data.userInfo.userId
          }
        }
      })

      if (result.result && result.result.success) {
        const previewData = result.result.data
        
        console.log('预览数据:', previewData)
        console.log('tempFileURL:', previewData.tempFileURL)
        console.log('filePath:', previewData.filePath)
        
        // 根据文件类型选择预览方式
        const fileExtension = document.fileExtension ? document.fileExtension.toLowerCase() : ''
        
        console.log('文件扩展名:', fileExtension)
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension)) {
          // 图片文件直接预览
          console.log('使用图片预览:', previewData.tempFileURL)
          wx.previewImage({
            urls: [previewData.tempFileURL],
            current: previewData.tempFileURL,
            success: () => {
              wx.hideLoading()
            },
            fail: (err) => {
              wx.hideLoading()
              wx.showToast({
                title: '图片预览失败',
                icon: 'none'
              })
              console.error('图片预览失败:', err)
            }
          })
        } else if (fileExtension === 'pdf') {
          // PDF文件使用微信内置预览
          console.log('使用PDF预览:', previewData.tempFileURL)
          
          // 先下载文件到本地，再预览
          wx.downloadFile({
            url: previewData.tempFileURL,
            success: (downloadRes) => {
              console.log('PDF下载成功:', downloadRes)
              
              // 使用wx.getFileSystemManager().saveFile保存文件并指定正确的文件名
              const fileName = fixedOriginalFileName || fixedTitle || 'document'
              // 移除重复的文件扩展名
              const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
              
              console.log('准备保存PDF文件，文件名:', cleanFileName)
              
              // 使用文件系统管理器保存文件
              const fileSystemManager = wx.getFileSystemManager()
              fileSystemManager.saveFile({
                tempFilePath: downloadRes.tempFilePath,
                filePath: `${wx.env.USER_DATA_PATH}/${cleanFileName}`,
                success: (saveRes) => {
                  console.log('PDF文件保存成功:', saveRes)
                  
                  // 使用保存后的文件路径进行预览
                  wx.openDocument({
                    filePath: saveRes.savedFilePath,
                    fileType: 'pdf',
                    success: () => {
                      wx.hideLoading()
                      console.log('PDF预览成功，使用正确文件名:', cleanFileName)
                    },
                    fail: (err) => {
                      wx.hideLoading()
                      wx.showToast({
                        title: 'PDF预览失败',
                        icon: 'none'
                      })
                      console.error('PDF预览失败:', err)
                    }
                  })
                },
                fail: (saveErr) => {
                  console.error('PDF文件保存失败:', saveErr)
                  // 如果保存失败，使用临时文件路径预览
                  wx.openDocument({
                    filePath: downloadRes.tempFilePath,
                    fileType: 'pdf',
                    success: () => {
                      wx.hideLoading()
                    },
                    fail: (err) => {
                      wx.hideLoading()
                      wx.showToast({
                        title: 'PDF预览失败',
                        icon: 'none'
                      })
                      console.error('PDF预览失败:', err)
                    }
                  })
                }
              })
            },
            fail: (err) => {
              wx.hideLoading()
              wx.showToast({
                title: 'PDF下载失败',
                icon: 'none'
              })
              console.error('PDF下载失败:', err)
            }
          })
        } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
          // Office文档使用微信内置预览
          console.log('使用Office文档预览:', previewData.tempFileURL)
          
          // 先下载文件到本地，再预览
          wx.downloadFile({
            url: previewData.tempFileURL,
            success: (downloadRes) => {
              console.log('Office文档下载成功:', downloadRes)
              
              // 使用wx.getFileSystemManager().saveFile保存文件并指定正确的文件名
              const fileName = fixedOriginalFileName || fixedTitle || 'document'
              const fileExt = previewData.fileExtension || 'docx'
              // 移除重复的文件扩展名
              const cleanFileName = fileName.endsWith(`.${fileExt}`) ? fileName : `${fileName}.${fileExt}`
              
              console.log('准备保存Office文档，文件名:', cleanFileName)
              
              // 使用文件系统管理器保存文件
              const fileSystemManager = wx.getFileSystemManager()
              fileSystemManager.saveFile({
                tempFilePath: downloadRes.tempFilePath,
                filePath: `${wx.env.USER_DATA_PATH}/${cleanFileName}`,
                success: (saveRes) => {
                  console.log('Office文档保存成功:', saveRes)
                  
                  // 使用保存后的文件路径进行预览
                  wx.openDocument({
                    filePath: saveRes.savedFilePath,
                    fileType: fileExt,
                    success: () => {
                      wx.hideLoading()
                      console.log('Office文档预览成功，使用正确文件名:', cleanFileName)
                    },
                    fail: (err) => {
                      wx.hideLoading()
                      wx.showToast({
                        title: '文档预览失败',
                        icon: 'none'
                      })
                      console.error('Office文档预览失败:', err)
                    }
                  })
                },
                fail: (saveErr) => {
                  console.error('Office文档保存失败:', saveErr)
                  // 如果保存失败，使用临时文件路径预览
                  wx.openDocument({
                    filePath: downloadRes.tempFilePath,
                    fileType: fileExt,
                    success: () => {
                      wx.hideLoading()
                    },
                    fail: (err) => {
                      wx.hideLoading()
                      wx.showToast({
                        title: '文档预览失败',
                        icon: 'none'
                      })
                      console.error('文档预览失败:', err)
                    }
                  })
                }
              })
            },
            fail: (err) => {
              wx.hideLoading()
              wx.showToast({
                title: '文档下载失败',
                icon: 'none'
              })
              console.error('文档下载失败:', err)
            }
          })
        } else if (['txt', 'rtf'].includes(fileExtension)) {
          // 文本文件使用微信内置预览
          console.log('使用文本文件预览:', previewData.tempFileURL)
          
          // 先下载文件到本地，再预览
          wx.downloadFile({
            url: previewData.tempFileURL,
            success: (downloadRes) => {
              console.log('文本文件下载成功:', downloadRes)
              wx.openDocument({
                filePath: downloadRes.tempFilePath,
                fileType: 'text',
                success: () => {
                  wx.hideLoading()
                },
                fail: (err) => {
                  wx.hideLoading()
                  wx.showToast({
                    title: '文本预览失败',
                    icon: 'none'
                  })
                  console.error('文本预览失败:', err)
                }
              })
            },
            fail: (err) => {
              wx.hideLoading()
              wx.showToast({
                title: '文本下载失败',
                icon: 'none'
              })
              console.error('文本下载失败:', err)
            }
          })
        } else {
          // 其他文件类型提示下载
          console.log('不支持预览的文件类型:', fileExtension)
          wx.hideLoading()
          wx.showModal({
            title: '无法预览',
            content: `此文件类型(${fileExtension})暂不支持预览，是否下载查看？`,
            confirmText: '下载',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                this.onDownload(e)
              }
            }
          })
        }
      } else {
        console.error('预览失败:', result.result)
        wx.hideLoading()
        wx.showToast({
          title: result.result?.error || '预览失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('预览文档失败:', error)
      wx.showToast({
        title: '预览失败',
        icon: 'none'
      })
    }
  },

  // 下载文档
  async onDownload(e) {
    const document = e.currentTarget.dataset.document
    console.log('开始下载文档:', document)
    
    if (!document || !document.filePath) {
      wx.showToast({
        title: '文档信息不完整',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '准备下载...'
    })

    try {
      // 修复文件名编码
      let fixedTitle = document.title
      let fixedOriginalFileName = document.originalFileName
      
      try {
        // 使用完善的UTF-8解码方法
        if (document.title) {
          fixedTitle = this.decodeUTF8String(document.title)
        }
        
        if (document.originalFileName) {
          fixedOriginalFileName = this.decodeUTF8String(document.originalFileName)
        }
        
        console.log('下载文件名编码修复:', {
          title: { original: document.title, fixed: fixedTitle },
          originalFileName: { original: document.originalFileName, fixed: fixedOriginalFileName }
        })
      } catch (e) {
        console.log('文件名编码修复失败:', e.message)
      }

      // 调用云函数获取下载信息
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'downloadDocument',
          data: {
            docId: document._id,
            userId: this.data.userInfo.userId
          }
        }
      })

      if (result.result && result.result.success) {
        const downloadData = result.result.data
        
        // 使用微信小程序下载文件
        wx.downloadFile({
          url: downloadData.tempFileURL,
          success: (res) => {
            if (res.statusCode === 200) {
              // 使用wx.getFileSystemManager().saveFile保存文件并指定正确的文件名
              const fileName = fixedOriginalFileName || fixedTitle || 'document'
              const fileExt = document.fileExtension || 'docx'
              // 移除重复的文件扩展名
              const cleanFileName = fileName.endsWith(`.${fileExt}`) ? fileName : `${fileName}.${fileExt}`
              
              console.log('准备保存下载文件，文件名:', cleanFileName)
              
              // 使用文件系统管理器保存文件
              const fileSystemManager = wx.getFileSystemManager()
              fileSystemManager.saveFile({
                tempFilePath: res.tempFilePath,
                filePath: `${wx.env.USER_DATA_PATH}/${cleanFileName}`,
                success: (saveRes) => {
                  wx.hideLoading()
                  wx.showToast({
                    title: '下载成功',
                    icon: 'success'
                  })
                  
                  // 记录下载成功
                  console.log('文件已保存到:', saveRes.savedFilePath, '文件名:', cleanFileName)
                },
                fail: (err) => {
                  wx.hideLoading()
                  wx.showToast({
                    title: '保存文件失败',
                    icon: 'none'
                  })
                  console.error('保存文件失败:', err)
                }
              })
            } else {
              wx.hideLoading()
              wx.showToast({
                title: '下载失败',
                icon: 'none'
              })
            }
          },
          fail: (err) => {
            wx.hideLoading()
            wx.showToast({
              title: '下载失败',
              icon: 'none'
            })
            console.error('下载文件失败:', err)
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: result.result?.error || '下载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
    console.error('下载文档失败:', error)
    wx.showToast({
        title: '下载失败',
      icon: 'none'
    })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ page: 1 })
    this.loadDocuments().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadDocuments()
    }
  },

  // 搜索相关方法
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword })
    this.generateSearchSuggestions(keyword)
  },

  clearSearch() {
    this.setData({ 
      keyword: '',
      searchSuggestions: []
    })
    this.loadDocuments()
  },

  onSearch() {
    this.setData({ page: 1 })
    this.loadDocuments()
  },

  onSelectSuggestion(e) {
    const suggestion = e.currentTarget.dataset.suggestion
    this.setData({ 
      keyword: suggestion,
      searchSuggestions: []
    })
    this.onSearch()
  },

  generateSearchSuggestions(keyword) {
    if (!keyword || keyword.length < 2) {
      this.setData({ searchSuggestions: [] })
      return
    }
    
    // 模拟搜索建议
    const suggestions = [
      `${keyword}技术文档`,
      `${keyword}操作规程`,
      `${keyword}设计图纸`,
      `${keyword}质量手册`
    ]
    this.setData({ searchSuggestions: suggestions })
  },

  // 上传文档功能
  onUploadDocument() {
    if (this.data.userInfo.role !== 'admin') {
      wx.showToast({
        title: '只有管理员可以上传文档',
        icon: 'none'
      })
      return
    }

    // 跳转到专门的上传页面
    wx.navigateTo({
      url: '/pages/admin/upload/upload'
    })
  },



  // 删除文档
  async onDelete(e) {
    const id = e.currentTarget.dataset.id
    const document = this.data.documents.find(doc => doc._id === id)
    
    if (!document) {
      wx.showToast({
        title: '文档不存在',
        icon: 'none'
      })
      return
    }

    // 确认删除
    wx.showModal({
      title: '确认删除',
      content: `确定要删除文档"${document.title}"吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#FF4D4F',
      success: async (res) => {
        if (res.confirm) {
          await this.deleteDocument(id)
        }
      }
    })
  },

  // 执行删除
  async deleteDocument(docId) {
    try {
      wx.showLoading({
        title: '删除中...',
        mask: true
      })

      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'deleteDocument',
          data: {
            docId: docId,
            userId: this.data.userInfo.userId
          }
        }
      })

      if (result.result && result.result.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        
        // 从列表中移除文档
        const documents = this.data.documents.filter(doc => doc._id !== docId)
        this.setData({ documents })
        
        // 通知首页刷新活动数据
        this.notifyHomePageRefresh()
      } else {
        wx.showToast({
          title: result.result?.error || '删除失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('删除文档失败:', error)
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },







  // 测试云函数编码

  // 解码UTF-8字符串
  decodeUTF8String(str) {
    if (!str) return str;
    try {
      // 尝试多种解码方式
      let decoded = decodeURIComponent(str);
      if (decoded === str) {
        decoded = unescape(str);
      }
      return decoded;
    } catch (e) {
      console.log('UTF-8解码失败，使用原始字符串:', str);
      return str;
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
        console.log('未找到首页，使用备用通知方式')
        // 如果找不到首页，使用全局事件通知
        this.notifyHomePageViaEvent()
      }
      
      // 无论是否找到首页，都设置刷新标记，确保下次进入首页时会刷新
      this.notifyHomePageViaEvent()
    } catch (error) {
      console.error('通知首页刷新失败:', error)
      // 如果页面栈方式失败，尝试事件通知
      this.notifyHomePageViaEvent()
    }
  },

  // 通过全局事件通知首页刷新
  notifyHomePageViaEvent() {
    try {
      // 使用本地存储标记，让首页在onShow时检查
      wx.setStorageSync('needRefreshHomePage', true)
      console.log('已设置首页刷新标记')
    } catch (error) {
      console.error('事件通知失败:', error)
    }
  }
})
