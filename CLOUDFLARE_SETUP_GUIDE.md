# Cloudflare 配置完整指南

## 📋 配置步骤概览

1. ✅ 代码已推送到 GitHub
2. ⬜ 创建 Cloudflare Pages 项目
3. ⬜ 创建 Cloudflare Worker
4. ⬜ 设置环境变量
5. ⬜ 绑定 Worker 到 Pages
6. ⬜ 测试部署

---

## 第一步：创建 Cloudflare Pages 项目

### 1.1 登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 使用你的账号登录（如果没有账号，先注册）

### 1.2 创建 Pages 项目

1. 在左侧菜单中，点击 **"Workers & Pages"**
2. 点击页面顶部的 **"Create application"** 按钮
3. 选择 **"Pages"** 标签（不是 Workers）
4. 点击 **"Connect to Git"** 按钮

### 1.3 连接 GitHub 仓库

1. 如果首次使用，点击 **"Connect GitHub"** 授权 Cloudflare 访问你的 GitHub
2. 选择仓库：`luisebandy3448-bot/coffee-coupon-landing`
3. 点击 **"Begin setup"**

### 1.4 配置构建设置

在配置页面填写：

- **Project name**: `coffee-coupon-landing`（或自定义名称）
- **Production branch**: `main`
- **Framework preset**: `None` 或 `Plain HTML`
- **Build command**: **留空**（纯HTML项目不需要构建）
- **Build output directory**: `/` 或 **留空**
- **Root directory**: `/` 或 **留空**

### 1.5 部署

1. 点击 **"Save and Deploy"** 按钮
2. 等待部署完成（通常1-2分钟）
3. 部署完成后，你会得到一个 Pages URL，例如：`https://coffee-coupon-landing.pages.dev`

---

## 第二步：配置 Functions（推荐方法 - 更简单）

**重要提示**：Cloudflare Pages 可以直接使用 `functions/` 目录中的文件，无需单独创建 Worker！

### 2.1 确认文件已推送

确保 GitHub 仓库中有以下文件：
- `functions/tiktok-event.js`
- `functions/_routes.json`

### 2.2 设置环境变量（在 Pages 中）

1. 在 Pages 项目中，点击 **"Settings"** 标签
2. 在左侧菜单中，点击 **"Environment variables"**
3. 在 **"Production"** 部分，点击 **"Add variable"**
4. 添加变量：
   - **Variable name**: `TIKTOK_ACCESS_TOKEN`
   - **Value**: 你的 TikTok Access Token
5. 点击 **"Save"**

### 2.3 重新部署 Pages

1. 回到 **"Deployments"** 标签
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Retry deployment"**
4. 等待部署完成

**完成！** Pages 会自动检测 `functions/` 目录并部署为 Functions，无需单独创建 Worker。

---

## 第二步（备选）：创建独立的 Worker

如果你更喜欢使用独立的 Worker（可选方法）：

### 2.1 创建 Worker

1. 在 Cloudflare Dashboard 左侧菜单，点击 **"Workers & Pages"**
2. 点击页面顶部的 **"Create"** 按钮（蓝色按钮）
3. 选择 **"Workers"** 标签
4. 点击 **"Create Worker"** 按钮

### 2.2 配置 Worker

1. **Worker name**: 输入 `tiktok-events-api`（只能使用小写字母、数字和连字符）
2. 点击 **"Deploy"** 按钮

### 2.3 替换 Worker 代码

1. Worker 部署后，点击 **"Quick edit"** 或代码编辑器
2. 删除所有默认代码
3. 复制 `functions/tiktok-event.js` 的全部内容
4. 粘贴到编辑器中
5. 点击 **"Save and deploy"** 按钮

---

## 第三步：设置环境变量

### 3.1 在 Worker 中设置环境变量

1. 在 Worker 页面，点击顶部的 **"Settings"** 标签
2. 向下滚动到 **"Variables"** 部分
3. 在 **"Environment Variables"** 下，点击 **"Add variable"** 按钮
4. 添加变量：
   - **Variable name**: `TIKTOK_ACCESS_TOKEN`
   - **Value**: 粘贴你的 TikTok Access Token
5. 点击 **"Save"** 按钮

### 3.2 获取 TikTok Access Token

如果还没有 Access Token：

1. 登录 [TikTok Ads Manager](https://ads.tiktok.com/)
2. 进入 **"Assets"** > **"Events"** > **"Manage Events API"**
3. 找到你的 Pixel（coffe117，ID: D5N8BT3C77UFLMP0ARDG）
4. 点击 **"Generate Access Token"** 或 **"Manage"** > **"Generate Token"**
5. 复制生成的 Token（**只显示一次，请妥善保存**）

---

## 第四步：绑定 Worker 到 Pages

### 4.1 进入 Pages 设置

1. 回到 **"Workers & Pages"** > **"Pages"**
2. 点击你的项目：`coffee-coupon-landing`
3. 点击顶部的 **"Settings"** 标签
4. 在左侧菜单中，点击 **"Functions"**

### 4.2 添加 Worker 绑定

1. 在 **"Production"** 部分，找到 **"Functions"** 或 **"Workers"** 绑定
2. 点击 **"Add function"** 或 **"Add Worker"** 按钮
3. 在弹出窗口中：
   - **Function/Worker**: 选择 `tiktok-events-api`
   - **Route**: 输入 `/api/tiktok-event`
   - **Method**: 选择 `POST`（或留空表示所有方法）
4. 点击 **"Save"** 按钮

### 4.3 重新部署 Pages

1. 绑定完成后，回到 **"Deployments"** 标签
2. 点击最新的部署右侧的 **"..."** 菜单
3. 选择 **"Retry deployment"** 或 **"Redeploy"**
4. 等待重新部署完成

---

## 第五步：测试部署

### 5.1 测试页面访问

1. 访问你的 Pages URL：`https://coffee-coupon-landing.pages.dev`
2. 确认页面正常加载
3. 测试确认对话框功能
4. 测试复制代码功能
5. 测试 LINE 按钮点击

### 5.2 测试 Worker API

使用浏览器控制台或命令行测试：

```bash
curl -X POST https://coffee-coupon-landing.pages.dev/api/tiktok-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "ClickButton",
    "event_time": 1234567890,
    "url": "https://coffee-coupon-landing.pages.dev/",
    "content_id": "test_content_id"
  }'
```

或者在浏览器控制台运行：

```javascript
fetch('/api/tiktok-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_name: 'ClickButton',
    event_time: Math.floor(Date.now() / 1000),
    url: window.location.href,
    content_id: 'test_content_id'
  })
}).then(r => r.json()).then(console.log);
```

### 5.3 检查日志

1. 在 Worker 页面，点击 **"Logs"** 标签
2. 查看实时日志，确认请求是否成功
3. 如果有错误，检查错误信息并修复

---

## 第六步：配置自定义域名（可选）

### 6.1 添加自定义域名

1. 在 Pages 项目中，点击 **"Custom domains"** 标签
2. 点击 **"Set up a custom domain"** 按钮
3. 输入你的域名（例如：`io-kr.com`）
4. 按照提示配置 DNS 记录

### 6.2 更新 DNS 记录

在你的域名注册商处添加以下 DNS 记录：

- **Type**: `CNAME`
- **Name**: `@` 或 `www`
- **Target**: `coffee-coupon-landing.pages.dev`

等待 DNS 生效（通常几分钟到几小时）

---

## 故障排查

### Worker 返回 404

- 检查 Worker 是否已正确绑定到 Pages
- 确认路由配置为 `/api/tiktok-event`
- 重新部署 Pages 项目

### 环境变量未生效

- 确认变量名称完全匹配：`TIKTOK_ACCESS_TOKEN`（区分大小写）
- 重新部署 Worker
- 检查 Worker 日志中的错误信息

### CORS 错误

- Worker 代码中已包含 CORS 头
- 确认 `Access-Control-Allow-Origin: *` 已设置
- 检查 OPTIONS 请求处理

### TikTok API 返回错误

- 检查 Access Token 是否正确
- 确认 Token 未过期
- 查看 Worker 日志中的详细错误信息
- 验证请求体格式是否正确

---

## 完成检查清单

- [ ] Cloudflare Pages 项目已创建并部署
- [ ] Cloudflare Worker 已创建并部署
- [ ] 环境变量 `TIKTOK_ACCESS_TOKEN` 已设置
- [ ] Worker 已绑定到 Pages 路由 `/api/tiktok-event`
- [ ] 页面可以正常访问
- [ ] 所有按钮功能正常
- [ ] Worker API 可以正常调用
- [ ] 事件成功发送到 TikTok API

---

## 下一步

配置完成后：

1. ✅ 在落地页测试所有功能
2. ✅ 检查 Worker 日志确认事件正在发送
3. ✅ 在 TikTok Ads Manager 中查看事件数据（可能需要几分钟才会显示）
4. ✅ 监控事件跟踪是否正常工作

---

## 需要帮助？

如果遇到问题：

1. 查看 Cloudflare Dashboard 中的日志
2. 检查 Worker 的错误信息
3. 验证环境变量是否正确设置
4. 确认代码已正确部署

祝你部署顺利！🎉
