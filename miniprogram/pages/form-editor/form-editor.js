// pages/form-editor/form-editor.js
Page({
  data: {
    mode: 'edit', // 只支持编辑模式
    formId: '',
    formData: {
      title: '',
      description: '',
      type: 'survey',
      fields: [],
      settings: {
        allowAnonymous: false,
        requireLogin: true,
        allowMultiple: false,
        showProgress: true,
        autoSave: true
      }
    },
    fieldTypes: [
      { value: 'text', label: '单行文本', icon: 'edit' },
      { value: 'textarea', label: '多行文本', icon: 'document' },
      { value: 'number', label: '数字', icon: 'calculator' },
      { value: 'email', label: '邮箱', icon: 'mail' },
      { value: 'phone', label: '手机号', icon: 'phone' },
      { value: 'date', label: '日期', icon: 'calendar' },
      { value: 'time', label: '时间', icon: 'clock' },
      { value: 'select', label: '下拉选择', icon: 'list' },
      { value: 'radio', label: '单选', icon: 'radio' },
      { value: 'checkbox', label: '多选', icon: 'checkbox' },
      { value: 'rating', label: '评分', icon: 'star' },
      { value: 'file', label: '文件上传', icon: 'upload' }
    ],
    formTypes: [
      { value: 'survey', label: '问卷调查', icon: 'survey' },
      { value: 'registration', label: '报名登记', icon: 'registration' },
      { value: 'feedback', label: '意见反馈', icon: 'feedback' },
      { value: 'application', label: '申请表单', icon: 'application' },
      { value: 'order', label: '订单表单', icon: 'order' },
      { value: 'custom', label: '自定义', icon: 'form-fill' }
    ],
    showFieldEditor: false,
    editingField: null,
    editingFieldIndex: -1,
    showPreview: false,
    saving: false
  },

  onLoad(options) {
    // 只支持编辑模式
    this.setData({ mode: 'edit' })
    
    if (options.id) {
      this.setData({ formId: options.id })
      this.loadFormData()
    }
    
    if (options.template) {
      this.loadTemplate(options.template)
    }
    
    // 预处理表单类型索引
    this.updateFormTypeIndex()
  },

  // 更新表单类型索引
  updateFormTypeIndex() {
    const { formTypes, formData } = this.data
    const typeIndex = formTypes.findIndex(t => t.value === formData.type)
    this.setData({
      'formTypeIndex': typeIndex
    })
  },

  // 更新字段类型信息
  updateFieldTypeInfo() {
    const { fieldTypes, formData } = this.data
    const fieldsWithTypeInfo = formData.fields.map(field => {
      const typeInfo = fieldTypes.find(t => t.value === field.type)
      return {
        ...field,
        typeInfo: typeInfo || { label: '未知类型', icon: 'help' }
      }
    })
    
    this.setData({
      'formData.fields': fieldsWithTypeInfo
    })
  },

  // 检查字段是否需要选项
  isFieldWithOptions(fieldType) {
    return fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox'
  },

  // 获取字段占位符文本
  getFieldPlaceholder(field) {
    return field.placeholder || this.getDefaultPlaceholder(field.type)
  },

  // 获取默认占位符文本
  getDefaultPlaceholder(fieldType) {
    const placeholders = {
      'text': '请输入',
      'textarea': '请输入',
      'select': '请选择',
      'rating': '请评分',
      'file': '请选择文件'
    }
    return placeholders[fieldType] || '请输入'
  },

  // 加载表单数据
  loadFormData() {
    // 模拟API调用
    setTimeout(() => {
      const mockFormData = {
        title: '员工满意度调查',
        description: '年度员工满意度调查问卷，收集员工对公司各方面的意见和建议',
        type: 'survey',
        fields: [
          {
            id: 'field_001',
            type: 'text',
            label: '姓名',
            required: true,
            placeholder: '请输入您的姓名',
            validation: { minLength: 2, maxLength: 20 }
          },
          {
            id: 'field_002',
            type: 'select',
            label: '部门',
            required: true,
            options: ['技术部', '市场部', '人事部', '财务部', '其他'],
            placeholder: '请选择您的部门'
          },
          {
            id: 'field_003',
            type: 'rating',
            label: '工作环境满意度',
            required: true,
            maxRating: 5,
            description: '请对工作环境进行评分'
          }
        ],
        settings: {
          allowAnonymous: false,
          requireLogin: true,
          allowMultiple: false,
          showProgress: true,
          autoSave: true
        }
      }
      
      this.setData({
        formData: mockFormData
      })
      
      // 更新预处理信息
      this.updateFormTypeIndex()
      this.updateFieldTypeInfo()
    }, 1000)
  },

  // 加载模板
  loadTemplate(templateId) {
    // 模拟API调用加载模板
    setTimeout(() => {
      const mockTemplate = {
        title: '客户反馈收集模板',
        description: '专业的客户反馈收集表单',
        type: 'feedback',
        fields: [
          {
            id: 'field_001',
            type: 'text',
            label: '客户姓名',
            required: true,
            placeholder: '请输入客户姓名'
          },
          {
            id: 'field_002',
            type: 'email',
            label: '联系邮箱',
            required: true,
            placeholder: '请输入联系邮箱'
          },
          {
            id: 'field_003',
            type: 'textarea',
            label: '反馈内容',
            required: true,
            placeholder: '请详细描述您的反馈意见'
          }
        ]
      }
      
      this.setData({
        formData: { ...this.data.formData, ...mockTemplate }
      })
      
      // 更新预处理信息
      this.updateFormTypeIndex()
      this.updateFieldTypeInfo()
    }, 500)
  },

  // 表单标题输入
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  // 表单描述输入
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },

  // 表单类型选择
  onTypeChange(e) {
    const index = e.detail.value
    const selectedType = this.data.formTypes[index]
    this.setData({
      'formData.type': selectedType.value,
      'formTypeIndex': index
    })
  },

  // 添加字段
  addField(e) {
    const fieldType = e.currentTarget.dataset.type
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `新${this.getFieldTypeLabel(fieldType)}`,
      required: false,
      placeholder: '',
      options: fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' ? ['选项1', '选项2'] : [],
      validation: {}
    }
    
    const fields = [...this.data.formData.fields, newField]
    this.setData({
      'formData.fields': fields
    })
    
    // 更新字段类型信息
    this.updateFieldTypeInfo()
  },

  // 编辑字段
  editField(e) {
    const index = e.currentTarget.dataset.index
    const field = this.data.formData.fields[index]
    
    // 预处理字段信息
    const needsOptions = this.isFieldWithOptions(field.type)
    const optionsText = field.options ? field.options.join('\n') : ''
    
    this.setData({
      editingField: { ...field, optionsText },
      editingFieldIndex: index,
      showFieldEditor: true,
      editingFieldNeedsOptions: needsOptions
    })
  },

  // 删除字段
  deleteField(e) {
    const index = e.currentTarget.dataset.index
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个字段吗？',
      success: (res) => {
        if (res.confirm) {
          const fields = [...this.data.formData.fields]
          fields.splice(index, 1)
          this.setData({
            'formData.fields': fields
          })
          
          // 更新字段类型信息
          this.updateFieldTypeInfo()
        }
      }
    })
  },

  // 移动字段
  moveField(e) {
    const { index, direction } = e.currentTarget.dataset
    const fields = [...this.data.formData.fields]
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]]
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]]
    }
    
    this.setData({
      'formData.fields': fields
    })
    
    // 更新字段类型信息
    this.updateFieldTypeInfo()
  },

  // 保存字段编辑
  saveFieldEdit() {
    const { editingField, editingFieldIndex, formData } = this.data
    const fields = [...formData.fields]
    
    if (editingFieldIndex > -1) {
      fields[editingFieldIndex] = editingField
    }
    
    this.setData({
      'formData.fields': fields,
      showFieldEditor: false,
      editingField: null,
      editingFieldIndex: -1
    })
    
    // 更新字段类型信息
    this.updateFieldTypeInfo()
  },

  // 取消字段编辑
  cancelFieldEdit() {
    this.setData({
      showFieldEditor: false,
      editingField: null,
      editingFieldIndex: -1
    })
  },

  // 字段设置更新
  onFieldSettingChange(e) {
    const { field, setting } = e.currentTarget.dataset
    const value = e.detail.value
    const editingField = { ...this.data.editingField }
    
    if (setting === 'label') {
      editingField.label = value
    } else if (setting === 'required') {
      editingField.required = e.detail.checked
    } else if (setting === 'placeholder') {
      editingField.placeholder = value
    } else if (setting === 'options') {
      editingField.options = value.split('\n').filter(opt => opt.trim())
    }
    
    this.setData({
      editingField
    })
  },

  // 切换设置
  toggleSetting(e) {
    const setting = e.currentTarget.dataset.setting
    this.setData({
      [`formData.settings.${setting}`]: !this.data.formData.settings[setting]
    })
  },

  // 预览表单
  previewForm() {
    // 预处理预览数据
    const fieldsWithPlaceholders = this.data.formData.fields.map(field => ({
      ...field,
      displayPlaceholder: this.getFieldPlaceholder(field)
    }))
    
    this.setData({ 
      showPreview: true,
      'previewFields': fieldsWithPlaceholders
    })
  },

  // 关闭预览
  closePreview() {
    this.setData({ showPreview: false })
  },

  // 保存表单
  saveForm() {
    if (!this.validateForm()) {
      return
    }
    
    this.setData({ saving: true })
    
    // 模拟API调用
    setTimeout(() => {
      this.setData({ saving: false })
      
      wx.showToast({
        title: '表单保存成功',
        icon: 'success'
      })
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }, 2000)
  },

  // 发布表单
  publishForm() {
    if (!this.validateForm()) {
      return
    }
    
    wx.showModal({
      title: '确认发布',
      content: '发布后表单将对外可见，确定要发布吗？',
      success: (res) => {
        if (res.confirm) {
          this.saveForm()
        }
      }
    })
  },

  // 验证表单
  validateForm() {
    if (!this.data.formData.title.trim()) {
      wx.showToast({
        title: '请输入表单标题',
        icon: 'none'
      })
      return false
    }
    
    if (this.data.formData.fields.length === 0) {
      wx.showToast({
        title: '请至少添加一个字段',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 获取字段类型标签
  getFieldTypeLabel(type) {
    const fieldType = this.data.fieldTypes.find(ft => ft.value === type)
    return fieldType ? fieldType.label : '字段'
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})
