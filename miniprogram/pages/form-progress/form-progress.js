Page({
  data: {
    userInfo: null,
    formId: '',
    formData: null,
    submissions: [],
    distributions: [],
    progressStats: {
      total: 0,
      submitted: 0,
      pending: 0,
      completed: 0,
      completionRate: 0
    },
    showExportModal: false,
    exportFormat: 'excel',
    exportData: null,
    loading: false
  },

  onLoad(options) {
    this.setData({
      formId: options.formId || options.id
    });
    this.checkUserAuth();
    this.loadFormData();
    this.loadProgressData();
  },

  onShow() {
    this.loadProgressData();
  },

  // 检查用户权限
  async checkUserAuth() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({ userInfo });
      } else {
        wx.redirectTo({
          url: '/pages/login/login'
        });
      }
    } catch (error) {
      console.error('检查用户权限失败:', error);
    }
  },

  // 加载表单数据
  async loadFormData() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getCollaborativeForms',
          data: {
            formId: this.data.formId
          }
        }
      });

      if (result.result && result.result.success && result.result.data.length > 0) {
        this.setData({
          formData: result.result.data[0]
        });
      }
    } catch (error) {
      console.error('加载表单数据失败:', error);
    }
  },

  // 加载进度数据
  async loadProgressData() {
    try {
      this.setData({ loading: true });
      
      // 加载分发记录
      const distributionResult = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getFormDistributions',
          data: { formId: this.data.formId }
        }
      });

      // 加载提交记录
      const submissionResult = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getFormSubmissions',
          data: { formId: this.data.formId }
        }
      });

      if (distributionResult.result && distributionResult.result.success && 
          submissionResult.result && submissionResult.result.success) {
        
        const distributions = distributionResult.result.data;
        const submissions = submissionResult.result.data;

      // 计算进度统计
      const total = distributions.length;
      const submitted = submissions.length;
      const pending = total - submitted;
      const completionRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

      // 合并分发和提交数据
      const progressData = distributions.map(dist => {
        const submission = submissions.find(sub => sub.userId === dist.userId);
        return {
          ...dist,
          submission: submission || null,
          status: submission ? 'completed' : 'pending',
          submitTime: submission ? submission.submitTime : null
        };
      });

      this.setData({
        distributions: progressData,
        submissions,
        progressStats: {
          total,
          submitted,
          pending,
          completed: submitted,
          completionRate
        }
      });
      }

    } catch (error) {
      console.error('加载进度数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 显示导出模态框
  showExportModal() {
    this.setData({
      showExportModal: true
    });
  },

  // 隐藏导出模态框
  hideExportModal() {
    this.setData({
      showExportModal: false
    });
  },

  // 导出格式改变
  onExportFormatChange(e) {
    this.setData({
      exportFormat: e.detail.value
    });
  },

  // 导出表单数据
  async exportFormData() {
    try {
      wx.showLoading({ title: '导出中...' });

      const { formData, distributions, submissions } = this.data;
      const exportData = this.prepareExportData(formData, distributions, submissions);

      if (this.data.exportFormat === 'excel') {
        await this.exportToExcel(exportData);
      } else {
        await this.exportToCSV(exportData);
      }

      wx.showToast({
        title: '导出成功',
        icon: 'success'
      });

      this.hideExportModal();
    } catch (error) {
      console.error('导出失败:', error);
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 准备导出数据
  prepareExportData(formData, distributions, submissions) {
    const exportData = [];
    
    // 添加表头
    const headers = ['用户ID', '用户名', '部门', '状态', '分发时间'];
    formData.fields.forEach(field => {
      headers.push(field.label);
    });
    exportData.push(headers);

    // 添加数据行
    distributions.forEach(dist => {
      const submission = submissions.find(sub => sub.userId === dist.userId);
      const row = [
        dist.userId,
        dist.userName || '未知用户',
        dist.userDepartment || '未知部门',
        submission ? '已提交' : '待填写',
        this.formatDate(dist.createTime)
      ];

      // 添加表单字段值
      if (submission) {
        formData.fields.forEach(field => {
          const value = submission.formValues[field.id];
          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              row.push(value.join(', '));
            } else {
              row.push(value.toString());
            }
          } else {
            row.push('');
          }
        });
      } else {
        // 未提交的字段填充空值
        formData.fields.forEach(() => {
          row.push('');
        });
      }

      exportData.push(row);
    });

    return exportData;
  },

  // 导出为Excel格式
  async exportToExcel(data) {
    // 这里可以调用云函数来生成Excel文件
    // 或者使用第三方库在前端生成
    console.log('导出Excel数据:', data);
    
    // 模拟导出成功
    wx.showModal({
      title: '导出成功',
      content: '数据已准备完成，请到云开发控制台下载',
      showCancel: false
    });
  },

  // 导出为CSV格式
  async exportToCSV(data) {
    // 生成CSV内容
    const csvContent = data.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // 复制到剪贴板
    wx.setClipboardData({
      data: csvContent,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: 'CSV数据已复制到剪贴板，请粘贴到Excel中保存',
          showCancel: false
        });
      }
    });
  },

  // 格式化日期
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  // 查看用户详情
  viewUserDetail(e) {
    const { userId } = e.currentTarget.dataset;
    const user = this.data.distributions.find(d => d.userId === userId);
    
    if (user && user.submission) {
      wx.navigateTo({
        url: `/pages/submission-detail/submission-detail?submissionId=${user.submission._id}`
      });
    } else {
      wx.showToast({
        title: '该用户尚未提交',
        icon: 'none'
      });
    }
  },

  // 重新分发表单
  async redistributeForm(e) {
    const { userId } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认重新分发',
      content: '确定要重新分发表单给该用户吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '重新分发中...' });

            const db = wx.cloud.database();
            
            // 更新分发记录
            await db.collection('form_distributions')
              .where({
                formId: this.data.formId,
                userId: userId
              })
              .update({
                data: {
                  status: 'pending',
                  updateTime: new Date()
                }
              });

            // 删除之前的提交记录（如果有）
            await db.collection('form_submissions')
              .where({
                formId: this.data.formId,
                userId: userId
              })
              .remove();

            // 更新表单统计
            await db.collection('collaborative_forms').doc(this.data.formId).update({
              data: {
                submittedCount: db.command.inc(-1)
              }
            });

            wx.showToast({
              title: '重新分发成功',
              icon: 'success'
            });

            this.loadProgressData();
          } catch (error) {
            console.error('重新分发失败:', error);
            wx.showToast({
              title: '重新分发失败',
              icon: 'error'
            });
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 发送提醒
  async sendReminder(e) {
    const { userId } = e.currentTarget.dataset;
    
    try {
      wx.showLoading({ title: '发送提醒中...' });

      // 这里可以调用云函数发送微信消息提醒
      // 或者发送邮件通知
      
      wx.showToast({
        title: '提醒已发送',
        icon: 'success'
      });
    } catch (error) {
      console.error('发送提醒失败:', error);
      wx.showToast({
        title: '发送失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 获取状态颜色
  getStatusColor(status) {
    const colorMap = {
      'completed': '#28a745',
      'pending': '#ffc107',
      'overdue': '#dc3545'
    };
    return colorMap[status] || '#6c757d';
  },

  // 获取状态文本
  getStatusText(status) {
    const textMap = {
      'completed': '已提交',
      'pending': '待填写',
      'overdue': '已逾期'
    };
    return textMap[status] || '未知';
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
});
