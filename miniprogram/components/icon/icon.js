// components/icon/icon.js
Component({
  properties: {
    name: {
      type: String,
      value: ''
    },
    size: {
      type: Number,
      value: 24
    },
    color: {
      type: String,
      value: '#1E3A68'
    }
  },

  data: {
    iconPath: ''
  },

  observers: {
    'name': function(name) {
      this.setIconPath(name)
    }
  },

  methods: {
    setIconPath(name) {
      const iconMap = {
        'home': '/images/icons/home.svg',
        'home-active': '/images/icons/home-active.svg',
        'documents': '/images/icons/documents.svg',
        'documents-active': '/images/icons/documents-active.svg',
        'forms': '/images/icons/forms.svg',
        'forms-active': '/images/icons/forms-active.svg',
        'profile': '/images/icons/profile.svg',
        'profile-active': '/images/icons/profile-active.svg',
        'document-center': '/images/icons/document-center.svg',
        'records': '/images/icons/records.svg',
        'user-management': '/images/icons/user-management.svg',
        'statistics': '/images/icons/statistics.svg',
        'form-fill': '/images/icons/form-fill.svg',
        'success': '/images/icons/success.svg',
        'warning': '/images/icons/warning.svg',
        'error': '/images/icons/error.svg',
        'customer-service': '/images/icons/customer-service.svg',
        'question': '/images/icons/question.svg',
        'setting': '/images/icons/setting.svg',
        'share': '/images/icons/share.svg',
        // 新增文件上传相关图标
        'file': '/images/icons/document.svg',
        'image': '/images/icons/image.svg',
        'video': '/images/icons/video.svg',
        'audio': '/images/icons/audio.svg',
        'upload': '/images/icons/upload.svg',
        'drag': '/images/icons/drag.svg',
        'spreadsheet': '/images/icons/spreadsheet.svg',
        'document': '/images/icons/document.svg',
        'text': '/images/icons/text.svg',
        'textarea': '/images/icons/textarea.svg',
        'number': '/images/icons/number.svg',
        'select': '/images/icons/select.svg',
        'radio': '/images/icons/radio.svg',
        'checkbox': '/images/icons/checkbox.svg',
        'date': '/images/icons/date.svg'
      }
      
      this.setData({
        iconPath: iconMap[name] || ''
      })
    }
  }
})
