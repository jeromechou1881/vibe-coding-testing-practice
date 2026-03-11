# LoginPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [x] 【前端元素】應正確渲染登入頁面的所有元素
**範例輸入**：render LoginPage
**期待輸出**：顯示標題「歡迎回來」、副標題「請登入以繼續」、Email 輸入框（placeholder: you@example.com）、密碼輸入框（placeholder: 至少 8 個字元，需包含英數）、登入按鈕

---

## [x] 【前端元素】應正確渲染表單欄位的 label
**範例輸入**：render LoginPage
**期待輸出**：顯示「電子郵件」和「密碼」兩個 label

---

## [x] 【function 邏輯】email 格式不正確時應顯示錯誤訊息
**範例輸入**：輸入 email = `invalid-email`，點擊登入
**期待輸出**：顯示錯誤訊息「請輸入有效的 Email 格式」

---

## [x] 【function 邏輯】密碼少於 8 個字元時應顯示錯誤訊息
**範例輸入**：輸入 email = `test@test.com`，password = `abc123`，點擊登入
**期待輸出**：顯示錯誤訊息「密碼必須至少 8 個字元」

---

## [x] 【function 邏輯】密碼沒有包含英文字母時應顯示錯誤訊息
**範例輸入**：輸入 email = `test@test.com`，password = `12345678`，點擊登入
**期待輸出**：顯示錯誤訊息「密碼必須包含英文字母和數字」

---

## [x] 【function 邏輯】密碼沒有包含數字時應顯示錯誤訊息
**範例輸入**：輸入 email = `test@test.com`，password = `abcdefgh`，點擊登入
**期待輸出**：顯示錯誤訊息「密碼必須包含英文字母和數字」

---

## [x] 【function 邏輯】email 和密碼皆無效時應同時顯示兩個錯誤
**範例輸入**：輸入 email = `bad`，password = `123`，點擊登入
**期待輸出**：同時顯示「請輸入有效的 Email 格式」和「密碼必須至少 8 個字元」

---

## [x] 【function 邏輯】驗證不通過時不應呼叫 login API
**範例輸入**：輸入 email = `invalid`，password = `short`，點擊登入
**期待輸出**：login 函數不被呼叫

---

## [x] 【Mock API】登入成功後應導向 /dashboard
**範例輸入**：輸入 email = `test@test.com`，password = `Test1234`，點擊登入（MSW 回傳 success）
**期待輸出**：呼叫 navigate('/dashboard', { replace: true })

---

## [x] 【Mock API】登入按鈕在 loading 時應顯示「登入中...」且 disabled
**範例輸入**：輸入合法帳密，點擊登入，API 回應前觀察 UI
**期待輸出**：按鈕文字變為「登入中...」，按鈕為 disabled，輸入框也為 disabled

---

## [x] 【Mock API】API 回傳 401 時應顯示伺服器錯誤訊息
**範例輸入**：輸入合法帳密，點擊登入（MSW 回傳 401 + message: '密碼錯誤'）
**期待輸出**：頁面顯示錯誤 banner「密碼錯誤」(role="alert")

---

## [x] 【Mock API】API 回傳 500 時應顯示預設錯誤訊息
**範例輸入**：輸入合法帳密，點擊登入（MSW 回傳 500 無 message）
**期待輸出**：頁面顯示錯誤 banner「登入失敗，請稍後再試」

---

## [x] 【Mock API】API 錯誤後 loading 狀態應恢復
**範例輸入**：登入失敗後觀察 UI
**期待輸出**：按鈕恢復為「登入」，按鈕和輸入框不再 disabled

---

## [x] 【驗證權限】已登入用戶應自動導向 /dashboard
**範例輸入**：渲染 LoginPage，useAuth 回傳 isAuthenticated = true
**期待輸出**：自動呼叫 navigate('/dashboard', { replace: true })

---

## [x] 【驗證權限】authExpiredMessage 存在時應顯示過期訊息並清除
**範例輸入**：渲染 LoginPage，useAuth 回傳 authExpiredMessage = '登入已過期，請重新登入'
**期待輸出**：頁面顯示該錯誤訊息，且 clearAuthExpiredMessage 被呼叫

---
