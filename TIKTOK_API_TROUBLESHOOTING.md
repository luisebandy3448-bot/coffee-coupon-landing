# TikTok Events API 问题排查指南

## 为什么 TikTok 接收不到 API 回传数据？

### 1. 检查环境变量

**问题**：Access Token 未设置或设置错误

**解决方法**：
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入你的 Pages 项目 > **Settings** > **Environment variables**
3. 确认 `TIKTOK_ACCESS_TOKEN` 已设置
4. 值应该是：`993fd877bd0c3cdbba3f0910d2e8ae22e30a8dc1`
5. 重新部署项目

### 2. 检查 Cloudflare Worker 日志

**查看日志**：
1. 在 Cloudflare Dashboard 中，进入你的 Pages 项目
2. 点击 **Functions** 标签
3. 找到 `tiktok-event` function
4. 点击查看 **Logs**
5. 检查是否有错误信息

**常见错误**：
- `401 Unauthorized` - Access Token 错误或过期
- `400 Bad Request` - Payload 格式错误
- `403 Forbidden` - Pixel ID 不匹配或权限问题

### 3. 检查 Payload 格式

**当前使用的格式**（v1.3 event/track）：
```json
{
  "event": "ClickButton",
  "event_source": "WEB",
  "event_source_id": "D5N8BT3C77UFLMP0ARDG",
  "event_time": "1234567890",
  "event_id": "ClickButton_1234567890_abc123",
  "context": {
    "page": { "url": "..." },
    "user": { "user_agent": "...", "ip": "..." }
  },
  "properties": {
    "contents": [{
      "content_id": "line_friend_add_button"
    }]
  }
}
```

### 4. 测试 API 调用

**使用 curl 测试**：
```bash
curl -X POST https://你的域名.pages.dev/api/tiktok-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "ClickButton",
    "event_time": 1234567890,
    "url": "https://你的域名.pages.dev/",
    "content_id": "test_content_id"
  }'
```

**在浏览器控制台测试**：
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

### 5. 检查 TikTok Ads Manager

1. 登录 [TikTok Ads Manager](https://ads.tiktok.com/)
2. 进入 **Assets** > **Events** > **Manage Events API**
3. 找到你的 Pixel（coffe117，ID: D5N8BT3C77UFLMP0ARDG）
4. 查看 **Event History** 或 **Test Events**
5. 确认事件是否显示

### 6. 常见问题

#### 问题 A：Access Token 过期
- **症状**：API 返回 401 错误
- **解决**：在 TikTok Ads Manager 中重新生成 Access Token

#### 问题 B：Payload 格式错误
- **症状**：API 返回 400 错误
- **解决**：检查 payload 是否符合 TikTok API 规范

#### 问题 C：content_id 缺失
- **症状**：事件发送成功但 TikTok 警告缺少 content_id
- **解决**：确保所有事件都包含 content_id 参数

#### 问题 D：事件延迟显示
- **症状**：事件发送成功但 TikTok 中看不到
- **解决**：等待 5-15 分钟，事件可能需要时间处理

### 7. 验证步骤

1. ✅ Access Token 已正确设置
2. ✅ 事件成功发送到 Cloudflare Worker
3. ✅ Worker 成功调用 TikTok API
4. ✅ TikTok API 返回成功响应（200）
5. ✅ 在 TikTok Ads Manager 中查看事件（可能需要等待）

### 8. 调试代码

代码中已添加日志记录：
- `console.log('TikTok API Payload:', ...)` - 查看发送的 payload
- `console.log('TikTok API Response Status:', ...)` - 查看响应状态
- `console.log('TikTok API Success:', ...)` - 查看成功响应
- `console.error('TikTok API Error:', ...)` - 查看错误信息

在 Cloudflare Worker 日志中查看这些信息。

### 9. 联系支持

如果以上方法都无法解决问题：
1. 收集 Cloudflare Worker 日志
2. 收集 TikTok API 响应
3. 联系 TikTok 技术支持
