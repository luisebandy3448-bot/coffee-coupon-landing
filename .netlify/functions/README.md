# TikTok Events API - Netlify Function 配置说明

## 环境变量配置

在 Netlify 中设置以下环境变量：

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 进入你的站点设置 (Site settings)
3. 点击 "Environment variables"
4. 添加以下变量：

```
变量名: TIKTOK_ACCESS_TOKEN
值: [你的 TikTok Access Token]
```

## 如何获取 TikTok Access Token

1. 登录 [TikTok Ads Manager](https://ads.tiktok.com/)
2. 进入 "Events" > "Manage Events API"
3. 找到你的 Pixel (coffe117)
4. 点击 "Generate Access Token"
5. 复制生成的 Token（只显示一次，请妥善保存）

## 事件类型

Function 支持以下事件类型：

- `ConfirmLine` - 用户确认拥有LINE
- `RejectLine` - 用户拒绝或不满足条件
- `CopyCode` - 用户复制密码代码
- `ClickButton` - 用户点击LINE按钮

## API 端点

Function URL: `https://io-kr.netlify.app/.netlify/functions/tiktok-event`

## 请求示例

```javascript
fetch('https://io-kr.netlify.app/.netlify/functions/tiktok-event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_name: 'click_line',
    event_time: Math.floor(Date.now() / 1000),
    url: window.location.href,
    content_id: 'line_friend_add_button'
  })
});
```

## 测试

部署后可以通过以下方式测试：

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
