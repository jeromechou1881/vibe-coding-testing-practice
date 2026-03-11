# AdminPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】應正確渲染管理後台頁面的所有元素
**範例輸入**：render AdminPage（user = { username: 'dean', role: 'admin' }）
**期待輸出**：顯示標題「🛠️ 管理後台」、返回連結「← 返回」（指向 /dashboard）、角色標籤「管理員」、登出按鈕

---

## [x] 【前端元素】應顯示管理員專屬頁面資訊卡內容
**範例輸入**：render AdminPage
**期待輸出**：顯示「管理員專屬頁面」標題及三個功能說明：「只有 admin 角色可以訪問」、「user 角色會被重定向」、「受路由守衛保護」

---

## [x] 【前端元素】user 角色時應顯示「一般用戶」標籤
**範例輸入**：render AdminPage（user = { username: 'test', role: 'user' }）
**期待輸出**：角色標籤顯示「一般用戶」

---

## [x] 【function 邏輯】點擊登出按鈕應呼叫 logout 並導向 /login
**範例輸入**：點擊「登出」按鈕
**期待輸出**：呼叫 logout()，呼叫 navigate('/login', { replace: true, state: null })

---

## [x] 【前端元素】返回連結應指向 /dashboard
**範例輸入**：render AdminPage
**期待輸出**：「← 返回」連結的 href 為 /dashboard

---
