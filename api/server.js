import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dayjs from 'dayjs'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'zhongdao-mall-secret-key'

// CSRF令牌存储
const csrfTokens = new Map()
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24小时

// 模拟用户数据
const users = new Map()
const smsCodes = new Map()
const products = []

// 初始化一些测试数据
const initTestData = () => {
  // 添加测试用户
  users.set('13800138000', {
    id: 'user_001',
    phone: '13800138000',
    password: bcrypt.hashSync('123456', 10),
    name: '测试用户',
    avatar: 'https://via.placeholder.com/100',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })

  // 添加测试商品
  products.push(
    {
      id: 'prod_001',
      name: 'iPhone 15 Pro',
      price: 7999,
      originalPrice: 8999,
      image: 'https://via.placeholder.com/300x300/4F46E5/ffffff?text=iPhone+15+Pro',
      description: '最新款iPhone，配备A17 Pro芯片',
      category: '手机数码',
      stock: 100,
      sales: 50
    },
    {
      id: 'prod_002',
      name: 'MacBook Air M2',
      price: 8999,
      originalPrice: 9999,
      image: 'https://via.placeholder.com/300x300/10B981/ffffff?text=MacBook+Air+M2',
      description: '轻薄便携，性能强劲的笔记本电脑',
      category: '电脑办公',
      stock: 50,
      sales: 30
    },
    {
      id: 'prod_003',
      name: 'AirPods Pro 2',
      price: 1899,
      originalPrice: 1999,
      image: 'https://via.placeholder.com/300x300/F59E0B/ffffff?text=AirPods+Pro+2',
      description: '主动降噪无线耳机',
      category: '耳机音响',
      stock: 200,
      sales: 150
    }
  )
}

// 清理过期的CSRF令牌
const cleanupExpiredTokens = () => {
  const now = Date.now()
  for (const [token, timestamp] of csrfTokens.entries()) {
    if (now - timestamp > CSRF_TOKEN_EXPIRY) {
      csrfTokens.delete(token)
    }
  }
}

// 定期清理过期令牌
setInterval(cleanupExpiredTokens, 60 * 60 * 1000) // 每小时清理一次

// CORS配置
const corsOptions = {
  origin: [
    'http://localhost:5173',  // H5前端
    'http://localhost:5174',  // 管理后台
    'http://localhost:5175',  // H5前端（新端口）
    'http://localhost:3000',  // 本服务
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:3000'
  ],
  credentials: true, // 允许发送cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'X-Requested-With'],
  exposedHeaders: ['x-csrf-token']
}

// 中间件
app.use(helmet({
  contentSecurityPolicy: false, // 禁用CSP以便开发
  crossOriginEmbedderPolicy: false // 允许跨域资源加载
}))
app.use(cors(corsOptions))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100次请求
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '请求过于频繁，请稍后再试'
    }
  }
})
app.use('/api/', limiter)

// CSRF中间件
const csrfMiddleware = (req, res, next) => {
  // 为GET请求生成CSRF令牌
  if (req.method === 'GET') {
    const token = uuidv4()
    csrfTokens.set(token, Date.now())
    
    res.cookie('csrf_token', token, {
      httpOnly: false, // 允许前端JavaScript读取
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: CSRF_TOKEN_EXPIRY
    })
    
    res.setHeader('x-csrf-token', token)
  }
  
  // 验证非GET请求的CSRF令牌
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const cookieToken = req.cookies.csrf_token
    const headerToken = req.headers['x-csrf-token']
    const bodyToken = req.body._csrf
    
    // 检查令牌是否存在且有效
    if (!cookieToken || !csrfTokens.has(cookieToken)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'CSRF令牌缺失或已过期'
        }
      })
    }
    
    // 验证令牌匹配
    if (cookieToken !== headerToken && cookieToken !== bodyToken) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'CSRF令牌不匹配'
        }
      })
    }
  }
  
  next()
}

// 应用CSRF中间件到所有路由
app.use(csrfMiddleware)

// JWT验证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: '未提供认证令牌'
      }
    })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: '认证令牌无效'
      }
    })
  }
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    service: 'zhongdao-mall-api'
  })
})

// 短信验证码发送
app.post('/api/v1/sms/send-code', async (req, res) => {
  try {
    const { phone } = req.body
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PHONE',
          message: '手机号格式不正确'
        }
      })
    }
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 存储验证码（5分钟有效）
    smsCodes.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    })
    
    // 模拟发送短信（实际项目中这里调用短信服务商API）
    console.log(`短信验证码已发送到 ${phone}: ${code}`)
    
    res.json({
      success: true,
      message: '验证码已发送',
      debug: {
        code, // 开发环境显示验证码，方便测试
        phone
      }
    })
  } catch (error) {
    console.error('发送短信验证码失败:', error)
    res.status(500).json({
      error: {
        code: 'SMS_SEND_FAILED',
        message: '发送验证码失败'
      }
    })
  }
})

// 短信验证码验证
app.post('/api/v1/sms/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body
    
    if (!phone || !code) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '缺少必要参数'
        }
      })
    }
    
    const smsData = smsCodes.get(phone)
    
    if (!smsData) {
      return res.status(400).json({
        error: {
          code: 'CODE_NOT_FOUND',
          message: '验证码不存在'
        }
      })
    }
    
    if (Date.now() > smsData.expiresAt) {
      smsCodes.delete(phone)
      return res.status(400).json({
        error: {
          code: 'CODE_EXPIRED',
          message: '验证码已过期'
        }
      })
    }
    
    if (smsData.code !== code) {
      smsData.attempts++
      if (smsData.attempts >= 3) {
        smsCodes.delete(phone)
        return res.status(400).json({
          error: {
            code: 'MAX_ATTEMPTS_EXCEEDED',
            message: '验证次数过多，请重新获取验证码'
          }
        })
      }
      return res.status(400).json({
        error: {
          code: 'INVALID_CODE',
          message: '验证码错误'
        }
      })
    }
    
    // 验证成功，生成JWT令牌
    const user = users.get(phone) || {
      id: `user_${Date.now()}`,
      phone,
      name: `用户${phone.slice(-4)}`,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    
    if (!users.has(phone)) {
      users.set(phone, user)
    }
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // 清理验证码
    smsCodes.delete(phone)
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar || 'https://via.placeholder.com/100'
      }
    })
  } catch (error) {
    console.error('验证短信验证码失败:', error)
    res.status(500).json({
      error: {
        code: 'VERIFICATION_FAILED',
        message: '验证失败'
      }
    })
  }
})

// 密码登录
app.post('/api/v1/auth/password-login', async (req, res) => {
  try {
    const { phone, password } = req.body
    
    if (!phone || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '缺少必要参数'
        }
      })
    }
    
    const user = users.get(phone)
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '手机号或密码错误'
      })
    }
    
    // 验证密码（这里简化处理，实际项目中应该使用bcrypt等加密方式）
    if (password !== '123456') { // 开发环境默认密码
      return res.status(400).json({
        success: false,
        message: '手机号或密码错误'
      })
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar || 'https://via.placeholder.com/100'
      }
    })
  } catch (error) {
    console.error('密码登录失败:', error)
    res.status(500).json({
      success: false,
      message: '登录失败'
    })
  }
})

// 密码注册
app.post('/api/v1/auth/password-register', async (req, res) => {
  try {
    const { phone, password, referralCode, wxUserId } = req.body
    
    if (!phone || !password || !referralCode) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '缺少必要参数'
        }
      })
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PASSWORD',
          message: '密码长度至少6位'
        }
      })
    }
    
    // 检查用户是否已存在
    if (users.has(phone)) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          message: '该手机号已注册'
        }
      })
    }
    
    // 创建新用户
    const user = {
      id: `user_${Date.now()}`,
      phone,
      password: bcrypt.hashSync(password, 10), // 加密存储密码
      name: `用户${phone.slice(-4)}`,
      avatar: 'https://via.placeholder.com/100',
      referralCode,
      wxUserId,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    
    users.set(phone, user)
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('密码注册失败:', error)
    res.status(500).json({
      error: {
        code: 'REGISTER_FAILED',
        message: '注册失败'
      }
    })
  }
})

// 用户登录（短信验证并绑定）
app.post('/api/v1/sms/verify-and-bind', async (req, res) => {
  try {
    const { phone, code } = req.body
    
    if (!phone || !code) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: '缺少必要参数'
        }
      })
    }
    
    const smsData = smsCodes.get(phone)
    
    if (!smsData || smsData.code !== code || Date.now() > smsData.expiresAt) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CODE',
          message: '验证码无效或已过期'
        }
      })
    }
    
    // 查找或创建用户
    let user = users.get(phone)
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        phone,
        name: `用户${phone.slice(-4)}`,
        avatar: 'https://via.placeholder.com/100',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      users.set(phone, user)
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id, 
        phone: user.phone,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    // 清理验证码
    smsCodes.delete(phone)
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('用户登录失败:', error)
    res.status(500).json({
      error: {
        code: 'LOGIN_FAILED',
        message: '登录失败'
      }
    })
  }
})

// 获取用户信息
app.get('/api/v1/user/info', authMiddleware, (req, res) => {
  const user = users.get(req.user.phone)
  if (!user) {
    return res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: '用户不存在'
      }
    })
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  })
})

// 获取商品列表
app.get('/api/v1/products', (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query
  
  let filteredProducts = [...products]
  
  // 按分类筛选
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category)
  }
  
  // 按搜索关键词筛选
  if (search) {
    const keyword = search.toLowerCase()
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  }
  
  // 分页
  const start = (page - 1) * limit
  const end = start + parseInt(limit)
  const paginatedProducts = filteredProducts.slice(start, end)
  
  res.json({
    success: true,
    data: {
      products: paginatedProducts,
      total: filteredProducts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(filteredProducts.length / limit)
    }
  })
})

// 获取商品详情
app.get('/api/v1/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id)
  
  if (!product) {
    return res.status(404).json({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: '商品不存在'
      }
    })
  }
  
  res.json({
    success: true,
    data: product
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '接口不存在'
    }
  })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '服务器内部错误'
    }
  })
})

// 初始化数据
initTestData()

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 中道商城API服务器启动成功！`)
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`🔧 API前缀: /api/v1`)
  console.log(`🌐 CORS允许的域名:`, corsOptions.origin)
  console.log(`🔑 CSRF保护: 已启用`)
  console.log(`📱 短信验证码: 开发环境显示在控制台`)
  console.log('')
  console.log('📋 可用接口:')
  console.log('  GET  /api/health                    - 健康检查')
  console.log('  POST /api/v1/sms/send-code          - 发送短信验证码')
  console.log('  POST /api/v1/sms/verify-code        - 验证短信验证码')
  console.log('  POST /api/v1/sms/verify-and-bind    - 短信验证并登录')
  console.log('  GET  /api/v1/user/info              - 获取用户信息')
  console.log('  GET  /api/v1/products               - 获取商品列表')
  console.log('  GET  /api/v1/products/:id           - 获取商品详情')
})

export default app