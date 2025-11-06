# IIS 部署問題診斷指南 - 端口 8008 無法連接

## 🔍 常見問題檢查清單

### 1. ✅ IIS 網站狀態檢查

**檢查網站是否已啟動：**
1. 開啟 **IIS 管理員** (`inetmgr`)
2. 展開 **網站** 節點
3. 確認您的網站狀態是 **已啟動**（圖示為綠色播放符號）
4. 如果顯示 **已停止**，右鍵點擊網站 → **管理網站** → **啟動**

### 2. ✅ IIS 綁定設定檢查

**確認端口 8008 已正確綁定：**
1. 在 IIS 管理員中，右鍵點擊您的網站 → **編輯綁定**
2. 檢查是否有 `http` 類型的綁定，端口為 `8008`
3. 如果沒有，點擊 **新增**：
   - **類型**：`http`
   - **IP 地址**：`全部未指派` 或選擇特定 IP
   - **端口**：`8008`
   - **主機名稱**：（留空，除非使用網域名稱）
4. 點擊 **確定** 並重新啟動網站

### 3. ✅ 應用程式池狀態檢查

**確認應用程式池正在運行：**
1. 在 IIS 管理員中，展開 **應用程式池**
2. 找到您網站使用的應用程式池
3. 確認狀態為 **已啟動**
4. 如果未啟動，右鍵點擊 → **啟動**

**檢查應用程式池設定：**
- **.NET CLR 版本**：應該設為 **無 Managed 程式碼**（ASP.NET Core 不需要）
- **受控管線模式**：設為 **整合式**
- **身分識別**：建議使用 `ApplicationPoolIdentity` 或具有足夠權限的帳號

### 4. ✅ ASP.NET Core 模組安裝檢查

**確認已安裝 ASP.NET Core Hosting Bundle：**
1. 開啟 **控制台** → **程式和功能**
2. 搜尋 **Microsoft ASP.NET Core Runtime** 或 **Microsoft ASP.NET Core Hosting Bundle**
3. 如果沒有安裝，請下載並安裝：
   - 下載網址：https://dotnet.microsoft.com/download/dotnet/8.0
   - 選擇 **ASP.NET Core Runtime 8.0.x - Windows Hosting Bundle**

### 5. ✅ 防火牆設定檢查

**允許端口 8008 通過防火牆：**
1. 開啟 **Windows Defender 防火牆** → **進階設定**
2. 點擊 **輸入規則** → **新增規則**
3. 選擇 **連接埠** → **下一步**
4. 選擇 **TCP**，輸入 **特定本機連接埠**：`8008` → **下一步**
5. 選擇 **允許連線** → **下一步**
6. 勾選所有設定檔（網域、私人、公用）→ **下一步**
7. 輸入名稱：`Soda API Port 8008` → **完成**

**使用 PowerShell 快速設定：**
```powershell
New-NetFirewallRule -DisplayName "Soda API Port 8008" -Direction Inbound -LocalPort 8008 -Protocol TCP -Action Allow
```

### 6. ✅ web.config 檔案檢查

**確認 web.config 存在於發佈目錄：**
1. 確認發佈後的檔案夾中有 `web.config` 檔案
2. 檢查 `web.config` 內容是否正確（已自動生成）
3. 確認 `arguments=".\Soda.dll"` 中的 DLL 名稱正確

### 7. ✅ 應用程式日誌檢查

**查看應用程式錯誤日誌：**
1. 在 IIS 管理員中，開啟您的網站
2. 點擊右側的 **記錄** 圖示
3. 檢查最新的日誌檔案，查看是否有錯誤訊息

**查看 Windows 事件檢視器：**
1. 開啟 **事件檢視器** (`eventvwr.msc`)
2. 展開 **Windows 記錄** → **應用程式**
3. 搜尋與您的應用程式相關的錯誤

### 8. ✅ 端口占用檢查

**確認端口 8008 沒有被其他程式占用：**
```powershell
netstat -ano | findstr :8008
```

如果看到輸出，表示端口已被占用。需要：
- 停止占用端口的程式，或
- 更改 IIS 綁定到其他端口

### 9. ✅ 本機測試

**在伺服器本機測試：**
1. 開啟瀏覽器，訪問：`http://localhost:8008/health`
2. 如果本機可以訪問，但外部無法訪問，可能是：
   - 防火牆問題（見步驟 5）
   - IIS 綁定到特定 IP（見步驟 2）

### 10. ✅ 權限檢查

**確認應用程式池帳號有足夠權限：**
1. 確認發佈目錄的檔案權限
2. 確認應用程式池帳號可以讀取檔案
3. 如果使用資料庫，確認連線字串正確且帳號有權限

## 🛠️ 快速診斷命令

### 檢查 IIS 網站狀態
```powershell
Import-Module WebAdministration
Get-WebSite | Select Name, State, Bindings
```

### 檢查應用程式池狀態
```powershell
Get-WebAppPoolState | Select Name, State
```

### 檢查端口監聽
```powershell
netstat -ano | findstr :8008
```

### 測試本地連接
```powershell
curl http://localhost:8008/health
```

## 📝 常見錯誤與解決方案

### 錯誤：502.5 - Process Failure
**原因**：ASP.NET Core 模組未正確安裝或應用程式無法啟動
**解決**：
1. 安裝 ASP.NET Core Hosting Bundle
2. 檢查 `web.config` 中的 `processPath` 是否正確指向 `dotnet.exe`
3. 檢查應用程式日誌

### 錯誤：無法連接到伺服器
**原因**：防火牆阻擋或端口未正確綁定
**解決**：
1. 檢查防火牆設定（步驟 5）
2. 確認 IIS 綁定設定（步驟 2）
3. 確認網站已啟動（步驟 1）

### 錯誤：應用程式池自動停止
**原因**：應用程式啟動時發生例外
**解決**：
1. 檢查應用程式日誌
2. 確認資料庫連線字串正確
3. 確認 JWT Secret 已設定
4. 檢查應用程式池權限

## ✅ 部署檢查表

部署完成後，請確認：
- [ ] IIS 網站狀態為 **已啟動**
- [ ] 應用程式池狀態為 **已啟動**
- [ ] 端口 8008 已正確綁定
- [ ] 防火牆已允許端口 8008
- [ ] `web.config` 檔案存在且正確
- [ ] ASP.NET Core Hosting Bundle 已安裝
- [ ] 本機可以訪問 `http://localhost:8008/health`
- [ ] 應用程式日誌沒有錯誤訊息

## 🔗 測試連接

部署完成後，測試以下端點：
- `http://your-server-ip:8008/health` - 健康檢查
- `http://your-server-ip:8008/` - 根路徑
- `http://your-server-ip:8008/api/auth/login` - API 端點

如果以上都無法訪問，請按照檢查清單逐步排查。

