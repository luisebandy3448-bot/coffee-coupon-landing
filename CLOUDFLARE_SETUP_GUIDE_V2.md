# Cloudflare 配置指南 - 更新版

## 第二步：创建 Cloudflare Worker（详细步骤）

### 方法一：通过 Workers & Pages 创建（推荐）

#### 步骤 1：进入 Workers 页面

1. 在 Cloudflare Dashboard 左侧菜单中，找到并点击 **"Workers & Pages"**
2. 你会看到两个选项：
   - **"Workers"** - 用于创建独立的 Worker
   - **"Pages"** - 用于创建 Pages 项目
3. 点击页面顶部的 **"Create"** 按钮（蓝色按钮）

#### 步骤 2：选择创建 Worker

在弹出的创建窗口中：
- 你会看到两个标签：**"Workers"** 和 **"Pages"**
- 点击 **"Workers"** 标签
- 然后点击 **"Create Worker"** 按钮

#### 步骤 3：配置 Worker

1. **Worker name**: 输入 `tiktok-events-api`
   - 注意：Worker 名称必须是小写字母、数字和连字符，不能有空格
2. 点击右下角的 **"Deploy"** 按钮
3. 等待部署完成（几秒钟）

#### 步骤 4：编辑 Worker 代码

部署完成后：

**选项 A：使用在线编辑器**

1. 在 Worker 页面，你会看到代码编辑器
2. 点击编辑器中的代码，全选并删除所有默认代码
3. 打开本地文件 `functions/tiktok-event.js`
4. 复制全部内容（Ctrl+A, Ctrl+C）
5. 粘贴到 Cloudflare 编辑器中（Ctrl+V）
6. 点击右上角的 **"Save and deploy"** 按钮

**选项 B：使用 Quick edit**

1. 在 Worker 页面，点击右上角的 **"Quick edit"** 按钮
2. 删除所有默认代码
3. 粘贴 `functions/tiktok-event.js` 的内容
4. 点击 **"Save and deploy"**

---

### 方法二：直接在 Pages 项目中添加 Functions（更简单）

实际上，Cloudflare Pages 可以直接使用 `functions/` 目录中的文件，无需单独创建 Worker！

#### 步骤 1：确认文件结构

确保你的 GitHub 仓库中有以下文件：
```
functions/
  └── tiktok-event.js
functions/
  └── _routes.json
```

#### 步骤 2：重新部署 Pages

1. 进入你的 Pages 项目
2. 点击 **"Deployments"** 标签
3. 点击最新部署右侧的 **"..."** 菜单
4. 选择 **"Retry deployment"**

Cloudflare Pages 会自动检测 `functions/` 目录并部署为 Functions！

#### 步骤 3：设置环境变量

1. 在 Pages 项目中，点击 **"Settings"** 标签
2. 在左侧菜单中，点击 **"Environment variables"**
3. 在 **"Production"** 部分，点击 **"Add variable"**
4. 添加：
   - **Variable name**: `TIKTOK_ACCESS_TOKEN`
   - **Value**: 你的 TikTok Access Token
5. 点击 **"Save"**

#### 步骤 4：重新部署

环境变量设置后，需要重新部署：
1. 回到 **"Deployments"** 标签
2. 点击 **"Retry deployment"**

---

## 推荐方法：使用方法二（更简单）

**为什么推荐方法二？**

1. ✅ 不需要单独创建 Worker
2. ✅ Pages 会自动处理 `functions/` 目录
3. ✅ 代码和配置都在同一个仓库中
4. ✅ 部署更简单，一次部署完成所有内容

**使用此方法，你只需要：**

1. ✅ 确保 `functions/tiktok-event.js` 和 `functions/_routes.json` 已推送到 GitHub
2. ✅ 创建 Pages 项目（第一步）
3. ✅ 在 Pages 设置中添加环境变量
4. ✅ 重新部署

**Function 会自动在 `/api/tiktok-event` 路径可用！**

---

## 验证 Functions 是否部署成功

### 方法 1：检查部署日志

1. 在 Pages 项目中，点击 **"Deployments"** 标签
2. 点击最新的部署
3. 查看构建日志，应该看到类似信息：
   ```
   Functions directory detected
   ```

### 方法 2：测试 API

访问你的 Pages URL + `/api/tiktok-event`，应该看到响应（即使是错误也说明 Function 已部署）

### 方法 3：查看 Functions 标签

1. 在 Pages 项目中，点击 **"Settings"** > **"Functions"**
2. 应该看到列出的 Function：`tiktok-event`

---

## 如果仍然找不到创建 Worker 的选项

### 检查你的 Cloudflare 账户类型

1. 免费账户：可以使用 Workers，但有请求限制
2. 确保你的账户已激活 Workers 功能

### 替代方案：使用 Pages Functions

如果无法创建独立的 Worker，直接使用 Pages Functions（方法二）即可，功能完全相同！

---

## 更新后的完整步骤

1. ✅ **创建 Pages 项目** - 连接 GitHub 仓库
2. ✅ **设置环境变量** - 在 Pages Settings > Environment variables
3. ✅ **重新部署** - 让 Pages 自动检测 functions 目录
4. ✅ **测试** - 访问页面和 API

就这么简单！不需要单独创建 Worker。
