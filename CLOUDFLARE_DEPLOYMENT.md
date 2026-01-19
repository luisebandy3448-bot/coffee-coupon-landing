# Cloudflare Pages + Workers 部署指南

## 部署步骤

### 第一步：准备代码

代码已经准备好，包含：
- `index.html` - 落地页
- `functions/tiktok-event.js` - Cloudflare Worker
- `wrangler.toml` - Workers 配置文件

### 第二步：推送代码到 GitHub

如果还没有推送：

```bash
git add .
git commit -m "Add Cloudflare Workers support"
git push origin main
```

### 第三步：在 Cloudflare 中创建项目

#### 3.1 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单选择 **"Workers & Pages"**
3. 点击 **"Create application"**
4. 选择 **"Pages"** 标签
5. 点击 **"Connect to Git"**
6. 授权 Cloudflare 访问你的 GitHub 账号
7. 选择仓库：`luisebandy3448-bot/coffee-coupon-landing`
8. 配置构建设置：
   - **Project name**: `coffee-coupon-landing`（或自定义）
   - **Production branch**: `main`
   - **Build command**: 留空（纯HTML项目不需要构建）
   - **Build output directory**: `/` 或留空
9. 点击 **"Save and Deploy"**

#### 3.2 添加 Cloudflare Worker

1. 在 Cloudflare Dashboard 中，进入 **"Workers & Pages"**
2. 点击 **"Create application"**
3. 选择 **"Workers"** 标签
4. 点击 **"Create Worker"**
5. 配置：
   - **Worker name**: `tiktok-events-api`
   - 点击 **"Deploy"**
6. 在 Worker 编辑器中，删除默认代码，粘贴 `functions/tiktok-event.js` 的内容
7. 点击 **"Save and Deploy"**

### 第四步：配置环境变量

#### 4.1 在 Worker 中设置环境变量

1. 在 Worker 页面，点击 **"Settings"** 标签
2. 滚动到 **"Variables"** 部分
3. 点击 **"Add variable"**
4. 添加：
   - **Variable name**: `TIKTOK_ACCESS_TOKEN`
   - **Value**: 你的 TikTok Access Token
5. 点击 **"Save"**

#### 4.2 绑定 Worker 到 Pages

1. 进入你的 Pages 项目
2. 点击 **"Settings"** > **"Functions"**
3. 在 **"Production"** 部分，点击 **"Add function"**
4. 选择你创建的 Worker：`tiktok-events-api`
5. 设置路由：`/api/tiktok-event`
6. 点击 **"Save"**

### 第五步：更新前端代码中的 API 端点

更新 `index.html` 中的 API 端点：

将：
```javascript
'https://io-kr.netlify.app/.netlify/functions/tiktok-event'
```

改为：
```javascript
'/api/tiktok-event'
```

或者使用完整URL（如果使用自定义域名）：
```javascript
'https://你的域名.com/api/tiktok-event'
```

### 第六步：重新部署

1. 更新代码后，推送到 GitHub
2. Cloudflare Pages 会自动检测并重新部署
3. 或者手动触发：在 Pages 项目中点击 **"Retry deployment"**

---

## 方法二：使用 Wrangler CLI（推荐给开发者）

### 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 登录 Cloudflare

```bash
wrangler login
```

### 配置环境变量

```bash
wrangler secret put TIKTOK_ACCESS_TOKEN
# 然后输入你的 Access Token
```

### 部署 Worker

```bash
wrangler deploy
```

### 绑定到 Pages

在 `wrangler.toml` 中添加：

```toml
[[pages_bindings]]
name = "tiktok-events-api"
```

---

## 验证部署

### 测试 Worker

```bash
curl -X POST https://你的域名.com/api/tiktok-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "ClickButton",
    "event_time": 1234567890,
    "url": "https://你的域名.com/",
    "content_id": "test_content_id"
  }'
```

### 检查日志

1. 在 Cloudflare Dashboard 中进入 Worker
2. 点击 **"Logs"** 标签
3. 查看实时日志和错误信息

---

## 故障排查

### Worker 未响应

1. 检查 Worker 是否已部署
2. 检查路由配置是否正确
3. 查看 Worker 日志

### 环境变量未生效

1. 确认在 Worker Settings 中设置了环境变量
2. 重新部署 Worker
3. 检查变量名称是否正确：`TIKTOK_ACCESS_TOKEN`

### CORS 错误

Worker 代码中已包含 CORS 头，如果仍有问题：
- 检查 `Access-Control-Allow-Origin` 头是否正确设置
- 确认 OPTIONS 请求处理正确

---

## 自定义域名

1. 在 Pages 项目中，点击 **"Custom domains"**
2. 添加你的域名
3. 按照提示配置 DNS 记录
4. 等待 DNS 生效（通常几分钟）

---

## 成本说明

- **Cloudflare Pages**: 免费（每月 500 次构建）
- **Cloudflare Workers**: 免费套餐包含 100,000 次请求/天
- 对于大多数项目，免费套餐足够使用

---

## 下一步

部署成功后：
1. 在落地页测试所有按钮功能
2. 检查 Worker 日志确认事件正在发送
3. 在 TikTok Ads Manager 中查看事件数据
