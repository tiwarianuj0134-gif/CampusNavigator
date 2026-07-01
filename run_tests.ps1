# CampusNavigator - Complete Test Suite
# Usage: powershell -ExecutionPolicy Bypass -File run_tests.ps1

$ErrorActionPreference = "SilentlyContinue"
$pass = 0; $fail = 0

function ok($name, $cond, $detail = "") {
    if ($cond) {
        Write-Host ("  PASS  {0,-38} {1}" -f $name, $detail) -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host ("  FAIL  {0,-38} {1}" -f $name, $detail) -ForegroundColor Red
        $script:fail++
    }
}

function GET($url, $headers = @{}) {
    try { return (Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 25 | ConvertFrom-Json) }
    catch { return $null }
}

function POST($url, $body, $headers = @{}) {
    try { return (Invoke-WebRequest -Uri $url -Method POST -Body $body -ContentType "application/json" -Headers $headers -UseBasicParsing -TimeoutSec 25 | ConvertFrom-Json) }
    catch { return $null }
}

$BASE = "http://localhost:5000/api"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CampusNavigator  Complete Test Suite         " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PUBLIC ENDPOINTS" -ForegroundColor DarkYellow
Write-Host ""

# 1. Health
$r = GET "$BASE/health"
ok "1. Health check" ($r -and $r.success -and $r.database.status -eq "connected") "colleges=$($r.database.colleges) ai=$($r.ai.status)"

# 2. Colleges list
$r = GET "$BASE/colleges?limit=6"
ok "2. Colleges list" ($r -and $r.success -and $r.pagination.total -ge 100) "total=$($r.pagination.total)"
$firstCollegeId = if ($r -and $r.data.Count -gt 0) { $r.data[0]._id } else { $null }

# 3. Featured colleges
$r = GET "$BASE/colleges/featured"
ok "3. Featured colleges" ($r -and $r.success -and $r.data.colleges.Count -ge 3) "count=$($r.data.colleges.Count)"

# 4. College by ID
$r = GET "$BASE/colleges/$firstCollegeId"
ok "4. College by ID" ($r -and $r.success -and $r.data.college.name.Length -gt 2) "name=$($r.data.college.name)"

# 5. College reviews
$r = GET "$BASE/colleges/$firstCollegeId/reviews"
ok "5. College reviews" ($r -and $r.success)

# 6. Search by keyword
$r = GET "$BASE/colleges?search=IIT"
ok "6. Search keyword=IIT" ($r -and $r.success -and $r.data.Count -gt 0) "found=$($r.data.Count)"

# 7. Search by stream
$r = GET "$BASE/colleges?stream=Engineering"
ok "7. Search stream=Engineering" ($r -and $r.success -and $r.data.Count -gt 0) "found=$($r.data.Count)"

Write-Host ""
Write-Host "  AUTH ENDPOINTS" -ForegroundColor DarkYellow
Write-Host ""

# 8. Register new user
$ts  = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$r = POST "$BASE/auth/register" ('{"name":"Test Student","email":"test' + $ts + '@demo.com","password":"Test@1234"}')
ok "8. Register new user" ($r -and $r.success -and $r.data.user.role -eq "user") "role=$($r.data.user.role)"

# 9. Login admin
$r = POST "$BASE/auth/login" '{"email":"admin@campusnavigator.in","password":"Admin@1234"}'
ok "9. Admin login" ($r -and $r.success -and $r.data.user.role -eq "admin") "role=$($r.data.user.role)"
$tok = if ($r) { $r.data.tokens.accessToken } else { "" }
$rft = if ($r) { $r.data.tokens.refreshToken } else { "" }
$ah  = @{ Authorization = "Bearer $tok" }

# 10. Auth /me
$r = GET "$BASE/auth/me" $ah
ok "10. Auth /me" ($r -and $r.success -and $r.data.user.name.Length -gt 0) "name=$($r.data.user.name)"

# 11. Token refresh
$r = POST "$BASE/auth/refresh" ('{"refreshToken":"' + $rft + '"}')
ok "11. Token refresh" ($r -and $r.success -and $r.data.tokens.accessToken.Length -gt 10)

Write-Host ""
Write-Host "  DASHBOARD ENDPOINTS (requires auth)" -ForegroundColor DarkYellow
Write-Host ""

# 12. Dashboard stats
$r = GET "$BASE/dashboard/stats" $ah
ok "12. Dashboard stats" ($r -and $r.success) "bookmarks=$($r.data.bookmarks)"

# 13. Dashboard activity
$r = GET "$BASE/dashboard/activity" $ah
ok "13. Dashboard activity" ($r -and $r.success)

# 14. Dashboard analytics
$r = GET "$BASE/dashboard/analytics" $ah
ok "14. Dashboard analytics" ($r -and $r.success -and $r.data.labels.Count -gt 0) "labels=$($r.data.labels.Count)"

# 15. Bookmark toggle
$r = POST "$BASE/dashboard/bookmarks/toggle" ('{"collegeId":"' + $firstCollegeId + '"}') $ah
ok "15. Bookmark toggle" ($r -and $r.success)

Write-Host ""
Write-Host "  ADMIN ENDPOINTS (requires admin role)" -ForegroundColor DarkYellow
Write-Host ""

# 16. Admin stats
$r = GET "$BASE/admin/stats" $ah
ok "16. Admin stats" ($r -and $r.success -and $r.data.totalColleges -ge 100) "colleges=$($r.data.totalColleges) users=$($r.data.totalUsers)"

# 17. Admin reviews
$r = GET "$BASE/admin/reviews?status=pending" $ah
ok "17. Admin reviews (pending)" ($r -and $r.success) "count=$($r.data.reviews.Count)"

# 18. Admin user growth
$r = GET "$BASE/admin/analytics/user-growth" $ah
ok "18. Admin user growth" ($r -and $r.success -and $r.data.labels.Count -eq 7) "months=$($r.data.labels.Count)"

Write-Host ""
Write-Host "  AI ENDPOINTS (Gemini AI)" -ForegroundColor DarkYellow
Write-Host ""

# 19. AI chat
$r = POST "$BASE/ai/chat" '{"message":"What is IIT Delhi known for?"}' $ah
ok "19. AI chat" ($r -and $r.success -and $r.data.response.Length -gt 10) "resp_len=$($r.data.response.Length)"

# 20. AI recommendations
$r = POST "$BASE/ai/recommendations" '{"preferences":{"streams":["Engineering"]}}' $ah
ok "20. AI recommendations" ($r -and $r.success -and $r.data.recommendations.Count -gt 0) "count=$($r.data.recommendations.Count)"

# 21. AI enrich college
$r = POST "$BASE/ai/enrich-college" '{"name":"IIT Bombay","city":"Mumbai","state":"Maharashtra"}' $ah
ok "21. AI enrich college" ($r -and $r.success)

Write-Host ""
Write-Host "  FRONTEND BUILD" -ForegroundColor DarkYellow
Write-Host ""

# 22. Production build
$buildOk = (Test-Path "c:\Users\anujt\Downloads\campusnavigator\dist\index.html")
ok "22. Production build exists" $buildOk "dist/index.html"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
$total = $pass + $fail
$color = if ($fail -eq 0) { "Green" } else { "Yellow" }
Write-Host ("  TOTAL {0}   PASSED {1}   FAILED {2}" -f $total, $pass, $fail) -ForegroundColor $color
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
