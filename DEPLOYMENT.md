# Netlify 部署指南

## 第三步：部署到 Netlify

### 方法一：通过 Git 仓库部署（推荐）

#### 1. 准备 Git 仓库

**如果你还没有 Git 仓库：**

```bash
# 在项目目录初始化 Git
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit with TikTok Events API integration"

# 在 GitHub/GitLab/Bitbucket 创建新仓库，然后添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到远程仓库
git push -u origin main
```

**如果你已有 Git 仓库：**

```bash
# 添加所有文件
git add .

# 提交代码
git commit -m "Add TikTok Events API integration"

# 推送到远程仓库
git push
```

#### 2. 在 Netlify 中连接仓库

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 点击 **"Add new site"** > **"Import an existing project"**
3. 选择 **"GitHub"**, **"GitLab"** 或 **"Bitbucket"**
4. 授权 Netlify 访问你的代码仓库
5. 选择你的仓库
6. 配置构建设置：
   - **Branch to deploy**: `main` 或 `master`
   - **Build command**: 留空（纯HTML项目不需要构建）
   - **Publish directory**: `./` 或留空

#### 3. 设置环境变量

在 Netlify Dashboard 中：

1. 进入你的站点（io-kr.netlify.app）
2. 点击 **"Site settings"**
3. 在左侧菜单选择 **"Environment variables"**
4. 点击 **"Add a variable"**
5. 添加：
   - **Key**: `TIKTOK_ACCESS_TOKEN`
   - **Value**: 从 TikTok Ads Manager 获取的 Access Token
6. 点击 **"Save"**

#### 4. 部署

- Netlify 会自动检测推送并触发部署
- 或点击 **"Deploy site"** 手动部署

#### 5. 验证部署

1. 等待部署完成（通常1-2分钟）
2. 访问你的站点：`https://io-kr.netlify.app`
3. 测试 Function 是否工作：
   ```
   https://io-kr.netlify.app/.netlify/functions/tiktok-event
   ```

---

### 方法二：通过 Netlify CLI 部署

#### 1. 安装 Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. 登录 Netlify

```bash
netlify login
```

#### 3. 初始化项目

```bash
netlify init
```

按照提示：
- 选择 "Create & configure a new site"
- 输入站点名称（或使用默认）
- 选择团队（如果有）
- 构建命令：按回车（不需要）
- 发布目录：按回车（使用当前目录）

#### 4. 设置环境变量

```bash
netlify env:set TIKTOK_ACCESS_TOKEN "你的AccessToken"
```

#### 5. 部署

```bash
netlify deploy --prod
```

#### 6. 验证

访问 `https://io-kr.netlify.app` 查看部署结果

---

### 方法三：通过拖拽部署（仅 HTML 文件，不包含 Function）

⚠️ **注意**：这个方法只能部署 HTML 文件，Netlify Functions 需要 Git 或 CLI 部署。

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 点击 **"Add new site"** > **"Deploy manually"**
3. 将 `index.html` 拖拽到部署区域
4. 等待部署完成

---

## 验证 Function 是否部署成功

### 方法1：通过浏览器

访问：
```
https://io-kr.netlify.app/.netlify/functions/tiktok-event
```

应该看到错误信息（因为是 GET 请求，Function 只接受 POST），这说明 Function 已部署。

### 方法2：通过命令行测试

```bash
curl -X POST https://io-kr.netlify.app/.netlify/functions/tiktok-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "ClickButton",
    "event_time": 1234567890,
    "url": "https://io-kr.netlify.app/",
    "content_id": "test_content_id"
  }'
```

### 方法3：通过 Netlify Dashboard

1. 进入 **"Functions"** 标签
2. 应该看到 `tiktok-event` Function
3. 点击可以查看日志和调用历史

---

## 故障排查

### Function 未显示

1. 确认 `.netlify/functions/tiktok-event.js` 文件存在
2. 确认文件已提交到 Git
3. 检查 Netlify 构建日志

### 环境变量未生效

1. 确认环境变量名称：`TIKTOK_ACCESS_TOKEN`（完全匹配，区分大小写）
2. 重新部署站点：Environment variables 更改后需要重新部署
3. 检查 Function 日志查看错误信息

### Function 返回错误

1. 查看 Netlify Dashboard > Functions > tiktok-event > Logs
2. 检查错误信息
3. 确认 Access Token 是否正确设置

---

## 下一步

部署成功后：
1. 在落地页测试所有按钮功能
2. 检查 Netlify Function 日志确认事件正在发送
3. 在 TikTok Ads Manager 中查看事件数据（可能需要几分钟才会显示）
