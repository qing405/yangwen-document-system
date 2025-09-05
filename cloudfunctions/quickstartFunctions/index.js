// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-6g1pgt8pc50014d6'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 只在第一次调用时初始化数据库，避免每次调用都执行初始化
  if (!global.dbInitialized) {
    console.log('首次调用，开始初始化数据库...')
    await initDatabase()
    global.dbInitialized = true
    console.log('数据库初始化完成')
  }

  // 记录云函数调用（生产环境可关闭）
  if (process.env.NODE_ENV !== 'production') {
    console.log('云函数调用参数:', { type: event.type, data: event.data })
  }
  
  switch (event.type) {

    
    // 测试数据库连接
    case 'testDatabase':
      return await testDatabase()
    
    // 清理旧用户数据（仅用于调试）
    case 'cleanupUsers':
      return await cleanupOldUsers()
    
    // 用户认证相关
    case 'login':
      return await handleLogin(event.data)
    
    case 'getUserInfo':
      return await getUserInfo(event.data.userId)
    
    case 'updateUserInfo':
      return await updateUserInfo(event.data)
    
    // 文档管理相关
    case 'getDocuments':
      return await getDocuments(event.data)
    
    case 'getDocumentDetail':
      return await getDocumentDetail(event.data.docId)
    
    case 'uploadDocument':
      return await uploadDocument(event.data)
    
    case 'deleteDocument':
      return await deleteDocument(event.data.docId)
    
    // 表单管理相关
    case 'getForms':
      return await getForms(event.data)
    
    case 'getFormDetail':
      return await getFormDetail(event.data.formId)
    
    case 'submitForm':
      return await submitForm(event.data)
    
    case 'getSubmissions':
      return await getSubmissions(event.data)
    
    // 用户管理相关（管理员）
    case 'getUsers':
      return await getUsers(event.data)
    
    case 'addUser':
      return await addUser(event.data)
    
    case 'updateUser':
      return await updateUser(event.data)
    
    case 'deleteUser':
      return await deleteUser(event.data.userId)
    
    // 系统统计
    case 'getStatistics':
      return await getStatistics(event.data)
    
    // 活动记录相关
    case 'recordActivity':
      return await recordActivity(event.data)
    
    case 'getRecentActivities':
      return await getRecentActivities(event.data)
    
    case 'createActivitiesCollection':
      return await createActivitiesCollection(event.data)
    
    
    // 文档增强功能
    case 'searchDocuments':
      return await searchDocuments(event.data)
    
    case 'downloadDocument':
      return await downloadDocument(event.data)
    
    case 'previewDocument':
      return await previewDocument(event.data)
    
    // 表单增强功能
    case 'getFormTemplates':
      return await getFormTemplates(event.data)
    
    case 'saveFormProgress':
      return await saveFormProgress(event.data)
    
    case 'getFormHistory':
      return await getFormHistory(event.data)
    
    case 'getSubmissionDetail':
      return await getSubmissionDetail(event.data)
    
    case 'exportFormData':
      return await exportFormData(event.data)
    
    // 权限管理
    case 'checkPermission':
      return await checkPermission(event.data)
    
    case 'getUserPermissions':
      return await getUserPermissions(event.data)
    
    // 操作日志
    case 'logOperation':
      return await logOperation(event.data)
    
    // 台账管理相关
    case 'getRecords':
      return await getRecords(event.data)
    
    case 'getRecordDetail':
      return await getRecordDetail(event.data)
    
    case 'createRecord':
      return await createRecord(event.data)
    
    case 'updateRecord':
      return await updateRecord(event.data)
    
    case 'deleteRecord':
      return await deleteRecord(event.data)
    
    case 'approveRecord':
      return await approveRecord(event.data)
    
    // 车间管理相关
    case 'getWorkshops':
      return await getWorkshops(event.data)
    
    case 'getWorkshopDetail':
      return await getWorkshopDetail(event.data)
    
    // 权限验证
    case 'checkUserPermission':
      return await checkUserPermission(event.data)
    
    case 'getUserWorkshopData':
      return await getUserWorkshopData(event.data)
    
    // 文档中心增强功能
    case 'toggleFavorite':
      return await toggleFavorite(event.data)
    
    case 'getFavoriteDocuments':
      return await getFavoriteDocuments(event.data)
    
    case 'shareDocument':
      return await shareDocument(event.data)
    
    case 'batchDownloadDocuments':
      return await batchDownloadDocuments(event.data)
    
    case 'getSearchSuggestions':
    
    // 协作表单系统相关
    case 'initCollaborativeForms':
      return await initCollaborativeForms()
    
    case 'createCollaborativeForm':
      return await createCollaborativeForm(event.data)
    
    case 'batchUploadDocuments':
      return await batchUploadDocuments(event.data)
    
    case 'getCollaborativeForms':
      return await getCollaborativeForms(event.data)
    
    case 'updateCollaborativeForm':
      return await updateCollaborativeForm(event.data)
    
    case 'deleteCollaborativeForm':
      return await deleteCollaborativeForm(event.data)
    
    case 'distributeForm':
      return await distributeForm(event.data)
    
    case 'distributeCollaborativeForm':
      return await distributeCollaborativeForm(event.data)
    
    case 'getFormDistributions':
      return await getFormDistributions(event.data)
    
    case 'getFormDistribution':
      return await getFormDistribution(event.data)
    
    case 'getFormSubmission':
      return await getFormSubmission(event.data)
    
    case 'submitFormResponse':
      return await submitFormResponse(event.data)
    
    case 'getFormSubmissions':
      return await getFormSubmissions(event.data)
    
    case 'getDocumentStats':
      return await getDocumentStats(event.data)
    case 'listAllDocuments':
      return await listAllDocuments(event.data)
    
    // 文件处理功能
    case 'processFileUpload':
      return await processFileUpload(event.data)
    
    // 表单管理增强功能
    case 'getFormTasks':
      return await getFormTasks(event.data)
    
    case 'getFormDrafts':
      return await getFormDrafts(event.data)
    
    case 'getTaskCounts':
      return await getTaskCounts(event.data)
    
    case 'deleteFormDraft':
      return await deleteFormDraft(event.data)
    
    // 文档分析相关
    case 'analyzeDocument':
      return await analyzeDocument(event.data)
    
    default:
      return {
        success: false,
        error: 'Unknown function type'
      }
  }
}

// 初始化数据库集合
async function initDatabase() {
  try {
    console.log('开始初始化数据库...')
    
    // 只初始化真正需要的核心集合
    const coreCollections = ['users', 'documents', 'activities']
    
    for (const collectionName of coreCollections) {
      try {
        // 尝试添加一条测试数据来创建集合
        await db.collection(collectionName).add({
          data: {
            _init: true,
            createdAt: new Date()
          }
        })
        console.log(`集合 ${collectionName} 初始化成功`)
        
        // 删除测试数据
        await db.collection(collectionName).where({
          _init: true
        }).remove()
      } catch (err) {
        // 如果集合已存在，会抛出错误，这是正常的
        console.log(`集合 ${collectionName} 已存在或创建失败:`, err.message)
      }
    }
    
    console.log('核心数据库初始化完成')
  } catch (err) {
    console.error('数据库初始化失败:', err)
  }
}

// 这些初始化函数已被移除，因为它们尝试创建不存在的集合
// 如果需要这些功能，可以在需要时动态创建集合

// 初始化默认车间数据 - 已禁用
async function initDefaultWorkshops() {
  console.log('车间数据初始化已禁用')
  return
  try {
    const defaultWorkshops = [
      {
        name: '原料一车间',
        code: 'WS001',
        description: '原料加工一车间',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '原料二车间',
        code: 'WS002',
        description: '原料加工二车间',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '原料三车间',
        code: 'WS003', 
        description: '原料加工三车间',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '原料四车间',
        code: 'WS004',
        description: '原料加工四车间',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '物料缓冲车间',
        code: 'WS005',
        description: '物料缓冲处理车间',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '管带运输车间',
        code: 'WS006',
        description: '管带运输管理车间',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '维修车间',
        code: 'WS007',
        description: '设备维修保养车间',
        status: 'active',
        createdAt: new Date()
      }
    ]
    
    for (const workshop of defaultWorkshops) {
      try {
        // 检查是否已存在
        const existing = await db.collection('workshops').where({
          code: workshop.code
        }).get()
        
        if (existing.data.length === 0) {
          await db.collection('workshops').add({
            data: workshop
          })
          console.log(`车间 ${workshop.name} 初始化成功`)
        } else {
          console.log(`车间 ${workshop.name} 已存在`)
        }
      } catch (err) {
        console.log(`车间 ${workshop.name} 初始化失败:`, err.message)
      }
    }
  } catch (err) {
    console.error('初始化车间数据失败:', err)
  }
}

// 初始化默认科室数据 - 已禁用
async function initDefaultDepartments() {
  console.log('科室数据初始化已禁用')
  return
  try {
    const defaultDepartments = [
      {
        name: '机动组',
        code: 'DEPT001',
        type: '科室',
        description: '设备机动管理科室',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '安全组',
        code: 'DEPT002',
        type: '科室',
        description: '安全生产管理科室',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '环保组',
        code: 'DEPT003',
        type: '科室',
        description: '环境保护管理科室',
        status: 'active',
        createdAt: new Date()
      },
      {
        name: '生产组',
        code: 'DEPT004',
        type: '科室',
        description: '生产计划管理科室',
        status: 'active',
        createdAt: new Date()
      }
    ]
    
    for (const department of defaultDepartments) {
      try {
        // 检查是否已存在
        const existing = await db.collection('departments').where({
          code: department.code
        }).get()
        
        if (existing.data.length === 0) {
          await db.collection('departments').add({
            data: department
          })
          console.log(`科室 ${department.name} 初始化成功`)
        } else {
          console.log(`科室 ${department.name} 已存在`)
        }
      } catch (err) {
        console.log(`科室 ${department.name} 初始化失败:`, err.message)
      }
    }
  } catch (err) {
    console.error('初始化科室数据失败:', err)
  }
}

// 初始化默认权限数据 - 已禁用
async function initDefaultPermissions() {
  console.log('权限数据初始化已禁用')
  return
  try {
    const defaultPermissions = [
      // 操作员权限
      {
        role: 'operator',
        permissions: [
          'view_own_workshop',
          'create_records',
          'edit_own_records',
          'view_own_records',
          'submit_records'
        ]
      },
      // 车间管理员权限
      {
        role: 'manager',
        permissions: [
          'view_own_workshop',
          'create_records',
          'edit_own_records',
          'view_own_records',
          'submit_records',
          'approve_records',
          'delete_own_records',
          'manage_workshop_users'
        ]
      },
      // 科室管理员权限
      {
        role: 'admin',
        permissions: [
          'view_all_workshops',
          'create_records',
          'edit_all_records',
          'view_all_records',
          'submit_records',
          'approve_records',
          'delete_all_records',
          'manage_all_users',
          'manage_workshops',
          'view_statistics',
          'export_data'
        ]
      }
    ]
    
    for (const permission of defaultPermissions) {
      try {
        // 检查是否已存在
        const existing = await db.collection('permissions').where({
          role: permission.role
        }).get()
        
        if (existing.data.length === 0) {
          await db.collection('permissions').add({
            data: permission
          })
          console.log(`权限 ${permission.role} 初始化成功`)
        } else {
          console.log(`权限 ${permission.role} 已存在`)
        }
      } catch (err) {
        console.log(`权限 ${permission.role} 初始化失败:`, err.message)
      }
    }
  } catch (err) {
    console.error('初始化权限数据失败:', err)
  }
}



// 清理旧用户数据（仅在需要时调用）
async function cleanupOldUsers() {
  try {
    console.log('开始清理旧用户数据...')
    
    // 删除所有旧用户
    const deleteResult = await db.collection('users').where({
      // 删除所有用户，重新开始
    }).remove()
    
    console.log('旧用户数据清理完成，删除数量:', deleteResult.stats.removed)
    return true
  } catch (err) {
    console.error('清理旧用户数据失败:', err)
    return false
  }
}

// 用户登录
async function handleLogin(data) {
  try {
    const { workId, password } = data
    
    // 默认测试用户数据 - 支持新的权限体系
    const defaultUsers = [
      {
        workId: '044081',
        password: '123456',
        name: '杨若晴',
        department: '机动组',
        departmentType: '科室',
        workshop: null,
        role: 'admin',
        permissions: [
          'view_all_workshops',
          'create_records',
          'edit_all_records',
          'view_all_records',
          'submit_records',
          'approve_records',
          'delete_all_records',
          'manage_all_users',
          'manage_workshops',
          'view_statistics',
          'export_data'
        ]
      },
      {
        workId: '044082',
        password: '123456',
        name: 'y',
        department: '机动组',
        departmentType: '科室',
        workshop: null,
        role: 'operator',
        permissions: [
          'view_own_workshop',
          'create_records',
          'edit_own_records',
          'view_own_records',
          'submit_records'
        ]
      },
      {
        workId: '044083',
        password: '123456',
        name: 'r',
        department: '安全组',
        departmentType: '科室',
        workshop: null,
        role: 'admin',
        permissions: [
          'view_all_workshops',
          'create_records',
          'edit_all_records',
          'view_all_records',
          'submit_records',
          'approve_records',
          'delete_all_records',
          'manage_all_users',
          'manage_workshops',
          'view_statistics',
          'export_data'
        ]
      },
      {
        workId: '044084',
        password: '123456',
        name: 'q',
        department: '安全组',
        departmentType: '科室',
        workshop: null,
        role: 'operator',
        permissions: [
          'view_own_workshop',
          'create_records',
          'edit_own_records',
          'view_own_records',
          'submit_records'
        ]
      },
      {
        workId: '044085',
        password: '123456',
        name: 'l',
        department: '原料一车间',
        departmentType: '车间',
        workshop: 'workshop_01',
        role: 'operator',
        permissions: [
          'view_own_workshop',
          'create_records',
          'edit_own_records',
          'view_own_records',
          'submit_records'
        ]
      }
    ]
    
    let user = null
    
    // 首先检查默认测试用户
    const defaultUser = defaultUsers.find(u => u.workId === workId && u.password === password)
    if (defaultUser) {
      user = defaultUser
      console.log('找到默认用户:', defaultUser.name)
      
      // 检查数据库中是否已有此用户
      try {
        const existingUser = await db.collection('users').where({
          workId: workId
        }).get()
        
        if (existingUser.data.length > 0) {
          // 数据库中有此用户，更新为新数据
          const existingUserId = existingUser.data[0]._id
          await db.collection('users').doc(existingUserId).update({
            data: {
              name: defaultUser.name,
              department: defaultUser.department,
              departmentType: defaultUser.departmentType,
              workshop: defaultUser.workshop,
              role: defaultUser.role,
              permissions: defaultUser.permissions,
              updatedAt: new Date()
            }
          })
          user._id = existingUserId
          console.log('已更新数据库中的用户信息:', existingUserId)
        } else {
          // 数据库中没有此用户，添加新用户
          try {
            const addResult = await db.collection('users').add({
              data: {
                workId: defaultUser.workId,
                password: defaultUser.password,
                name: defaultUser.name,
                department: defaultUser.department,
                departmentType: defaultUser.departmentType,
                workshop: defaultUser.workshop,
                role: defaultUser.role,
                permissions: defaultUser.permissions,
                createdAt: new Date()
              }
            })
            user._id = addResult._id
            console.log('新用户已保存到数据库:', addResult._id)
          } catch (err) {
            console.log('保存新用户失败:', err.message)
            user._id = user.workId
          }
        }
      } catch (dbError) {
        console.log('数据库操作失败，使用默认用户数据:', dbError.message)
        user._id = user.workId
      }
    } else {
      // 如果不是默认用户，尝试从数据库查找
      try {
        const result = await db.collection('users').where({
          workId: workId,
          password: password
        }).get()
        
        if (result.data.length > 0) {
          user = result.data[0]
          console.log('从数据库找到用户:', user.name)
        }
      } catch (dbError) {
        console.log('数据库查询失败:', dbError.message)
      }
    }
    
    if (user) {
      return {
        success: true,
        data: {
          userId: user._id || user.workId,
          workId: user.workId,
          name: user.name,
          department: user.department,
          role: user.role
        }
      }
    } else {
      return {
        success: false,
        error: '工号或密码错误'
      }
    }
  } catch (err) {
    console.error('登录函数错误:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取用户信息
async function getUserInfo(userId) {
  try {
    const result = await db.collection('users').doc(userId).get()
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return {
      success: false,
      error: '用户信息不存在'
    }
  }
}

// 更新用户信息
async function updateUserInfo(data) {
  try {
    const { userId, ...updateData } = data
    await db.collection('users').doc(userId).update({
      data: updateData
    })
    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取文档列表
async function getDocuments(data) {
  try {
    const { userId, type, category, keyword, page = 1, pageSize = 20 } = data
    
    console.log('开始获取文档列表:', { userId, type, category, keyword, page, pageSize })
    
    // 获取用户信息
    let user = null
    try {
      const userResult = await db.collection('users').doc(userId).get()
      user = userResult.data
    } catch (err) {
      console.log('获取用户信息失败，返回空文档列表:', err.message)
      return {
        success: true,
        data: {
          documents: [],
          total: 0
        }
      }
    }
    
    try {
      // 构建查询条件
      let whereConditions = {}
      
      // 根据用户权限过滤
      if (user.role !== 'admin') {
        // 对于非管理员，检查departmentAccess数组是否包含用户部门
        // 在微信云开发中，查询数组字段包含某个值使用 db.command.in
        // 注意：db.command.in([user.department]) 表示查询 departmentAccess 数组是否包含 user.department 这个值
        whereConditions.departmentAccess = db.command.in([user.department])
        console.log('非管理员用户，应用部门权限过滤:', {
          userDepartment: user.department,
          filterCondition: whereConditions.departmentAccess
        })
      } else {
        console.log('管理员用户，不应用权限过滤')
      }
      
      // 按类型过滤
      if (type) {
        whereConditions.type = type
      }
      
      // 按分类过滤
      if (category && category !== 'all') {
        // 支持中英文分类标识符
        const categoryMap = {
          '技术文档': 'technical',
          '设计图纸': 'design', 
          '操作规程': 'operation',
          '质量手册': 'quality',
          '安全规范': 'safety',
          '报告分析': 'report'
        }
        
        // 如果传入的是中文分类，转换为英文标识符
        const categoryValue = categoryMap[category] || category
        whereConditions.category = categoryValue
        console.log('应用分类过滤:', { original: category, mapped: categoryValue })
      }
      
      // 关键词搜索
      if (keyword) {
        whereConditions.title = db.RegExp({
            regexp: keyword,
            options: 'i'
        })
      }
      
      console.log('最终查询条件:', whereConditions)
      
      // 执行查询
      let query = db.collection('documents')
      
      // 应用查询条件
      if (Object.keys(whereConditions).length > 0) {
        query = query.where(whereConditions)
      }
      
      console.log('执行查询，条件:', whereConditions)
      console.log('用户信息:', user)
      
      const result = await query
        .orderBy('uploadedAt', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
      
      console.log('查询结果:', result.data)
      console.log('文档数量:', result.data.length)
      
      // 调试：显示每个文档的分类
      if (result.data.length > 0) {
        console.log('文档分类信息:')
        result.data.forEach((doc, index) => {
          console.log(`文档${index + 1}:`, {
            title: doc.title,
            category: doc.category,
            type: doc.type
          })
        })
      }
      
      return {
        success: true,
        data: {
          documents: result.data,
          total: result.data.length
        }
      }
    } catch (dbError) {
      console.log('获取文档列表失败，返回空列表:', dbError.message)
      return {
        success: true,
        data: {
          documents: [],
          total: 0
        }
      }
    }
  } catch (err) {
    console.error('文档列表函数错误:', err)
    return {
      success: true,
      data: {
        documents: [],
        total: 0
      }
    }
  }
}

// 列出所有文档（调试用）
async function listAllDocuments(data) {
  try {
    console.log('开始查询所有文档...')
    
    try {
      const result = await db.collection('documents').get()
      console.log('数据库中的所有文档:', result.data)
      console.log('文档总数:', result.data.length)
      
      return {
        success: true,
        data: {
          documents: result.data,
          total: result.data.length
        }
      }
    } catch (dbError) {
      console.error('查询documents集合失败:', dbError)
      console.error('错误详情:', {
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code
      })
      
      return {
        success: false,
        error: `查询失败: ${dbError.message}`
      }
    }
  } catch (err) {
    console.error('获取所有文档失败:', err)
    console.error('外层错误详情:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    })
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取文档详情
async function getDocumentDetail(docId) {
  try {
    const result = await db.collection('documents').doc(docId).get()
    
    // 更新访问次数
    await db.collection('documents').doc(docId).update({
      data: {
        viewCount: db.command.inc(1)
      }
    })
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 上传文档
async function uploadDocument(data) {
  try {
    console.log('uploadDocument被调用，参数:', data)
    
    // 检查上传权限 - 支持通过userId或workId查找用户
    let user = null
    try {
      // 首先尝试通过workId查找用户（因为uploaderId可能是workId）
      const userResult = await db.collection('users').where({
        workId: data.uploaderId
      }).get()
      if (userResult.data.length > 0) {
        user = userResult.data[0]
      } else {
        // 如果通过workId查找失败，尝试通过文档ID查找
        try {
          const userResult = await db.collection('users').doc(data.uploaderId).get()
          user = userResult.data
        } catch (docError) {
          console.log('通过文档ID查找用户也失败:', docError.message)
        }
      }
    } catch (workIdError) {
      console.error('通过workId查找用户失败:', workIdError.message)
      // 如果通过workId查找失败，尝试通过文档ID查找
      try {
        const userResult = await db.collection('users').doc(data.uploaderId).get()
        user = userResult.data
      } catch (docError) {
        console.log('通过文档ID查找用户也失败:', docError.message)
      }
    }
    
    if (!user) {
      return {
        success: false,
        error: '用户不存在或权限验证失败'
      }
    }
    
    console.log('用户信息:', user)
    
    if (user.role !== 'admin') {
      return {
        success: false,
        error: '只有管理员可以上传文档'
      }
    }
    
    // 确保文件名使用UTF-8编码
    const originalFileName = data.originalFileName || ''
    const cleanFileName = ensureUTF8Encoding(originalFileName)
    
    const documentData = {
      title: data.title || cleanFileName,
      description: '',
      category: data.category || '',
      filePath: data.filePath,
      uploaderId: user._id || user.workId, // 使用数据库中的真实ID
      uploaderName: user.name,
      departmentAccess: data.departmentAccess || [],
      tags: data.tags || [],
      fileSize: data.fileSize || 0,
      originalFileName: cleanFileName,
      fileExtension: data.fileExtension || '',
      mimeType: data.mimeType || 'application/octet-stream',
      type: getDocumentTypeFromExtension(data.fileExtension || ''),
      uploadTime: new Date(),
      viewCount: 0,
      downloadCount: 0
    }
    
    console.log('准备保存文档数据:', documentData)
    console.log('文档数据类型检查:', {
      title: typeof documentData.title,
      category: typeof documentData.category,
      filePath: typeof documentData.filePath,
      uploaderId: typeof documentData.uploaderId,
      uploaderName: typeof documentData.uploaderName,
      departmentAccess: Array.isArray(documentData.departmentAccess),
      tags: Array.isArray(documentData.tags),
      fileSize: typeof documentData.fileSize,
      originalFileName: typeof documentData.originalFileName,
      fileExtension: typeof documentData.fileExtension,
      mimeType: typeof documentData.mimeType,
      uploadTime: typeof documentData.uploadTime
    })
    
    // 尝试保存文档
    console.log('开始保存到数据库...')
    
    try {
      const result = await db.collection('documents').add({
        data: documentData
      })
      
      console.log('文档保存成功，结果:', result)
      
      // 记录活动
      try {
        await recordActivity({
          type: 'upload',
          title: `上传了新的${getDocumentTypeFromExtension(data.fileExtension || '')}`,
          user: user.name,
          target: data.title || cleanFileName,
          userRole: user.role === 'admin' ? '管理员' : '普通用户',
          userId: user._id || user.workId, // 使用数据库中的真实ID
          details: {
            documentId: result._id,
            category: data.category,
            department: user.department
          }
        })
      } catch (activityError) {
        console.log('记录活动失败，但不影响文档上传:', activityError.message)
      }
      
      return {
        success: true,
        data: {
          documentId: result._id,
          message: '文档上传成功'
        }
      }
    } catch (dbError) {
      console.error('数据库操作失败:', dbError)
      console.error('数据库错误详情:', {
        name: dbError.name,
        message: dbError.message,
        stack: dbError.stack,
        code: dbError.code,
        errCode: dbError.errCode
      })
      
      // 返回错误信息
      return {
        success: false,
        error: `数据库保存失败: ${dbError.message}`
      }
    }
  } catch (err) {
    console.error('上传文档失败:', err)
    console.error('错误详情:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    })
    return {
      success: false,
      error: err.message || '上传失败'
    }
  }
}

// 删除文档
async function deleteDocument(docId) {
  try {
    // 先获取文档信息用于活动记录
    const docResult = await db.collection('documents').doc(docId).get()
    const document = docResult.data
    
    await db.collection('documents').doc(docId).remove()
    
    // 记录活动
    try {
      await recordActivity({
        type: 'delete',
        title: `删除了${getDocumentTypeFromExtension(document.fileExtension || '')}`,
        user: document.uploaderName || '未知用户',
        target: document.title,
        userRole: '管理员',
        userId: document.uploaderId || docId, // 使用文档的上传者ID
        details: {
          documentId: docId,
          category: document.category,
          department: document.departmentAccess
        }
      })
    } catch (activityError) {
      console.log('记录活动失败，但不影响文档删除:', activityError.message)
    }
    
    return {
      success: true,
      message: '删除成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取表单列表
async function getForms(data) {
  try {
    const { userId, page = 1, pageSize = 20 } = data
    
    try {
      const result = await db.collection('forms')
        .orderBy('createdAt', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
      
      return {
        success: true,
        data: result.data
      }
    } catch (dbError) {
      console.log('获取表单列表失败，返回空列表:', dbError.message)
      return {
        success: true,
        data: []
      }
    }
  } catch (err) {
    console.error('表单列表函数错误:', err)
    return {
      success: true,
      data: []
    }
  }
}

// 获取表单详情
async function getFormDetail(formId) {
  try {
    const result = await db.collection('forms').doc(formId).get()
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 提交表单
async function submitForm(data) {
  try {
    const { formId, submitterId, formData } = data
    
    // 获取用户信息用于活动记录
    let user = null
    try {
      const userResult = await db.collection('users').doc(submitterId).get()
      user = userResult.data
    } catch (userError) {
      console.log('获取用户信息失败:', userError.message)
    }
    
    const result = await db.collection('submissions').add({
      data: {
        formId,
        submitterId,
        formData,
        status: 'submitted',
        submittedAt: new Date()
      }
    })
    
    // 记录活动
    try {
      await recordActivity({
        type: 'form_submit',
        title: `提交了表单`,
        user: user ? user.name : '未知用户',
        userRole: user ? user.department : '未知部门',
        userId: submitterId,
        target: `表单ID: ${formId}`,
        details: {
          formId,
          submissionId: result._id,
          action: 'submit_basic_form'
        }
      })
    } catch (activityError) {
      console.log('记录活动失败，但不影响表单提交:', activityError.message)
    }
    
    return {
      success: true,
      data: result
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取提交记录
async function getSubmissions(data) {
  try {
    const { userId, status, page = 1, pageSize = 20 } = data
    
    let query = db.collection('submissions').where({
      submitterId: userId
    })
    
    if (status) {
      query = query.where({
        status: status
      })
    }
    
    const result = await query
      .orderBy('submittedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取用户列表（管理员）
async function getUsers(data) {
  try {
    const { page = 1, pageSize = 20 } = data
    
    const result = await db.collection('users')
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      success: true,
      data: {
        users: result.data
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 添加用户（管理员）
async function addUser(data) {
  try {
    const { workId, name, department, role, password } = data
    
    const result = await db.collection('users').add({
      data: {
        workId,
        name,
        department,
        role,
        password,
        createdAt: new Date()
      }
    })
    
    // 记录活动
    try {
      await recordActivity({
        type: 'user_register',
        title: `添加了新用户`,
        user: '系统管理员',
        userRole: '管理员',
        userId: result._id,
        target: `${name} (${workId})`,
        details: {
          newUserId: result._id,
          workId,
          name,
          department,
          role,
          action: 'add_user'
        }
      })
    } catch (activityError) {
      console.log('记录活动失败，但不影响用户添加:', activityError.message)
    }
    
    return {
      success: true,
      data: result
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 更新用户（管理员）
async function updateUser(data) {
  try {
    const { userId, ...updateData } = data
    
    // 获取用户信息用于活动记录
    let user = null
    try {
      const userResult = await db.collection('users').doc(userId).get()
      user = userResult.data
    } catch (userError) {
      console.log('获取用户信息失败:', userError.message)
    }
    
    await db.collection('users').doc(userId).update({
      data: updateData
    })
    
    // 记录活动
    try {
      await recordActivity({
        type: 'permission_change',
        title: `更新了用户信息`,
        user: '系统管理员',
        userRole: '管理员',
        userId: userId,
        target: user ? `${user.name} (${user.workId})` : `用户ID: ${userId}`,
        details: {
          updatedUserId: userId,
          updateData,
          action: 'update_user'
        }
      })
    } catch (activityError) {
      console.log('记录活动失败，但不影响用户更新:', activityError.message)
    }
    
    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 删除用户（管理员）
async function deleteUser(userId) {
  try {
    // 获取用户信息用于活动记录
    let user = null
    try {
      const userResult = await db.collection('users').doc(userId).get()
      user = userResult.data
    } catch (userError) {
      console.log('获取用户信息失败:', userError.message)
    }
    
    await db.collection('users').doc(userId).remove()
    
    // 记录活动
    try {
      await recordActivity({
        type: 'permission_change',
        title: `删除了用户`,
        user: '系统管理员',
        userRole: '管理员',
        userId: userId,
        target: user ? `${user.name} (${user.workId})` : `用户ID: ${userId}`,
        details: {
          deletedUserId: userId,
          action: 'delete_user'
        }
      })
    } catch (activityError) {
      console.log('记录活动失败，但不影响用户删除:', activityError.message)
    }
    
    return {
      success: true,
      message: '删除成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取系统统计
async function getStatistics(data) {
  try {
    const { userId } = data
    
    // 获取用户信息
    let user = null
    try {
      const userResult = await db.collection('users').doc(userId).get()
      user = userResult.data
    } catch (err) {
      console.log('获取用户信息失败，使用默认统计:', err.message)
      // 如果获取用户信息失败，返回默认统计
      return {
        success: true,
        data: {
          documentCount: 0,
          submissionCount: 0
        }
      }
    }
    
    let documentCount = 0
    let submissionCount = 0
    
    try {
      if (user.role === 'admin') {
        // 管理员可以看到所有数据
        const docResult = await db.collection('documents').count()
        const subResult = await db.collection('submissions').count()
        documentCount = docResult.total
        submissionCount = subResult.total
      } else {
        // 普通用户只能看到本部门数据
        const docResult = await db.collection('documents').where({
          departmentAccess: user.department
        }).count()
        const subResult = await db.collection('submissions').where({
          submitterId: userId
        }).count()
        documentCount = docResult.total
        submissionCount = subResult.total
      }
    } catch (dbError) {
      console.log('获取统计数据失败，返回默认值:', dbError.message)
      // 如果数据库集合不存在，返回默认值
      documentCount = 0
      submissionCount = 0
    }
    
    return {
      success: true,
      data: {
        documentCount,
        submissionCount
      }
    }
  } catch (err) {
    console.error('统计函数错误:', err)
    return {
      success: true,
      data: {
        documentCount: 0,
        submissionCount: 0
      }
    }
  }
}

// ==================== 文档增强功能 ====================

// 高级文档搜索
async function searchDocuments(data) {
  try {
    const { userId, keyword, type, timeRange, fileSize, uploader, sortBy = 'uploadedAt', sortOrder = 'desc', page = 1, pageSize = 20 } = data
    
    let query = db.collection('documents')
    
    // 关键词搜索（支持标题和描述）
    if (keyword) {
      query = query.where({
        title: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      })
    }
    
    // 类型筛选
    if (type) {
      query = query.where({
        type: type
      })
    }
    
    // 时间范围筛选
    if (timeRange) {
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      query = query.where({
        uploadedAt: db.command.gte(startDate)
      })
    }
    
    // 文件大小筛选
    if (fileSize) {
      let sizeQuery = {}
      switch (fileSize) {
        case 'small':
          sizeQuery = db.command.lte(1024 * 1024) // 小于1MB
          break
        case 'medium':
          sizeQuery = db.command.and([
            db.command.gt(1024 * 1024),
            db.command.lte(10 * 1024 * 1024)
          ]) // 1-10MB
          break
        case 'large':
          sizeQuery = db.command.gt(10 * 1024 * 1024) // 大于10MB
          break
      }
      
      if (Object.keys(sizeQuery).length > 0) {
        query = query.where({
          fileSize: sizeQuery
        })
      }
    }
    
    // 上传者筛选
    if (uploader) {
      query = query.where({
        uploader: uploader
      })
    }
    
    // 排序
    query = query.orderBy(sortBy, sortOrder)
    
    const result = await query
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 文档下载
async function downloadDocument(data) {
  try {
    const { docId, userId } = data
    
    // 获取文档信息
    const docResult = await db.collection('documents').doc(docId).get()
    const document = docResult.data
    
    if (!document) {
      return {
        success: false,
        error: '文档不存在'
      }
    }

    // 获取用户信息进行权限检查
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 权限检查：非管理员只能下载本部门文档
    if (user.role !== 'admin' && document.departmentAccess && document.departmentAccess.length > 0) {
      if (!document.departmentAccess.includes(user.department)) {
        return {
          success: false,
          error: '无权限下载此文档'
        }
      }
    }
    
    // 更新下载次数
    await db.collection('documents').doc(docId).update({
      data: {
        downloadCount: db.command.inc(1)
      }
    })
    
    // 生成下载文件名（优先使用原始文件名）
    let downloadFileName = document.originalFileName || document.title
    
    // 确保文件名有正确的扩展名
    if (document.fileExtension && !downloadFileName.toLowerCase().endsWith('.' + document.fileExtension.toLowerCase())) {
      downloadFileName += '.' + document.fileExtension
    }
    
    // 处理中文文件名编码
    const encodedFileName = encodeFileName(downloadFileName)
    
    // 获取临时下载链接
    const tempFileResult = await cloud.getTempFileURL({
      fileList: [document.filePath]
    })
    
    if (!tempFileResult.fileList || tempFileResult.fileList.length === 0) {
      return {
        success: false,
        error: '获取下载链接失败'
      }
    }
    
    const tempFile = tempFileResult.fileList[0]
    
    // 记录操作日志
    await logOperation({
      userId,
      action: 'download',
      resource: 'document',
      resourceId: docId,
      details: `下载文档: ${downloadFileName}`
    })
    
    return {
      success: true,
      data: {
        filePath: document.filePath,
        tempFileURL: tempFile.tempFileURL,
        fileName: downloadFileName,
        encodedFileName: encodedFileName,
        mimeType: document.mimeType || 'application/octet-stream',
        fileSize: document.fileSize,
        // 设置下载响应头信息
        headers: {
          'Content-Type': document.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
          'Content-Length': document.fileSize || 0,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    }
  } catch (err) {
    console.error('下载文档失败:', err)
    return {
      success: false,
      error: err.message || '下载失败'
    }
  }
}

// 文档预览
async function previewDocument(data) {
  try {
    const { docId, userId } = data
    
    console.log('previewDocument被调用，参数:', data)
    
    // 获取文档信息
    const docResult = await db.collection('documents').doc(docId).get()
    const document = docResult.data
    
    console.log('获取到的文档信息:', document)
    
    if (!document) {
      return {
        success: false,
        error: '文档不存在'
      }
    }

    // 获取用户信息进行权限检查
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    console.log('用户信息:', user)
    
    // 权限检查：非管理员只能预览本部门文档
    if (user.role !== 'admin' && document.departmentAccess && document.departmentAccess.length > 0) {
      if (!document.departmentAccess.includes(user.department)) {
        return {
          success: false,
          error: '无权限预览此文档'
        }
      }
    }
    
    // 更新查看次数
    await db.collection('documents').doc(docId).update({
      data: {
        viewCount: db.command.inc(1)
      }
    })
    
    console.log('准备获取临时文件URL，filePath:', document.filePath)
    
    // 获取临时预览链接
    try {
      const tempFileResult = await cloud.getTempFileURL({
        fileList: [document.filePath]
      })
      
      console.log('临时文件URL结果:', tempFileResult)
      
      if (!tempFileResult.fileList || tempFileResult.fileList.length === 0) {
        console.error('临时文件URL结果为空:', tempFileResult)
        return {
          success: false,
          error: '获取预览链接失败：fileList为空'
        }
      }
      
      const tempFile = tempFileResult.fileList[0]
      
      console.log('临时文件信息:', tempFile)
      
      // 检查临时文件URL是否存在
      if (!tempFile.tempFileURL) {
        console.error('临时文件URL不存在:', tempFile)
        return {
          success: false,
          error: '获取预览链接失败：tempFileURL不存在'
        }
      }
      
      // 检查临时文件状态
      if (tempFile.status !== 0) {
        console.error('临时文件状态错误:', tempFile.status, tempFile.errMsg)
        return {
          success: false,
          error: `获取预览链接失败：${tempFile.errMsg || '文件状态错误'}`
        }
      }
      
      console.log('临时文件URL验证成功:', tempFile.tempFileURL)
      
      // 记录预览操作
      try {
        await logOperation({
          userId,
          action: 'preview',
          resource: 'document',
          resourceId: docId,
          details: `预览文档: ${document.title}`
        })
      } catch (logError) {
        console.log('记录预览操作失败，继续执行:', logError.message)
      }
      
      const responseData = {
        tempFileURL: tempFile.tempFileURL,
        mimeType: document.mimeType || 'application/octet-stream',
        fileExtension: document.fileExtension || '',
        title: document.title,
        filePath: document.filePath
      }
      
      console.log('返回的预览数据:', responseData)
      
      return {
        success: true,
        data: responseData
      }
    } catch (tempUrlError) {
      console.error('获取临时文件URL失败:', tempUrlError)
      return {
        success: false,
        error: `获取临时文件URL失败: ${tempUrlError.message}`
      }
    }
  } catch (err) {
    console.error('预览文档失败:', err)
    return {
      success: false,
      error: err.message || '预览失败'
    }
  }
}

// ==================== 表单增强功能 ====================

// 获取表单模板
async function getFormTemplates(data) {
  try {
    const { category } = data
    
    let query = db.collection('formTemplates')
    
    if (category) {
      query = query.where({
        category: category
      })
    }
    
    const result = await query.get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: true,
      data: []
    }
  }
}

// 保存表单填写进度
async function saveFormProgress(data) {
  try {
    const { userId, formId, progress, formData } = data
    
    // 检查是否已有进度
    const existing = await db.collection('formProgress').where({
      userId: userId,
      formId: formId
    }).get()
    
    if (existing.data.length > 0) {
      // 更新现有进度
      await db.collection('formProgress').doc(existing.data[0]._id).update({
        data: {
          progress: progress,
          formData: formData,
          updatedAt: new Date()
        }
      })
    } else {
      // 创建新进度
      await db.collection('formProgress').add({
        data: {
          userId: userId,
          formId: formId,
          progress: progress,
          formData: formData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }
    
    return {
      success: true,
      message: '进度保存成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取表单历史记录
async function getFormHistory(data) {
  try {
    const { userId, formId, page = 1, pageSize = 20 } = data
    
    let query = db.collection('submissions')
    
    if (userId) {
      query = query.where({
        submitterId: userId
      })
    }
    
    if (formId) {
      query = query.where({
        formId: formId
      })
    }
    
    const result = await query
      .orderBy('submittedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: true,
      data: []
    }
  }
}

// 获取提交详情
async function getSubmissionDetail(data) {
  try {
    const { submissionId, userId } = data
    
    const result = await db.collection('submissions').doc(submissionId).get()
    
    if (result.data) {
      // 获取提交人信息
      let submitterName = '未知用户'
      try {
        const userResult = await db.collection('users').doc(result.data.submitterId).get()
        submitterName = userResult.data.name
      } catch (err) {
        console.log('获取提交人信息失败:', err.message)
      }
      
      const submission = {
        ...result.data,
        submitterName: submitterName
      }
      
      return {
        success: true,
        data: submission
      }
    } else {
      return {
        success: false,
        error: '提交记录不存在'
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 导出表单数据
async function exportFormData(data) {
  try {
    const { formId, userId } = data
    
    // 获取表单提交数据
    const submissions = await db.collection('submissions').where({
      formId: formId
    }).get()
    
    // 生成CSV格式数据
    const csvData = generateCSV(submissions.data)
    
    return {
      success: true,
      data: {
        csvData: csvData,
        fileName: `form_${formId}_${new Date().toISOString().split('T')[0]}.csv`
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// ==================== 权限管理功能 ====================

// 检查用户权限
async function checkPermission(data) {
  try {
    const { userId, action, resource, resourceId } = data
    
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return {
        success: true,
        data: { hasPermission: true }
      }
    }
    
    // 根据具体操作检查权限
    switch (action) {
      case 'read':
        return {
          success: true,
          data: { hasPermission: true }
        }
      case 'write':
        return {
          success: true,
          data: { hasPermission: user.role === 'manager' }
        }
      case 'delete':
        return {
          success: true,
          data: { hasPermission: false }
        }
      default:
        return {
          success: true,
          data: { hasPermission: false }
        }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取用户权限列表
async function getUserPermissions(data) {
  try {
    const { userId } = data
    
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    const permissions = {
      documents: {
        read: true,
        write: user.role === 'admin',
        delete: user.role === 'admin'
      },
      forms: {
        read: true,
        write: true,
        delete: user.role === 'admin'
      },
      users: {
        read: user.role === 'admin',
        write: user.role === 'admin',
        delete: user.role === 'admin'
      }
    }
    
    return {
      success: true,
      data: permissions
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// ==================== 操作日志功能 ====================

// 记录操作日志
async function logOperation(data) {
  try {
    const { userId, action, resource, resourceId, details } = data
    
    await db.collection('operationLogs').add({
      data: {
        userId: userId,
        action: action,
        resource: resource,
        resourceId: resourceId,
        details: details,
        timestamp: new Date()
      }
    })
    
    return {
      success: true,
      message: '日志记录成功'
    }
  } catch (err) {
    console.error('记录操作日志失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// ==================== 辅助函数 ====================

// 生成CSV数据
function generateCSV(data) {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0]).filter(key => key !== '_id' && key !== '_openid')
  const csvRows = [headers.join(',')]
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' ? `"${value}"` : value
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
}

// ==================== 台账管理功能 ====================

// 获取台账列表（带权限控制）
async function getRecords(data) {
  try {
    const { userId, type, workshop, status, page = 1, pageSize = 20 } = data
    
    // 获取用户信息
    let user = null
    try {
      const userResult = await db.collection('users').doc(userId).get()
      user = userResult.data
    } catch (err) {
      console.log('获取用户信息失败，返回空台账列表:', err.message)
      return {
        success: true,
        data: []
      }
    }
    
    try {
      let query = db.collection('records')
      
      // 根据用户权限过滤数据
      if (user.role === 'operator' || user.role === 'manager') {
        // 车间用户只能查看本车间数据
        query = query.where({
          workshop: user.workshop
        })
      }
      
      // 科室管理员可以查看所有数据，但可以按车间筛选
      if (user.role === 'admin' && workshop) {
        query = query.where({
          workshop: workshop
        })
      }
      
      // 按类型筛选
      if (type) {
        query = query.where({
          type: type
        })
      }
      
      // 按状态筛选
      if (status) {
        query = query.where({
          status: status
        })
      }
      
      const result = await query
        .orderBy('created_at', 'desc')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .get()
      
      // 获取车间信息
      const recordsWithWorkshop = await Promise.all(
        result.data.map(async (record) => {
          try {
            const workshopResult = await db.collection('workshops').doc(record.workshop).get()
            return {
              ...record,
              workshopName: workshopResult.data.name
            }
          } catch (err) {
            return {
              ...record,
              workshopName: '未知车间'
            }
          }
        })
      )
      
      return {
        success: true,
        data: recordsWithWorkshop,
        userRole: user.role
      }
    } catch (dbError) {
      console.log('获取台账列表失败，返回空列表:', dbError.message)
      return {
        success: true,
        data: []
      }
    }
  } catch (err) {
    console.error('台账列表函数错误:', err)
    return {
      success: true,
      data: []
    }
  }
}

// 获取台账详情
async function getRecordDetail(data) {
  try {
    const { recordId, userId } = data
    
    // 获取台账详情
    const recordResult = await db.collection('records').doc(recordId).get()
    const record = recordResult.data
    
    if (!record) {
      return {
        success: false,
        error: '台账不存在'
      }
    }
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 权限检查：车间用户只能查看本车间台账
    if ((user.role === 'operator' || user.role === 'manager') && record.workshop !== user.workshop) {
      return {
        success: false,
        error: '无权限查看此台账'
      }
    }
    
    // 获取车间信息
    let workshopName = '未知车间'
    try {
      const workshopResult = await db.collection('workshops').doc(record.workshop).get()
      workshopName = workshopResult.data.name
    } catch (err) {
      console.log('获取车间信息失败:', err.message)
    }
    
    return {
      success: true,
      data: {
        ...record,
        workshopName: workshopName
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 创建台账
async function createRecord(data) {
  try {
    const { userId, title, type, content, workshop } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 权限检查
    if (!user.permissions.includes('create_records')) {
      return {
        success: false,
        error: '无权限创建台账'
      }
    }
    
    // 车间用户只能在本车间创建台账
    if (user.role !== 'admin' && workshop !== user.workshop) {
      return {
        success: false,
        error: '只能在本车间创建台账'
      }
    }
    
    const result = await db.collection('records').add({
      data: {
        title,
        type,
        workshop: workshop || user.workshop,
        creator: userId,
        creatorName: user.name,
        status: 'pending',
        content,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    
    return {
      success: true,
      data: result
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 更新台账
async function updateRecord(data) {
  try {
    const { recordId, userId, title, content } = data
    
    // 获取台账信息
    const recordResult = await db.collection('records').doc(recordId).get()
    const record = recordResult.data
    
    if (!record) {
      return {
        success: false,
        error: '台账不存在'
      }
    }
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 权限检查
    let canEdit = false
    
    if (user.role === 'admin') {
      canEdit = user.permissions.includes('edit_all_records')
    } else if (user.role === 'manager') {
      canEdit = user.permissions.includes('edit_own_records') && record.workshop === user.workshop
    } else if (user.role === 'operator') {
      canEdit = user.permissions.includes('edit_own_records') && record.workshop === user.workshop && record.creator === userId
    }
    
    if (!canEdit) {
      return {
        success: false,
        error: '无权限编辑此台账'
      }
    }
    
    await db.collection('records').doc(recordId).update({
      data: {
        title,
        content,
        updated_at: new Date()
      }
    })
    
    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 删除台账
async function deleteRecord(data) {
  try {
    const { recordId, userId } = data
    
    // 获取台账信息
    const recordResult = await db.collection('records').doc(recordId).get()
    const record = recordResult.data
    
    if (!record) {
      return {
        success: false,
        error: '台账不存在'
      }
    }
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 权限检查
    let canDelete = false
    
    if (user.role === 'admin') {
      canDelete = user.permissions.includes('delete_all_records')
    } else if (user.role === 'manager') {
      canDelete = user.permissions.includes('delete_own_records') && record.workshop === user.workshop
    }
    
    if (!canDelete) {
      return {
        success: false,
        error: '无权限删除此台账'
      }
    }
    
    await db.collection('records').doc(recordId).remove()
    
    return {
      success: true,
      message: '删除成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 审批台账
async function approveRecord(data) {
  try {
    const { recordId, userId, approved, comment } = data
    
    // 获取台账信息
    const recordResult = await db.collection('records').doc(recordId).get()
    const record = recordResult.data
    
    if (!record) {
      return {
        success: false,
        error: '台账不存在'
      }
    }
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 权限检查
    let canApprove = false
    
    if (user.role === 'admin') {
      canApprove = user.permissions.includes('approve_records')
    } else if (user.role === 'manager') {
      canApprove = user.permissions.includes('approve_records') && record.workshop === user.workshop
    }
    
    if (!canApprove) {
      return {
        success: false,
        error: '无权限审批此台账'
      }
    }
    
    await db.collection('records').doc(recordId).update({
      data: {
        status: approved ? 'approved' : 'rejected',
        approvedBy: userId,
        approvedByName: user.name,
        approvedAt: new Date(),
        comment,
        updated_at: new Date()
      }
    })
    
    return {
      success: true,
      message: approved ? '审批通过' : '审批拒绝'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// ==================== 车间管理功能 ====================

// 获取车间列表
async function getWorkshops(data) {
  try {
    const { userId } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    let query = db.collection('workshops')
    
    // 车间用户只能看到自己的车间
    if (user.role === 'operator' || user.role === 'manager') {
      query = query.where({
        _id: user.workshop
      })
    }
    
    const result = await query.get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取车间详情
async function getWorkshopDetail(data) {
  try {
    const { workshopId, userId } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    // 权限检查：车间用户只能查看自己的车间
    if ((user.role === 'operator' || user.role === 'manager') && workshopId !== user.workshop) {
      return {
        success: false,
        error: '无权限查看此车间'
      }
    }
    
    const result = await db.collection('workshops').doc(workshopId).get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// ==================== 权限验证功能 ====================

// 检查用户权限
async function checkUserPermission(data) {
  try {
    const { userId, requiredPermission } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    if (!user) {
      return {
        success: false,
        error: '用户不存在'
      }
    }
    
    const hasPermission = user.permissions && user.permissions.includes(requiredPermission)
    
    return {
      success: true,
      data: {
        hasPermission,
        userRole: user.role
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取用户车间数据
async function getUserWorkshopData(data) {
  try {
    const { userId } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    if (!user) {
      return {
        success: false,
        error: '用户不存在'
      }
    }
    
    // 获取用户车间信息
    let workshopInfo = null
    if (user.workshop) {
      try {
        const workshopResult = await db.collection('workshops').doc(user.workshop).get()
        workshopInfo = workshopResult.data
      } catch (err) {
        console.log('获取车间信息失败:', err.message)
      }
    }
    
    return {
      success: true,
      data: {
        userRole: user.role,
        workshop: user.workshop,
        workshopInfo,
        permissions: user.permissions || []
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// ==================== 文档中心增强功能 ====================

// 收藏/取消收藏文档
async function toggleFavorite(data) {
  try {
    const { userId, docId } = data
    
    // 检查用户收藏记录
    const favoriteResult = await db.collection('favorites').where({
      userId: userId,
      docId: docId
    }).get()
    
    if (favoriteResult.data.length > 0) {
      // 取消收藏
      await db.collection('favorites').doc(favoriteResult.data[0]._id).remove()
      
      // 记录操作日志
      await logOperation({
        userId,
        action: 'unfavorite',
        resource: 'document',
        resourceId: docId,
        details: '取消收藏文档'
      })
      
      return {
        success: true,
        data: {
          isFavorite: false,
          message: '已取消收藏'
        }
      }
    } else {
      // 添加收藏
      await db.collection('favorites').add({
        data: {
          userId: userId,
          docId: docId,
          createdAt: new Date()
        }
      })
      
      // 记录操作日志
      await logOperation({
        userId,
        action: 'favorite',
        resource: 'document',
        resourceId: docId,
        details: '收藏文档'
      })
      
      return {
        success: true,
        data: {
          isFavorite: true,
          message: '已添加到收藏'
        }
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取用户收藏的文档
async function getFavoriteDocuments(data) {
  try {
    const { userId, page = 1, pageSize = 20 } = data
    
    const result = await db.collection('favorites')
      .where({
        userId: userId
      })
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 获取文档详细信息
    const docIds = result.data.map(item => item.docId)
    const documents = []
    
    for (const docId of docIds) {
      try {
        const docResult = await db.collection('documents').doc(docId).get()
        documents.push({
          ...docResult.data,
          isFavorite: true
        })
      } catch (err) {
        console.log('获取文档信息失败:', docId, err.message)
      }
    }
    
    return {
      success: true,
      data: documents
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 分享文档
async function shareDocument(data) {
  try {
    const { userId, docId, shareType, targetUsers } = data
    
    // 获取文档信息
    const docResult = await db.collection('documents').doc(docId).get()
    const document = docResult.data
    
    // 创建分享记录
    const shareData = {
      userId: userId,
      docId: docId,
      shareType: shareType, // 'link', 'user', 'group'
      targetUsers: targetUsers || [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后过期
    }
    
    const shareResult = await db.collection('shares').add({
      data: shareData
    })
    
    // 记录操作日志
    await logOperation({
      userId,
      action: 'share',
      resource: 'document',
      resourceId: docId,
      details: `分享文档: ${document.title}`
    })
    
    return {
      success: true,
      data: {
        shareId: shareResult._id,
        shareLink: `https://your-domain.com/share/${shareResult._id}`,
        message: '分享成功'
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 批量下载文档
async function batchDownloadDocuments(data) {
  try {
    const { userId, docIds } = data
    
    if (!docIds || docIds.length === 0) {
      return {
        success: false,
        error: '请选择要下载的文档'
      }
    }
    
    if (docIds.length > 10) {
      return {
        success: false,
        error: '一次最多只能下载10个文档'
      }
    }
    
    const documents = []
    
    for (const docId of docIds) {
      try {
        const docResult = await db.collection('documents').doc(docId).get()
        const document = docResult.data
        
        // 更新下载次数
        await db.collection('documents').doc(docId).update({
          data: {
            downloadCount: db.command.inc(1)
          }
        })
        
        documents.push({
          filePath: document.filePath,
          fileName: document.title
        })
      } catch (err) {
        console.log('获取文档信息失败:', docId, err.message)
      }
    }
    
    // 记录操作日志
    await logOperation({
      userId,
      action: 'batch_download',
      resource: 'document',
      resourceId: docIds.join(','),
      details: `批量下载 ${docIds.length} 个文档`
    })
    
    return {
      success: true,
      data: {
        documents: documents,
        message: `成功准备下载 ${documents.length} 个文档`
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取文档搜索建议
async function getSearchSuggestions(data) {
  try {
    const { keyword, limit = 10 } = data
    
    if (!keyword || keyword.length < 2) {
      return {
        success: true,
        data: []
      }
    }
    
    // 搜索文档标题
    const result = await db.collection('documents')
      .where({
        title: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      })
      .limit(limit)
      .get()
    
    const suggestions = result.data.map(doc => doc.title)
    
    return {
      success: true,
      data: suggestions
    }
  } catch (err) {
    return {
      success: true,
      data: []
    }
  }
}

// 获取文档统计信息
async function getDocumentStats(data) {
  try {
    const { userId } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    let query = db.collection('documents')
    
    // 根据用户角色限制查询范围
    if (user.role === 'operator' && user.workshop) {
      query = query.where({
        workshop: user.workshop
      })
    }
    
    // 统计总数
    const totalResult = await query.count()
    const total = totalResult.total
    
    // 统计各类型文档数量
    const typeStats = await db.collection('documents')
      .aggregate()
      .group({
        _id: '$type',
        count: db.command.aggregate.sum(1)
      })
      .end()
    
    // 统计最近上传的文档
    const recentResult = await query
      .orderBy('uploadedAt', 'desc')
      .limit(5)
      .get()
    
    return {
      success: true,
      data: {
        total,
        typeStats: typeStats.list,
        recentDocuments: recentResult.data
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取表单任务列表
async function getFormTasks(data) {
  try {
    const { userId, status = 'pending', page = 1, pageSize = 20 } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    let query = db.collection('forms')
    
    // 根据用户角色和车间限制查询
    if (user.role === 'operator' && user.workshop) {
      query = query.where({
        targetWorkshops: user.workshop
      })
    }
    
    // 根据状态筛选
    if (status === 'pending') {
      query = query.where({
        status: 'active',
        deadline: db.command.gte(new Date())
      })
    } else if (status === 'completed') {
      // 检查是否有提交记录
      const submissionsResult = await db.collection('submissions')
        .where({
          userId: userId
        })
        .get()
      
      const submittedFormIds = submissionsResult.data.map(s => s.formId)
      if (submittedFormIds.length > 0) {
        query = query.where({
          _id: db.command.in(submittedFormIds)
        })
      } else {
        return {
          success: true,
          data: []
        }
      }
    } else if (status === 'overdue') {
      query = query.where({
        status: 'active',
        deadline: db.command.lt(new Date())
      })
    }
    
    // 分页查询
    const result = await query
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 获取表单详情
    const tasks = await Promise.all(result.data.map(async (form) => {
      // 检查是否已提交
      const submissionResult = await db.collection('submissions')
        .where({
          formId: form._id,
          userId: userId
        })
        .get()
      
      const isSubmitted = submissionResult.data.length > 0
      const submission = submissionResult.data[0] || null
      
      return {
        ...form,
        isSubmitted,
        submission
      }
    }))
    
    return {
      success: true,
      data: tasks
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取表单草稿列表
async function getFormDrafts(data) {
  try {
    const { userId, page = 1, pageSize = 20 } = data
    
    const result = await db.collection('submissions')
      .where({
        userId: userId,
        status: 'draft'
      })
      .orderBy('updatedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    // 获取表单模板信息
    const drafts = await Promise.all(result.data.map(async (draft) => {
      const formResult = await db.collection('forms').doc(draft.formId).get()
      const form = formResult.data
      
      return {
        ...draft,
        form
      }
    }))
    
    return {
      success: true,
      data: drafts
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取任务统计
async function getTaskCounts(data) {
  try {
    const { userId } = data
    
    // 获取用户信息
    const userResult = await db.collection('users').doc(userId).get()
    const user = userResult.data
    
    let query = db.collection('forms')
    
    // 根据用户角色和车间限制查询
    if (user.role === 'operator' && user.workshop) {
      query = query.where({
        targetWorkshops: user.workshop
      })
    }
    
    // 待办任务（未过期）
    const pendingResult = await query
      .where({
        status: 'active',
        deadline: db.command.gte(new Date())
      })
      .count()
    
    // 已办任务（已提交）
    const submissionsResult = await db.collection('submissions')
      .where({
        userId: userId,
        status: 'submitted'
      })
      .count()
    
    // 逾期任务
    const overdueResult = await query
      .where({
        status: 'active',
        deadline: db.command.lt(new Date())
      })
      .count()
    
    // 草稿数量
    const draftsResult = await db.collection('submissions')
      .where({
        userId: userId,
        status: 'draft'
      })
      .count()
    
    return {
      success: true,
      data: {
        pending: pendingResult.total,
        completed: submissionsResult.total,
        overdue: overdueResult.total,
        drafts: draftsResult.total
      }
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 删除表单草稿
async function deleteFormDraft(data) {
  try {
    const { draftId, userId } = data
    
    // 验证草稿所有权
    const draftResult = await db.collection('submissions')
      .where({
        _id: draftId,
        userId: userId,
        status: 'draft'
      })
      .get()
    
    if (draftResult.data.length === 0) {
      return {
        success: false,
        error: '草稿不存在或无权限删除'
      }
    }
    
    // 删除草稿
    await db.collection('submissions').doc(draftId).remove()
    
    // 记录活动
    try {
      await recordActivity({
        type: 'delete',
        title: `删除了表单草稿`,
        user: draftResult.data[0].userName || '未知用户',
        userRole: draftResult.data[0].userDepartment || '未知部门',
        userId: userId,
        target: `草稿ID: ${draftId}`,
        details: {
          draftId,
          action: 'delete_draft'
        }
      })
    } catch (activityError) {
      console.log('记录活动失败，但不影响草稿删除:', activityError.message)
    }
    
    return {
      success: true,
      message: '草稿删除成功'
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    }
  }
}

// 初始化默认表单模板 - 已禁用
async function initDefaultFormTemplates() {
  console.log('表单模板初始化已禁用')
  return
  try {
    const defaultTemplates = [
      {
        name: '设备日常点检表',
        category: 'safety',
        categoryName: '安全类',
        description: '用于设备日常安全检查和维护记录',
        creatorId: '044081', // 默认管理员
        creatorName: '系统管理员',
        status: 'active',
        fields: [
          {
            name: 'deviceName',
            label: '设备名称',
            type: 'text',
            required: true
          },
          {
            name: 'checkDate',
            label: '检查日期',
            type: 'date',
            required: true
          },
          {
            name: 'checkItems',
            label: '检查项目',
            type: 'textarea',
            required: true
          },
          {
            name: 'findings',
            label: '检查发现',
            type: 'textarea',
            required: false
          },
          {
            name: 'actions',
            label: '处理措施',
            type: 'textarea',
            required: false
          }
        ],
        targetWorkshops: ['workshop_01', 'workshop_02', 'workshop_03', 'workshop_04', 'workshop_05', 'workshop_06', 'workshop_07'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: '原料质量验收单',
        category: 'quality',
        categoryName: '质量类',
        description: '原料入库质量检查和验收记录',
        creatorId: '044081',
        creatorName: '系统管理员',
        status: 'active',
        fields: [
          {
            name: 'materialName',
            label: '原料名称',
            type: 'text',
            required: true
          },
          {
            name: 'batchNumber',
            label: '批次号',
            type: 'text',
            required: true
          },
          {
            name: 'supplier',
            label: '供应商',
            type: 'text',
            required: true
          },
          {
            name: 'quantity',
            label: '数量',
            type: 'number',
            required: true
          },
          {
            name: 'qualityCheck',
            label: '质量检查结果',
            type: 'select',
            options: ['合格', '不合格', '待复检'],
            required: true
          },
          {
            name: 'remarks',
            label: '备注',
            type: 'textarea',
            required: false
          }
        ],
        targetWorkshops: ['workshop_01', 'workshop_02', 'workshop_03', 'workshop_04'],
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'template_003',
        name: '安全隐患整改单',
        category: 'safety',
        categoryName: '安全类',
        description: '安全隐患发现和整改跟踪记录',
        creatorId: '044081',
        creatorName: '系统管理员',
        status: 'active',
        fields: [
          {
            name: 'issueType',
            label: '隐患类型',
            type: 'select',
            options: ['设备隐患', '操作隐患', '环境隐患', '管理隐患'],
            required: true
          },
          {
            name: 'issueDescription',
            label: '隐患描述',
            type: 'textarea',
            required: true
          },
          {
            name: 'location',
            label: '隐患位置',
            type: 'text',
            required: true
          },
          {
            name: 'severity',
            label: '严重程度',
            type: 'select',
            options: ['轻微', '一般', '严重', '重大'],
            required: true
          },
          {
            name: 'correctiveActions',
            label: '整改措施',
            type: 'textarea',
            required: true
          },
          {
            name: 'deadline',
            label: '整改期限',
            type: 'date',
            required: true
          }
        ],
        targetWorkshops: ['workshop_01', 'workshop_02', 'workshop_03', 'workshop_04', 'workshop_05', 'workshop_06', 'workshop_07'],
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5天后
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
    
    for (const template of defaultTemplates) {
      try {
        // 检查是否已存在
        const existing = await db.collection('forms').where({
          name: template.name
        }).get()
        
        if (existing.data.length === 0) {
          await db.collection('forms').add({
            data: template
          })
          console.log(`表单模板 ${template.name} 初始化成功`)
        } else {
          console.log(`表单模板 ${template.name} 已存在`)
        }
      } catch (err) {
        console.log(`表单模板 ${template.name} 初始化失败:`, err.message)
      }
    }
  } catch (err) {
    console.error('初始化表单模板失败:', err)
  }
}

// 文件处理相关函数
async function processFileUpload(data) {
  try {
    const { filePath, originalFileName, fileSize } = data
    
    // 获取文件信息
    const fileInfo = await cloud.getTempFileURL({
      fileList: [filePath]
    })
    
    if (!fileInfo.fileList || fileInfo.fileList.length === 0) {
      return {
        success: false,
        error: '获取文件信息失败'
      }
    }
    
    const file = fileInfo.fileList[0]
    
    // 检测文件类型
    const fileExtension = originalFileName ? originalFileName.split('.').pop().toLowerCase() : ''
    const mimeType = getMimeType(fileExtension)
    
    // 验证文件大小
    const maxFileSize = 200 * 1024 * 1024 // 200MB
    if (fileSize && fileSize > maxFileSize) {
      return {
        success: false,
        error: '文件大小超过限制'
      }
    }
    
    return {
      success: true,
      data: {
        fileExtension,
        mimeType,
        fileSize: fileSize || 0,
        encoding: 'UTF-8',
        tempFileURL: file.tempFileURL
      }
    }
  } catch (err) {
    console.error('处理文件上传失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取MIME类型
function getMimeType(extension) {
  const mimeTypes = {
    // Word文档
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel文档
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // PowerPoint文档
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // PDF文档
    'pdf': 'application/pdf',
    // 图片文件
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    // 文本文件
    'txt': 'text/plain; charset=utf-8',
    'rtf': 'application/rtf',
    // CAD文件
    'dwg': 'application/acad',
    'dxf': 'application/dxf',
    // 压缩文件
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed'
  }
  
  return mimeTypes[extension] || 'application/octet-stream'
}

// 处理中文文件名编码
function encodeFileName(fileName) {
  try {
    // 确保文件名是UTF-8编码
    const encoded = encodeURIComponent(fileName)
    return encoded
  } catch (err) {
    console.error('编码文件名失败:', err)
    return fileName
  }
}

// 生成安全的文件名
function generateSafeFileName(originalName, extension) {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substr(2, 9)
  return `doc_${timestamp}_${randomStr}.${extension}`
}

// 从文件扩展名推断文档类型
function getDocumentTypeFromExtension(extension) {
  if (!extension) return '其他文档'
  
  const ext = extension.toLowerCase()
  
  // Word文档
  if (['doc', 'docx'].includes(ext)) {
    return '技术文档'
  }
  // Excel文档
  else if (['xls', 'xlsx'].includes(ext)) {
    return '报告分析'
  }
  // PowerPoint文档
  else if (['ppt', 'pptx'].includes(ext)) {
    return '技术文档'
  }
  // PDF文档
  else if (ext === 'pdf') {
    return '技术文档'
  }
  // 图片文件
  else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
    return '设计图纸'
  }
  // 文本文件
  else if (['txt', 'rtf'].includes(ext)) {
    return '操作规程'
  }
  // CAD文件
  else if (['dwg', 'dxf'].includes(ext)) {
    return '设计图纸'
  }
  // 压缩文件
  else if (['zip', 'rar', '7z'].includes(ext)) {
    return '其他文档'
  }
  
  return '其他文档'
}





// 确保文件名使用UTF-8编码
function ensureUTF8Encoding(fileName) {
  if (!fileName) return '';
  
  try {
    // 方法1: 如果文件名包含编码字符，尝试解码
    let processedFileName = fileName;
    if (fileName.includes('%') || fileName.includes('\\u')) {
      try {
        processedFileName = decodeURIComponent(fileName);
      } catch (e) {
        try {
          processedFileName = unescape(fileName);
        } catch (e2) {
          console.log('文件名解码失败，使用原始文件名');
        }
      }
    }
    
    // 方法2: 清理文件名中的特殊字符
    const cleanFileName = processedFileName.replace(/[<>:"/\\|?*]/g, '_');
    
    console.log('云函数文件名编码处理:', {
      original: fileName,
      decoded: processedFileName,
      cleaned: cleanFileName
    });
    
    return cleanFileName;
  } catch (e) {
    console.error('云函数文件名编码处理失败:', e);
    // 如果所有方法都失败，返回清理后的原始文件名
    return fileName.replace(/[<>:"/\\|?*]/g, '_');
  }
}

// 确保集合存在
async function ensureCollectionExists(collectionName) {
  try {
    // 尝试获取集合信息，如果集合不存在会抛出错误
    await db.collection(collectionName).limit(1).get()
    console.log(`集合 ${collectionName} 已存在`)
    return true
  } catch (error) {
    console.log(`集合 ${collectionName} 检查失败:`, error)
    
    if (error.errCode === -502005) { // 集合不存在的错误码
      console.log(`集合 ${collectionName} 不存在，正在创建...`)
      try {
        // 通过添加一条数据来创建集合
        const createResult = await db.collection(collectionName).add({
          data: {
            _temp: true,
            createdAt: new Date(),
            _collectionCreated: true
          }
        })
        console.log(`集合 ${collectionName} 创建成功，ID:`, createResult._id)
        
        // 删除临时数据
        try {
          const tempResult = await db.collection(collectionName).where({
            _temp: true
          }).get()
          
          if (tempResult.data.length > 0) {
            await db.collection(collectionName).doc(tempResult.data[0]._id).remove()
            console.log(`已清理集合 ${collectionName} 的临时数据`)
          }
        } catch (cleanupError) {
          console.log(`清理临时数据失败:`, cleanupError.message)
        }
        
        return true
      } catch (createError) {
        console.error(`创建集合 ${collectionName} 失败:`, createError)
        throw createError
      }
    } else {
      console.error(`集合 ${collectionName} 检查时发生其他错误:`, error)
      throw error
    }
  }
}

// 记录用户活动
async function recordActivity(data) {
  try {
    const { type, title, user, target, userRole, userId, details } = data
    
    const activityData = {
      type,
      title,
      user,
      target: target || '',
      userRole,
      userId,
      details: details || {},
      timestamp: new Date(),
      createdAt: new Date()
    }
    
    console.log('记录活动:', activityData)
    
    let result
    try {
      // 直接尝试添加数据
      result = await db.collection('activities').add({
        data: activityData
      })
      console.log('活动记录成功，ID:', result._id)
    } catch (addError) {
      if (addError.errCode === -502005) {
        console.log('Activities集合不存在，无法记录活动')
        return {
          success: false,
          error: 'Activities集合不存在，请联系管理员'
        }
      } else {
        console.error('记录活动时发生其他错误:', addError)
        throw addError
      }
    }
    
    return {
      success: true,
      data: {
        activityId: result._id,
        message: '活动记录成功'
      }
    }
  } catch (err) {
    console.error('记录活动失败:', err)
    return {
      success: false,
      error: err.message || '记录活动失败'
    }
  }
}



// 获取最近活动列表
async function getRecentActivities(data) {
  try {
    const { userId, page = 1, pageSize = 20 } = data
    
    // 首先检查 activities 集合是否存在
    try {
      // 尝试直接查询集合，如果不存在会抛出错误
      const testQuery = await db.collection('activities').limit(1).get()
      console.log('activities 集合存在，当前记录数:', testQuery.data.length)
    } catch (collectionError) {
      console.log('activities 集合不存在，错误:', collectionError.message)
      // 尝试创建集合
      try {
        await ensureCollectionExists('activities')
        console.log('activities 集合创建成功')
      } catch (createError) {
        console.log('activities 集合创建失败:', createError.message)
        return {
          success: true,
          data: {
            activities: [],
            total: 0,
            page,
            pageSize
          }
        }
      }
    }
    
    // 获取用户信息
    let user = null
    try {
      const userResult = await db.collection('users').doc(userId).get()
      user = userResult.data
      console.log('获取用户信息成功:', user)
    } catch (err) {
      console.log('获取用户信息失败:', err.message)
      // 尝试通过workId查找用户
      try {
        const userQuery = await db.collection('users').where({
          workId: userId
        }).get()
        if (userQuery.data.length > 0) {
          user = userQuery.data[0]
          console.log('通过workId获取用户信息成功:', user)
        }
      } catch (workIdErr) {
        console.log('通过workId获取用户信息也失败:', workIdErr.message)
      }
    }
    
    // 构建查询条件
    let query = db.collection('activities')
    
    // 如果是普通用户，只能看到自己相关的活动
    if (user && user.role !== 'admin') {
      // 尝试多种用户ID格式进行查询
      // 由于微信云开发不支持 $or，我们需要先查询所有活动，然后在内存中过滤
      console.log('普通用户查询活动，用户ID:', userId, '用户信息:', user)
    } else {
      console.log('管理员用户，显示所有活动')
    }
    
    // 按时间倒序排列，分页查询
    let result
    try {
      result = await query
        .orderBy('timestamp', 'desc')
        .get()
    } catch (queryError) {
      if (queryError.errCode === -502005) {
        console.log('activities集合不存在，返回空列表')
        return {
          success: true,
          data: {
            activities: [],
            total: 0,
            page,
            pageSize
          }
        }
      } else {
        throw queryError
      }
    }
    
    // 处理活动过滤
    let filteredActivities = result.data
    console.log('查询到的活动总数:', result.data.length)
    
    // 如果是管理员，显示所有活动
    if (user && user.role === 'admin') {
      console.log('管理员用户，显示所有活动')
      filteredActivities = result.data
    } else {
      // 普通用户，只显示自己相关的活动
      const userIdentifiers = [
        userId,
        user ? user._id : null,
        user ? user.workId : null,
        user ? user.name : null
      ].filter(id => id) // 过滤掉空值
      
      console.log('普通用户标识符列表:', userIdentifiers)
      
      filteredActivities = result.data.filter(activity => {
        const activityUserId = activity.userId
        const activityUser = activity.user
        const isMatch = userIdentifiers.includes(activityUserId) || 
                       userIdentifiers.includes(activityUser)
        
        console.log('活动过滤检查:', {
          activityId: activity._id,
          activityUserId,
          activityUser,
          userIdentifiers,
          isMatch
        })
        
        return isMatch
      })
      
      console.log('过滤后的活动数量:', filteredActivities.length)
    }
    
    // 应用分页
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex)
    
    // 格式化活动数据
    const activities = paginatedActivities.map(activity => {
      const now = new Date()
      const activityTime = new Date(activity.timestamp)
      const timeDiff = now - activityTime
      
      // 计算相对时间
      let relativeTime = ''
      if (timeDiff < 60000) { // 1分钟内
        relativeTime = '刚刚'
      } else if (timeDiff < 3600000) { // 1小时内
        relativeTime = `${Math.floor(timeDiff / 60000)}分钟前`
      } else if (timeDiff < 86400000) { // 1天内
        relativeTime = `${Math.floor(timeDiff / 3600000)}小时前`
      } else if (timeDiff < 2592000000) { // 30天内
        relativeTime = `${Math.floor(timeDiff / 86400000)}天前`
      } else {
        relativeTime = activityTime.toLocaleDateString('zh-CN')
      }
      
      // 根据活动类型设置图标和颜色
      let icon = 'documents'
      let color = '#007BFF'
      
      switch (activity.type) {
        case 'upload':
          icon = 'documents'
          color = '#007BFF'
          break
        case 'delete':
          icon = 'error'
          color = '#DC3545'
          break
        case 'update':
          icon = 'warning'
          color = '#FFC107'
          break
        case 'form_submit':
          icon = 'forms'
          color = '#28A745'
          break
        case 'form_approve':
          icon = 'success'
          color = '#28A745'
          break
        case 'user_register':
          icon = 'user-management'
          color = '#17A2B8'
          break
        case 'permission_change':
          icon = 'setting'
          color = '#6F42C1'
          break
        case 'share':
          icon = 'share'
          color = '#FF9800'
          break
        default:
          icon = 'form-fill'
          color = '#6C757D'
      }
      
      return {
        id: activity._id,
        type: activity.type,
        icon,
        color,
        title: activity.title,
        user: activity.user,
        target: activity.target,
        userRole: activity.userRole,
        timestamp: activity.timestamp,
        relativeTime,
        details: activity.details
      }
    })
    
    console.log('最终返回数据:', {
      activitiesCount: activities.length,
      totalCount: filteredActivities.length,
      page,
      pageSize,
      activities: activities.slice(0, 2) // 只打印前2条避免日志过长
    })
    
    return {
      success: true,
      data: {
        activities,
        total: filteredActivities.length,
        page,
        pageSize
      }
    }
  } catch (err) {
    console.error('获取最近活动失败:', err)
    return {
      success: false,
      error: err.message || '获取活动失败'
    }
  }
}

// ==================== 协作表单系统相关函数 ====================

// 初始化协作表单系统
async function initCollaborativeForms() {
  try {
    console.log('开始初始化协作表单系统...')
    console.log('当前数据库环境:', cloud.DYNAMIC_CURRENT_ENV || 'cloud1-6g1pgt8pc50014d6')
    
    // 创建必要的集合
    const collections = ['collaborative_forms', 'form_distributions', 'form_submissions', 'users', 'activities']
    
    for (const collectionName of collections) {
      try {
        console.log(`正在处理集合: ${collectionName}`)
        
        // 检查集合是否存在
        const collection = db.collection(collectionName)
        
        // 尝试添加一条测试数据来创建集合
        const addResult = await collection.add({
          data: {
            _init: true,
            createdAt: new Date(),
            description: '协作表单系统初始化数据'
          }
        })
        console.log(`集合 ${collectionName} 创建成功，ID: ${addResult._id}`)
        
        // 删除测试数据
        try {
          const removeResult = await collection.where({
            _init: true
          }).remove()
          console.log(`测试数据删除成功，删除数量: ${removeResult.stats.removed}`)
        } catch (removeErr) {
          console.log(`删除测试数据失败:`, removeErr.message)
        }
      } catch (err) {
        console.log(`处理集合 ${collectionName} 时出错:`, err.message)
        if (err.message.includes('collection not exists') || err.message.includes('not exist')) {
          console.log(`集合 ${collectionName} 不存在，尝试通过查询创建...`)
          try {
            // 尝试通过查询来创建集合
            const queryResult = await collection.limit(1).get()
            console.log(`集合 ${collectionName} 通过查询创建成功`)
          } catch (createErr) {
            console.log(`集合 ${collectionName} 创建失败:`, createErr.message)
            // 如果还是失败，尝试直接创建一条数据
            try {
              const directResult = await collection.add({
                data: {
                  _direct_init: true,
                  createdAt: new Date(),
                  description: '直接初始化数据'
                }
              })
              console.log(`集合 ${collectionName} 通过直接添加数据创建成功`)
              
              // 清理直接创建的数据
              try {
                await collection.where({ _direct_init: true }).remove()
              } catch (cleanErr) {
                console.log(`清理直接创建数据失败:`, cleanErr.message)
              }
            } catch (directErr) {
              console.log(`直接创建集合 ${collectionName} 也失败:`, directErr.message)
            }
          }
        } else {
          console.log(`集合 ${collectionName} 其他错误:`, err.message)
        }
      }
    }
    
    // 创建测试用户数据（如果用户集合为空）
    try {
      console.log('检查用户集合状态...')
      const usersResult = await db.collection('users').count()
      console.log(`用户集合当前记录数: ${usersResult.total}`)
      
      if (usersResult.total === 0) {
        console.log('创建测试用户数据...')
        const testUsers = [
          {
            workId: 'admin001',
            name: '管理员',
            department: '管理部',
            status: 'active',
            role: 'admin',
            avatar: '',
            createTime: new Date()
          },
          {
            workId: 'user001',
            name: '张三',
            department: '技术部',
            status: 'active',
            role: 'user',
            avatar: '',
            createTime: new Date()
          },
          {
            workId: 'user002',
            name: '李四',
            department: '销售部',
            status: 'active',
            role: 'user',
            avatar: '',
            createTime: new Date()
          }
        ]
        
        for (const user of testUsers) {
          const userResult = await db.collection('users').add({ data: user })
          console.log(`用户 ${user.name} 创建成功，ID: ${userResult._id}`)
        }
        console.log('测试用户数据创建成功')
      } else {
        console.log('用户集合已有数据，跳过创建测试用户')
      }
    } catch (userErr) {
      console.log('创建测试用户数据失败:', userErr.message)
    }
    
    console.log('协作表单系统初始化完成')
    return {
      success: true,
      message: '协作表单系统初始化完成',
      collections: collections
    }
  } catch (err) {
    console.error('协作表单系统初始化失败:', err)
    return {
      success: false,
      error: err.message,
      stack: err.stack
    }
  }
}

// 创建协作表单
async function createCollaborativeForm(data) {
  try {
    const { title, description, fields, documentUrl, documentName, documentType, creatorId, creatorName, creatorDepartment } = data
    
    const formData = {
      title,
      description,
      fields: fields || [],
      documentUrl,
      documentName,
      documentType,
      creatorId,
      creatorName,
      creatorDepartment,
      status: 'draft', // draft, published, closed
      createTime: new Date(),
      updateTime: new Date(),
      submittedCount: 0,
      totalDistributions: 0
    }
    
    const result = await db.collection('collaborative_forms').add({
      data: formData
    })
    
    // 记录活动
    await recordActivity({
      type: 'upload',
      title: `上传了文档模板"${title}"`,
      user: creatorName,
      userRole: creatorDepartment,
      userId: creatorId,
      target: title,
      details: {
        formId: result._id,
        documentType: 'collaborative_form',
        action: 'create'
      }
    })
    
    return {
      success: true,
      data: {
        formId: result._id,
        ...formData
      }
    }
  } catch (err) {
    console.error('创建协作表单失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 批量上传文档
async function batchUploadDocuments(data) {
  try {
    const { documents, batchSettings, creatorId, creatorName, creatorDepartment } = data
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return {
        success: false,
        error: '没有提供有效的文档数据'
      }
    }
    
    const results = []
    const errors = []
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      
      try {
        // 创建表单数据
        const formData = {
          title: doc.title || doc.name.replace(/\.[^/.]+$/, ''),
          description: doc.description || batchSettings?.defaultDescription || `从${doc.name}自动生成的表单模板`,
          documentUrl: doc.fileID,
          documentName: doc.name,
          documentType: doc.documentType || batchSettings?.documentType || 'document',
          fields: doc.fields || [],
          status: 'draft',
          creatorId,
          creatorName,
          creatorDepartment,
          createTime: new Date(),
          updateTime: new Date(),
          submittedCount: 0,
          totalDistributions: 0
        }
        
        // 保存到数据库
        const result = await db.collection('collaborative_forms').add({
          data: formData
        })
        
        // 记录活动
        await recordActivity({
          type: 'upload',
          title: `批量上传了文档模板"${formData.title}"`,
          user: creatorName,
          userRole: creatorDepartment,
          userId: creatorId,
          target: formData.title,
          details: {
            formId: result._id,
            documentType: 'collaborative_form',
            action: 'batch_create',
            batchIndex: i + 1,
            totalInBatch: documents.length
          }
        })
        
        results.push({
          index: i,
          name: doc.name,
          success: true,
          formId: result._id,
          title: formData.title
        })
        
      } catch (error) {
        console.error(`批量上传文档 ${doc.name} 失败:`, error)
        errors.push({
          index: i,
          name: doc.name,
          success: false,
          error: error.message
        })
      }
    }
    
    return {
      success: true,
      data: {
        total: documents.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    }
    
  } catch (err) {
    console.error('批量上传文档失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取协作表单列表
async function getCollaborativeForms(data) {
  try {
    const { page = 1, pageSize = 10, status, creatorId } = data
    
    let query = db.collection('collaborative_forms')
    
    if (status && status !== 'all') {
      query = query.where({ status })
    }
    
    if (creatorId) {
      query = query.where({ creatorId })
    }
    
    const result = await query
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()
    
    return {
      success: true,
      data: {
        forms: result.data
      }
    }
  } catch (err) {
    console.error('获取协作表单列表失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 更新协作表单
async function updateCollaborativeForm(data) {
  try {
    const { formId, updateData, userId, userName, userRole } = data
    
    const result = await db.collection('collaborative_forms')
      .doc(formId)
      .update({
        data: {
          ...updateData,
          updateTime: new Date()
        }
      })
    
    // 记录活动（特别是发布表单）
    if (updateData.status === 'published') {
      await recordActivity({
        type: 'update',
        title: `发布了文档模板`,
        user: userName || '未知用户',
        userRole: userRole || '未知角色',
        userId: userId || 'unknown',
        target: `表单ID: ${formId}`,
        details: {
          formId,
          action: 'publish',
          newStatus: 'published'
        }
      })
    }
    
    return {
      success: true,
      data: result
    }
  } catch (err) {
    console.error('更新协作表单失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 删除协作表单
async function deleteCollaborativeForm(data) {
  try {
    const { formId, userId, userName, userRole } = data
    
    // 获取表单信息用于活动记录
    let formInfo = null
    try {
      const formResult = await db.collection('collaborative_forms').doc(formId).get()
      formInfo = formResult.data
    } catch (err) {
      console.log('获取表单信息失败，可能已被删除:', err.message)
    }
    
    // 删除表单
    await db.collection('collaborative_forms').doc(formId).remove()
    
    // 删除相关的分发记录
    await db.collection('form_distributions').where({
      formId: formId
    }).remove()
    
    // 删除相关的提交记录
    await db.collection('form_submissions').where({
      formId: formId
    }).remove()
    
    // 记录活动
    if (formInfo) {
      await recordActivity({
        type: 'delete',
        title: `删除了文档模板"${formInfo.title}"`,
        user: userName || '未知用户',
        userRole: userRole || '未知角色',
        userId: userId || 'unknown',
        target: formInfo.title,
        details: {
          formId,
          originalTitle: formInfo.title,
          action: 'delete'
        }
      })
    }
    
    return {
      success: true,
      message: '表单删除成功'
    }
  } catch (err) {
    console.error('删除协作表单失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 分发表单
async function distributeForm(data) {
  try {
    const { formId, userIds, distributorId, distributorName } = data
    
    const distributions = userIds.map(userId => ({
      formId,
      userId,
      distributorId,
      distributorName,
      status: 'pending', // pending, completed, expired
      distributeTime: new Date(),
      updateTime: new Date()
    }))
    
    const result = await db.collection('form_distributions').add({
      data: distributions
    })
    
    // 更新表单的分发计数
    await db.collection('collaborative_forms').doc(formId).update({
      data: {
        totalDistributions: db.command.inc(userIds.length),
        updateTime: new Date()
      }
    })
    
    // 记录活动
    await recordActivity({
      type: 'share',
      title: `分发了表单给${userIds.length}个用户`,
      user: distributorName,
      userRole: '管理员',
      userId: distributorId,
      target: `表单ID: ${formId}`,
      details: {
        formId,
        userIds,
        distributionCount: userIds.length,
        action: 'distribute'
      }
    })
    
    return {
      success: true,
      data: result
    }
  } catch (err) {
    console.error('分发表单失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 分派协作表单（增强版）
async function distributeCollaborativeForm(data) {
  try {
    const { 
      formId, 
      userIds, 
      assignerId, 
      assignerName, 
      deadline, 
      priority, 
      description, 
      notifyUsers 
    } = data
    
    // 获取表单信息
    const formResult = await db.collection('collaborative_forms').doc(formId).get()
    if (!formResult.data) {
      throw new Error('表单不存在')
    }
    
    const formData = formResult.data
    
    // 创建分发记录
    const distributions = userIds.map(userId => ({
      formId,
      formTitle: formData.title,
      formDescription: formData.description,
      formDocumentUrl: formData.documentUrl,
      formDocumentName: formData.documentName,
      formDocumentType: formData.documentType,
      userId,
      assignerId,
      assignerName,
      assigneeName: '', // 将在下面填充
      deadline: deadline ? new Date(deadline) : null,
      priority: priority || 'medium',
      description: description || '',
      status: 'pending', // pending, in_progress, completed, expired
      distributeTime: new Date(),
      updateTime: new Date(),
      submittedCount: 0,
      targetCount: 1, // 每个用户需要提交1次
      notifyUsers: notifyUsers || false
    }))
    
    // 获取用户信息并填充用户名
    const userPromises = userIds.map(async (userId) => {
      try {
        const userResult = await db.collection('users').where({
          workId: userId
        }).get()
        return userResult.data[0] || { workId: userId, name: '未知用户' }
      } catch (err) {
        console.error(`获取用户信息失败: ${userId}`, err)
        return { workId: userId, name: '未知用户' }
      }
    })
    
    const users = await Promise.all(userPromises)
    
    // 填充用户名
    distributions.forEach((distribution, index) => {
      distribution.assigneeName = users[index].name
    })
    
    // 批量插入分发记录
    const result = await db.collection('form_distributions').add({
      data: distributions
    })
    
    // 更新表单的分发计数
    await db.collection('collaborative_forms').doc(formId).update({
      data: {
        totalDistributions: db.command.inc(userIds.length),
        updateTime: new Date()
      }
    })
    
    // 记录活动
    await recordActivity({
      type: 'assign',
      title: `分派了表单"${formData.title}"给${userIds.length}个用户`,
      user: assignerName,
      userRole: '管理员',
      userId: assignerId,
      target: formData.title,
      details: {
        formId,
        formTitle: formData.title,
        userIds,
        assigneeNames: users.map(u => u.name),
        distributionCount: userIds.length,
        deadline,
        priority,
        action: 'distribute'
      }
    })
    
    // 如果启用了通知，为每个用户创建通知记录
    if (notifyUsers) {
      const notifications = distributions.map(distribution => ({
        userId: distribution.userId,
        type: 'task_assigned',
        title: '新任务分派',
        content: `您收到了新任务：${formData.title}`,
        data: {
          formId,
          distributionId: result._id,
          deadline,
          priority
        },
        isRead: false,
        createTime: new Date()
      }))
      
      try {
        await db.collection('notifications').add({
          data: notifications
        })
      } catch (notifyErr) {
        console.error('创建通知失败:', notifyErr)
        // 通知失败不影响分派结果
      }
    }
    
    return {
      success: true,
      data: {
        distributionId: result._id,
        distributionCount: userIds.length,
        formTitle: formData.title,
        assigneeNames: users.map(u => u.name)
      }
    }
  } catch (err) {
    console.error('分派协作表单失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取单个表单分发记录
async function getFormDistribution(data) {
  try {
    const { distributionId, userId } = data
    
    // 首先尝试通过ID直接获取分发记录
    let result
    try {
      result = await db.collection('form_distributions').doc(distributionId).get()
      if (result.data && result.data.userId === userId) {
        return {
          success: true,
          data: {
            distribution: result.data
          }
        }
      }
    } catch (docError) {
      console.log('通过ID获取失败，尝试查询方式:', docError.message)
    }
    
    // 如果直接获取失败，尝试查询方式
    const queryResult = await db.collection('form_distributions')
      .where({
        _id: distributionId,
        userId: userId
      })
      .get()
    
    if (queryResult.data.length === 0) {
      return {
        success: false,
        error: '分发记录不存在或无权限访问'
      }
    }
    
    return {
      success: true,
      data: {
        distribution: queryResult.data[0]
      }
    }
  } catch (err) {
    console.error('获取表单分发记录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取表单提交记录
async function getFormSubmission(data) {
  try {
    const { distributionId, userId } = data
    
    const result = await db.collection('form_submissions')
      .where({
        distributionId: distributionId,
        userId: userId
      })
      .get()
    
    if (result.data.length === 0) {
      return {
        success: false,
        error: '提交记录不存在'
      }
    }
    
    return {
      success: true,
      data: {
        submission: result.data[0]
      }
    }
  } catch (err) {
    console.error('获取表单提交记录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取表单分发记录
async function getFormDistributions(data) {
  try {
    const { formId, userId, status } = data
    
    let query = db.collection('form_distributions')
    
    if (formId) {
      query = query.where({ formId })
    }
    
    if (userId) {
      query = query.where({ userId })
    }
    
    if (status && status !== 'all') {
      query = query.where({ status })
    }
    
    const result = await query
      .orderBy('distributeTime', 'desc')
      .get()
    
    return {
      success: true,
      data: {
        distributions: result.data
      }
    }
  } catch (err) {
    console.error('获取表单分发记录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 提交表单回复
async function submitFormResponse(data) {
  try {
    const { distributionId, formId, userId, userName, userDepartment, responses } = data
    
    const submissionData = {
      distributionId,
      formId,
      userId,
      userName,
      userDepartment,
      responses: responses || {},
      submitTime: new Date(),
      status: 'submitted'
    }
    
    const result = await db.collection('form_submissions').add({
      data: submissionData
    })
    
    // 更新分发记录状态
    if (distributionId) {
      await db.collection('form_distributions').doc(distributionId).update({
        data: {
          status: 'completed',
          updateTime: new Date(),
          submittedCount: 1
        }
      })
    } else {
      // 如果没有distributionId，通过formId和userId更新
      await db.collection('form_distributions').where({
        formId,
        userId
      }).update({
        data: {
          status: 'completed',
          updateTime: new Date(),
          submittedCount: 1
        }
      })
    }
    
    // 更新表单的提交计数
    if (formId) {
      await db.collection('collaborative_forms').doc(formId).update({
        data: {
          submittedCount: db.command.inc(1),
          updateTime: new Date()
        }
      })
    }
    
    // 记录活动
    await recordActivity({
      type: 'form_submit',
      title: `填写了表单`,
      user: userName,
      userRole: userDepartment,
      userId: userId,
      target: `表单ID: ${formId}`,
      details: {
        formId,
        distributionId,
        submissionId: result._id,
        action: 'submit'
      }
    })
    
    return {
      success: true,
      data: {
        submissionId: result._id,
        ...submissionData
      }
    }
  } catch (err) {
    console.error('提交表单回复失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 获取表单提交记录
async function getFormSubmissions(data) {
  try {
    const { formId, userId, status } = data
    
    let query = db.collection('form_submissions')
    
    if (formId) {
      query = query.where({ formId })
    }
    
    if (userId) {
      query = query.where({ userId })
    }
    
    if (status && status !== 'all') {
      query = query.where({ status })
    }
    
    const result = await query
      .orderBy('submitTime', 'desc')
      .get()
    
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    console.error('获取表单提交记录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 文档分析相关
async function analyzeDocument(data) {
  try {
    const { fileID, fileName } = data
    
    // 根据文件类型进行不同的分析
    const fileExtension = fileName.split('.').pop().toLowerCase()
    
    let extractedFields = []
    
    if (fileExtension === 'doc' || fileExtension === 'docx') {
      // Word文档分析
      extractedFields = await analyzeWordDocument(fileID)
    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      // Excel文档分析
      extractedFields = await analyzeExcelDocument(fileID)
    } else if (fileExtension === 'pdf') {
      // PDF文档分析
      extractedFields = await analyzePdfDocument(fileID)
    } else {
      // 默认字段
      extractedFields = getDefaultFields(fileName)
    }
    
    return {
      success: true,
      data: {
        fields: extractedFields,
        fileName: fileName,
        fileType: fileExtension
      }
    }
  } catch (err) {
    console.error('文档分析失败:', err)
    // 返回默认字段
    return {
      success: true,
      data: {
        fields: getDefaultFields('未知文档'),
        fileName: '未知文档',
        fileType: 'unknown'
      }
    }
  }
}

// 分析Word文档
async function analyzeWordDocument(fileID) {
  // 这里可以集成第三方Word解析库
  // 暂时返回默认字段
  return getDefaultFields('Word文档')
}

// 分析Excel文档
async function analyzeExcelDocument(fileID) {
  // 这里可以集成第三方Excel解析库
  // 暂时返回默认字段
  return getDefaultFields('Excel文档')
}

// 分析PDF文档
async function analyzePdfDocument(fileID) {
  // 这里可以集成第三方PDF解析库
  // 暂时返回默认字段
  return getDefaultFields('PDF文档')
}

// 获取默认字段
function getDefaultFields(fileName) {
  const baseFields = [
    {
      label: '姓名',
      type: 'text',
      required: true,
      placeholder: '请输入姓名',
      content: '姓名字段'
    },
    {
      label: '部门',
      type: 'text',
      required: true,
      placeholder: '请输入部门',
      content: '部门字段'
    },
    {
      label: '日期',
      type: 'date',
      required: true,
      placeholder: '请选择日期',
      content: '日期字段'
    },
    {
      label: '数量',
      type: 'number',
      required: false,
      placeholder: '请输入数量',
      content: '数量字段'
    },
    {
      label: '备注',
      type: 'textarea',
      required: false,
      placeholder: '请输入备注信息',
      content: '备注字段'
    }
  ]
  
  // 根据文件名添加特定字段
  if (fileName.includes('申请') || fileName.includes('申请')) {
    baseFields.push({
      label: '申请原因',
      type: 'textarea',
      required: true,
      placeholder: '请详细说明申请原因',
      content: '申请原因字段'
    })
  }
  
  if (fileName.includes('报销') || fileName.includes('费用')) {
    baseFields.push({
      label: '金额',
      type: 'number',
      required: true,
      placeholder: '请输入金额',
      content: '金额字段'
    })
    baseFields.push({
      label: '发票',
      type: 'file',
      required: true,
      placeholder: '请上传发票',
      content: '发票字段'
    })
  }
  
  if (fileName.includes('请假') || fileName.includes('休假')) {
    baseFields.push({
      label: '请假类型',
      type: 'select',
      required: true,
      placeholder: '请选择请假类型',
      content: '请假类型字段',
      options: ['年假', '病假', '事假', '调休', '其他']
    })
    baseFields.push({
      label: '请假天数',
      type: 'number',
      required: true,
      placeholder: '请输入请假天数',
      content: '请假天数字段'
    })
  }
  
  return baseFields
}

// 测试数据库连接
async function testDatabase() {
  try {
    console.log('开始测试数据库连接...')
    console.log('当前数据库环境:', cloud.DYNAMIC_CURRENT_ENV || 'cloud1-6g1pgt8pc50014d6')
    
    // 测试基本数据库操作
    const testCollection = db.collection('test_connection')
    
    // 尝试添加测试数据
    const addResult = await testCollection.add({
      data: {
        test: true,
        timestamp: new Date(),
        message: '数据库连接测试'
      }
    })
    console.log('测试数据添加成功，ID:', addResult._id)
    
    // 尝试查询测试数据
    const queryResult = await testCollection.where({ test: true }).get()
    console.log('测试数据查询成功，数量:', queryResult.data.length)
    
    // 清理测试数据
    const removeResult = await testCollection.where({ test: true }).remove()
    console.log('测试数据清理成功，删除数量:', removeResult.stats.removed)
    
    return {
      success: true,
      message: '数据库连接测试成功',
      addResult: addResult._id,
      queryResult: queryResult.data.length,
      removeResult: removeResult.stats.removed
    }
  } catch (error) {
    console.error('数据库连接测试失败:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
}

// 创建activities集合
async function createActivitiesCollection(data) {
  try {
    console.log('开始创建activities集合...')
    
    // 尝试直接添加一条测试数据来创建集合
    const testActivity = {
      type: 'test',
      title: '测试活动记录',
      user: '系统',
      userRole: '系统',
      userId: 'system',
      target: '测试目标',
      details: { test: true },
      timestamp: new Date(),
      createdAt: new Date()
    }
    
    const result = await db.collection('activities').add({
      data: testActivity
    })
    
    console.log('activities集合创建成功，测试记录ID:', result._id)
    
    // 删除测试记录
    await db.collection('activities').doc(result._id).remove()
    console.log('测试记录已删除')
    
    return {
      success: true,
      message: 'activities集合创建成功'
    }
  } catch (error) {
    console.error('创建activities集合失败:', error)
    return {
      success: false,
      error: error.message || '创建activities集合失败',
      errCode: error.errCode,
      errMsg: error.errMsg
    }
  }
}