# 解决"已收到服务器事件"未完成的问题

## 问题诊断

根据 TikTok Ads Manager 显示，前三个步骤已完成：
- ✅ 已创建数据集
- ✅ 已安装基础代码  
- ✅ 已收到浏览器事件
- ❌ **已收到服务器事件** - 未完成

## 排查步骤

### 1. 确认环境变量已设置

**在 Cloudflare Dashboard 中：**
1. 进入 Pages 项目 > **Settings** > **Environment variables**
2. 确认 `TIKTOK_ACCESS_TOKEN` 已设置
3. 值应该是：`993fd877bd0c3cdbba3f0910d2e8ae22e30a8dc1`
4. **重要**：环境变量更新后必须重新部署

### 2. 检查 Cloudflare Worker 日志

**查看日志步骤：**
1. 进入 Cloudflare Dashboard > Pages 项目
2. 点击 **Functions** 标签
3. 找到 `tiktok-event` function
4. 点击 **Logs** 标签
5. 查看最近的日志

**查找以下信息：**
- `TikTok API Payload:` - 查看发送的 payload
- `TikTok API Response Status:` - 查看响应状态码
- `TikTok API Success:` - 查看成功响应
- `TikTok API Error:` - 查看错误信息

### 3. 测试事件发送

**在浏览器控制台测试：**
```javascript
fetch('/api/tiktok-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_name: 'ClickButton',
    event_time: Math.floor(Date.now() / 1000),
    url: window.location.href,
    content_id: 'test_server_event'
  })
}).then(r => r.json()).then(console.log);
```

### 4. 常见错误及解决方法

#### 错误 1: 401 Unauthorized
**原因**：Access Token 错误或过期
**解决**：
- 检查环境变量中的 Access Token 是否正确
- 在 TikTok Ads Manager 中重新生成 Access Token
- 更新环境变量并重新部署

#### 错误 2: 400 Bad Request
**原因**：Payload 格式错误
**解决**：
- 查看 Worker 日志中的 payload
- 确认所有必需字段都存在
- 检查 content_id 是否正确传递

#### 错误 3: 403 Forbidden
**原因**：Pixel ID 不匹配或权限问题
**解决**：
- 确认 Pixel ID 是：`D5N8BT3C77UFLMP0ARDG`
- 检查 Access Token 是否有权限访问此 Pixel

#### 错误 4: 没有错误但 TikTok 收不到
**可能原因**：
- 事件发送成功但 TikTok 需要时间处理（5-15分钟）
- 事件被去重（与浏览器事件重复）
- 事件格式虽然正确但缺少必需字段

### 5. 验证事件是否发送成功

**检查方法：**
1. 在 Cloudflare Worker 日志中查看：
   - 状态码应该是 `200`
   - 响应应该包含 `"code": 0` 或类似成功标识

2. 在 TikTok Ads Manager 中：
   - 进入 **Assets** > **Events** > **Manage Events API**
   - 找到 Pixel（coffe117）
   - 查看 **Test Events** 或 **Event History**
   - **注意**：可能需要等待 5-15 分钟才会显示

### 6. 使用测试事件代码（可选）

如果 TikTok 提供了测试事件代码，可以在 payload 中添加：

```javascript
// 在 sendTikTokEvent 函数中添加
await sendTikTokEvent('ClickButton', {
  content_id: 'line_friend_add_button',
  test_event_code: 'YOUR_TEST_CODE' // 如果有的话
});
```

### 7. 确保事件去重正常工作

TikTok 会自动去重浏览器事件和服务器事件。确保：
- `event_id` 在两个来源中保持一致
- 使用相同的 `event_time`
- 事件在 48 小时内发送

## 快速检查清单

- [ ] Access Token 已在 Cloudflare 中设置
- [ ] 环境变量更新后已重新部署
- [ ] 在页面触发了事件（点击按钮等）
- [ ] 检查了 Cloudflare Worker 日志
- [ ] API 返回 200 状态码
- [ ] 等待了 5-15 分钟让 TikTok 处理事件
- [ ] 在 TikTok Ads Manager 中查看了事件历史

## 如果仍然无法解决

1. **收集日志信息**：
   - Cloudflare Worker 的完整日志
   - TikTok API 的响应内容
   - 发送的 payload 内容

2. **联系支持**：
   - TikTok Ads Manager 技术支持
   - 提供 Pixel ID 和 Access Token（如果需要）

3. **检查代码**：
   - 确认所有事件都调用了 `sendTikTokEvent`
   - 确认 content_id 都已传递
   - 确认事件名称正确（ConfirmLine, RejectLine, CopyCode, ClickButton）
