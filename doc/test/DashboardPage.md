# DashboardPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】應正確渲染儀表板頁面標題與登出按鈕
**範例輸入**：render DashboardPage（user = { username: 'dean', role: 'admin' }，API 回傳商品）
**期待輸出**：顯示標題「儀表板」、登出按鈕

---

## [x] 【前端元素】應顯示使用者歡迎訊息與頭像
**範例輸入**：render DashboardPage（user = { username: 'dean', role: 'admin' }）
**期待輸出**：顯示「Welcome, dean 👋」、頭像顯示大寫首字母「D」、角色標籤「管理員」

---

## [x] 【前端元素】user 角色時應顯示「一般用戶」且不顯示管理後台連結
**範例輸入**：render DashboardPage（user = { username: 'test', role: 'user' }）
**期待輸出**：角色標籤顯示「一般用戶」，不顯示「🛠️ 管理後台」連結

---

## [x] 【前端元素】admin 角色時應顯示管理後台連結
**範例輸入**：render DashboardPage（user = { username: 'dean', role: 'admin' }）
**期待輸出**：顯示「🛠️ 管理後台」連結，href 指向 /admin

---

## [x] 【Mock API】應在載入中顯示 loading 狀態
**範例輸入**：render DashboardPage，API 延遲回應
**期待輸出**：顯示「載入商品中...」文字與 loading spinner

---

## [x] 【Mock API】商品載入成功後應顯示商品列表
**範例輸入**：render DashboardPage（API 回傳 3 個商品）
**期待輸出**：顯示「商品列表」標題，渲染 3 張商品卡片，每張包含名稱、描述、價格（NT$ 格式）

---

## [x] 【Mock API】商品 API 回傳錯誤時應顯示錯誤訊息
**範例輸入**：render DashboardPage（API 回傳 500 + message: '伺服器錯誤，請稍後再試'）
**期待輸出**：顯示錯誤訊息「伺服器錯誤，請稍後再試」

---

## [x] 【Mock API】商品 API 回傳錯誤且無 message 時應顯示預設訊息
**範例輸入**：render DashboardPage（API 回傳 500 無 message）
**期待輸出**：顯示預設錯誤訊息「無法載入商品資料」

---

## [x] 【function 邏輯】點擊登出按鈕應呼叫 logout 並導向 /login
**範例輸入**：點擊「登出」按鈕
**期待輸出**：呼叫 logout()，呼叫 navigate('/login', { replace: true, state: null })

---
