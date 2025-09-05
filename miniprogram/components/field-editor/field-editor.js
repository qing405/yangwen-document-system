// components/field-editor/field-editor.js
Component({
  properties: {
    field: {
      type: Object,
      value: null
    },
    fieldTypes: {
      type: Array,
      value: []
    }
  },

  data: {
    localField: null,
    showOptionsEditor: false
  },

  observers: {
    'field': function(field) {
      if (field) {
        this.setData({
          localField: { ...field }
        })
      }
    }
  },

  methods: {
    // 更新字段属性
    updateField(e) {
      const { property } = e.currentTarget.dataset
      const { value } = e.detail
      
      this.setData({
        [`localField.${property}`]: value
      })
    },

    // 切换必填状态
    toggleRequired() {
      this.setData({
        'localField.required': !this.data.localField.required
      })
    },

    // 添加选项
    addOption() {
      const options = [...this.data.localField.options]
      options.push(`选项${options.length + 1}`)
      
      this.setData({
        'localField.options': options
      })
    },

    // 更新选项
    updateOption(e) {
      const { index } = e.currentTarget.dataset
      const { value } = e.detail
      
      this.setData({
        [`localField.options[${index}]`]: value
      })
    },

    // 删除选项
    deleteOption(e) {
      const { index } = e.currentTarget.dataset
      const options = [...this.data.localField.options]
      options.splice(index, 1)
      
      this.setData({
        'localField.options': options
      })
    },

    // 更新评分最大值
    updateMaxRating(e) {
      const { value } = e.detail
      this.setData({
        'localField.maxRating': parseInt(value) || 5
      })
    },

    // 保存字段
    saveField() {
      if (!this.validateField()) {
        return
      }
      
      this.triggerEvent('save', {
        field: this.data.localField
      })
    },

    // 取消编辑
    cancelEdit() {
      this.triggerEvent('cancel')
    },

    // 验证字段
    validateField() {
      const { localField } = this.data
      
      if (!localField.label.trim()) {
        wx.showToast({
          title: '请输入字段标签',
          icon: 'none'
        })
        return false
      }
      
      if (!localField.placeholder.trim()) {
        wx.showToast({
          title: '请输入占位符',
          icon: 'none'
        })
        return false
      }
      
      if ((localField.type === 'select' || localField.type === 'radio' || localField.type === 'checkbox') && localField.options.length === 0) {
        wx.showToast({
          title: '请至少添加一个选项',
          icon: 'none'
        })
        return false
      }
      
      return true
    }
  }
})
