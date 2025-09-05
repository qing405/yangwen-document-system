// pages/collaborative-forms/collaborative-forms.js
const formDataManager = require('../../utils/formDataManager')

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    forms: [],
    showCreateModal: false,
    showDistributeModal: false,
    selectedForm: null,
    users: [],
    selectedUsers: [],
    formData: {
      title: '',
      description: '',
      documentUrl: '', // 文档链接
      documentName: '', // 文档名称
      documentType: '' // 文档类型
    },
    // 文档类型相关
    documentTypes: [
      { value: 'excel', label: 'Excel表格', icon: 'document-center' },
      { value: 'word', label: 'Word文档', icon: 'form-fill' },
      { value: 'pdf', label: 'PDF文档', icon: 'form-fill' }
    ],
    showFieldMapping: false,
    extractedFields: [], // 从文档中提取的字段
    // 计算属性
    currentDocumentTypeIndex: 0,
    currentDocumentType: null,
    // 用户选择状态
    userSelectionStatus: {},
    // 防止重复初始化的标志
    isInitializing: false,
    initRetryCount: 0,
    maxInitRetries: 3,
  },

  onLoad() {
    this.checkUserAuth();
    // 初始化计算属性
    this.updateComputedProperties();
    // 注册数据更新回调
    this.dataUpdateCallback = this.handleDataUpdate.bind(this);
    formDataManager.registerRefreshCallback(this.dataUpdateCallback);
  },

  onShow() {
    this.loadForms();
  },

  onUnload() {
    // 移除数据更新回调
    if (this.dataUpdateCallback) {
      formDataManager.unregisterRefreshCallback(this.dataUpdateCallback);
    }
  },

  // 处理数据更新
  handleDataUpdate(dataType, data) {
    // 处理数据更新
    switch (dataType) {
      case 'forms':
        this.setData({ forms: data });
        break;
      case 'form_created':
      case 'form_updated':
      case 'form_deleted':
        // 立即重新加载表单列表
        this.loadForms(true);
        break;
    }
  },

  // 检查用户权限
  async checkUserAuth() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          userInfo,
          isAdmin: userInfo.role === 'admin'
        });
      } else {
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    } catch (error) {
      console.error('检查用户权限失败:', error);
    }
  },

  // 加载表单列表
  async loadForms(forceRefresh = false, event = null) {
    // 如果是从按钮点击触发，获取force参数
    if (event && event.currentTarget) {
      forceRefresh = event.currentTarget.dataset.force === 'true' || forceRefresh;
    }
    try {
      wx.showLoading({ title: '加载中...' });
      
      console.log('开始加载表单列表...');
      console.log('用户ID:', this.data.userInfo?.workId);
      
      const forms = await formDataManager.getCollaborativeForms({
        creatorId: this.data.userInfo?.workId
      }, forceRefresh);

      this.setData({ forms });
      console.log('表单列表加载成功:', forms.length);
      console.log('表单数据详情:', forms);
    } catch (error) {
      console.error('加载表单列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 加载用户列表
  async loadUsers() {
    try {
      const users = await formDataManager.getUsers();
      this.setData({ users });
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  },

  // 更新计算属性
  updateComputedProperties() {
    const { documentTypes, currentDocumentTypeIndex } = this.data;
    const currentDocumentType = documentTypes[currentDocumentTypeIndex] || documentTypes[0];
    
    this.setData({
      currentDocumentType,
      currentDocumentTypeIndex: currentDocumentTypeIndex || 0
    });
  },

  // 显示创建表单模态框
  showCreateForm() {
    this.setData({
      showCreateModal: true,
      formData: {
        title: '',
        description: '',
        documentUrl: '',
        documentName: '',
        documentType: this.data.currentDocumentType.value
      }
    });
  },

  // 隐藏创建表单模态框
  hideCreateModal() {
    this.setData({ showCreateModal: false });
  },

  // 表单标题输入
  onFormTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    });
  },

  // 表单描述输入
  onFormDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  // 保存文档模板
  async saveForm() {
    if (!this.data.formData.title.trim()) {
      wx.showToast({
        title: '请输入模板名称',
        icon: 'none'
      });
      return;
    }

    if (!this.data.formData.documentUrl) {
      wx.showToast({
        title: '请先上传文档',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '保存中...' });

      const formData = {
        title: this.data.formData.title,
        description: this.data.formData.description,
        documentUrl: this.data.formData.documentUrl,
        documentName: this.data.formData.documentName,
        documentType: this.data.formData.documentType,
        creatorId: this.data.userInfo.workId,
        creatorName: this.data.userInfo.name,
        creatorDepartment: this.data.userInfo.department
      };

      const result = await formDataManager.createCollaborativeForm(formData);
      console.log('表单创建结果:', result);

      wx.showToast({
        title: '模板保存成功',
        icon: 'success'
      });

      this.hideCreateModal();
      
      // 立即刷新表单列表，确保新上传的文档显示
      setTimeout(() => {
        console.log('开始刷新表单列表...');
        this.loadForms(true); // 强制刷新
      }, 100);
    } catch (error) {
      console.error('保存模板失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 发布表单
  async publishForm(e) {
    const { formId } = e.currentTarget.dataset;
    
    try {
      wx.showLoading({ title: '发布中...' });

      await formDataManager.updateCollaborativeForm(formId, {
        status: 'published'
      }, this.data.userInfo);

      wx.showToast({
        title: '发布成功',
        icon: 'success'
      });
      this.loadForms(true); // 强制刷新
    } catch (error) {
      console.error('发布表单失败:', error);
      wx.showToast({
        title: '发布失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 显示分发表单模态框
  showDistributeForm(e) {
    const { formId } = e.currentTarget.dataset;
    const form = this.data.forms.find(f => f._id === formId);
    
    if (!form) {
      wx.showToast({
        title: '表单不存在',
        icon: 'none'
      });
      return;
    }

    this.setData({
      showDistributeModal: true,
      selectedForm: form,
      selectedUsers: [],
      userSelectionStatus: {}
    });

    this.loadUsers();
  },

  // 隐藏分发表单模态框
  hideDistributeModal() {
    this.setData({ showDistributeModal: false });
  },

  // 选择用户
  selectUser(e) {
    const { userId } = e.currentTarget.dataset;
    const user = this.data.users.find(u => u.workId === userId);
    
    if (!user) return;

    const selectedUsers = [...this.data.selectedUsers];
    const userSelectionStatus = { ...this.data.userSelectionStatus };
    
    if (userSelectionStatus[userId]) {
      // 取消选择
      const index = selectedUsers.findIndex(u => u.workId === userId);
      if (index > -1) {
        selectedUsers.splice(index, 1);
      }
      userSelectionStatus[userId] = false;
    } else {
      // 选择用户
      selectedUsers.push(user);
      userSelectionStatus[userId] = true;
    }
    
    this.setData({ 
      selectedUsers,
      userSelectionStatus 
    });
  },

  // 分发表单
  async distributeForm() {
    if (this.data.selectedUsers.length === 0) {
      wx.showToast({
        title: '请选择要分发的用户',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '分发中...' });

      await formDataManager.distributeCollaborativeForm({
        formId: this.data.selectedForm._id,
        userIds: this.data.selectedUsers.map(u => u.workId),
        assignerId: this.data.userInfo.workId,
        assignerName: this.data.userInfo.name
      });

      wx.showToast({
        title: '分发成功',
        icon: 'success'
      });
      this.hideDistributeModal();
      this.loadForms(true); // 强制刷新
    } catch (error) {
      console.error('分发表单失败:', error);
      wx.showToast({
        title: '分发失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 查看表单进度
  viewFormProgress(e) {
    const { formId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/form-progress/form-progress?formId=${formId}`
    });
  },

  // 编辑表单
  editForm(e) {
    const { formId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/form-editor/form-editor?formId=${formId}`
    });
  },

  // 删除表单
  async deleteForm(e) {
    const { formId } = e.currentTarget.dataset;
    
    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这个表单吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#EF4444'
    });

    if (res.confirm) {
      try {
        wx.showLoading({ title: '删除中...' });

        await formDataManager.deleteCollaborativeForm(formId, this.data.userInfo);

        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        this.loadForms(true); // 强制刷新
      } catch (error) {
        console.error('删除表单失败:', error);
        wx.showToast({
          title: '删除失败',
          icon: 'error'
        });
      } finally {
        wx.hideLoading();
      }
    }
  },

  // 表单类型改变
  onFormTypeChange(e) {
    const typeIndex = e.detail.value;
    const type = this.data.documentTypes[typeIndex].value;
    this.setData({
      'formData.documentType': type
    });
    
    // 更新计算属性
    this.updateComputedProperties();
  },

  // 上传文档
  async uploadDocument() {
    try {
      wx.showLoading({ title: '选择文档中...' });
      
      const res = await wx.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: ['doc', 'docx', 'xls', 'xlsx', 'pdf']
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0];
        
        wx.hideLoading();
        wx.showLoading({ title: '上传文档中...' });
        
        // 上传到云存储
        const cloudPath = `collaborative-forms/${Date.now()}_${file.name}`;
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath,
          filePath: file.path
        });

        if (uploadResult.fileID) {
          this.setData({
            'formData.documentUrl': uploadResult.fileID,
            'formData.documentName': file.name
          });

          wx.showToast({
            title: '文档上传成功',
            icon: 'success'
          });
        }
      }
    } catch (error) {
      console.error('上传文档失败:', error);
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
})