function req($url, $method, $body, $hdrs) {
    if (-not $method) { $method = "GET" }
    if (-not $hdrs)   { $hdrs = @{} }
    $p = @{ Uri=$url; UseBasicParsing=$true; Headers=$hdrs }
    if ($method -ne "GET") { $p.Method=$method; $p.Body=$body; $p.ContentType="application/json" }
    try { return Invoke-WebRequest @p | ConvertFrom-Json }
    catch { Write-Host "    ERR: $($_.Exception.Message)" -ForegroundColor DarkRed; return $null }
}
$pass=0; $fail=0
function check($name, $ok, $detail) {
    if ($ok) { Write-Host "  [PASS] $name  $detail" -ForegroundColor Green; $script:pass++ }
    else      { Write-Host "  [FAIL] $name  $detail" -ForegroundColor Red;   $script:fail++ }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CampusNavigator - Final API Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1 Health
$r = req "http://localhost:5000/api/health"
check "Health endpoint" ($r -and $r.success) "db=$($r.database.status) ai=$($r.ai.status)"

# 2 Colleges list
$r = req "http://localhost:5000/api/colleges?limit=6"
check "Colleges list" ($r -and $r.success -and $r.data.Count -ge 1) "total=$($r.pagination.total)"

# 3 Featured
$r = req "http://localhost:5000/api/colleges/featured"
check "Featured colleges" ($r -and $r.success -and $r.data.colleges.Count -gt 0) "count=$($r.data.colleges.Count)"

# 4 College by ID
$clist = req "http://localhost:5000/api/colleges?limit=1"
$id = $clist.data[0]._id
$r = req "http://localhost:5000/api/colleges/$id"
check "College by ID" ($r -and $r.success -and $r.data.college.name.Length -gt 0) "name=$($r.data.college.name)"

# 5 College reviews
$r = req "http://localhost:5000/api/colleges/$id/reviews"
check "College reviews" ($r -and $r.success)

# 6 Search
$r = req "http://localhost:5000/api/colleges?search=IIT"
check "Search IIT" ($r -and $r.success -and $r.data.Count -gt 0) "found=$($r.data.Count)"

# 7 Register
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$rb = '{"name":"Test User","email":"u' + $ts + '@test.com","password":"Test@1234"}'
$r = req "http://localhost:5000/api/auth/register" "POST" $rb $null
check "Register user" ($r -and $r.success) "role=$($r.data.user.role)"

# 8 Login admin
$r = req "http://localhost:5000/api/auth/login" "POST" '{"email":"admin@campusnavigator.in","password":"Admin@1234"}' $null
$tok = $r.data.tokens.accessToken
check "Admin login" ($r -and $r.success -and $tok.Length -gt 10) "role=$($r.data.user.role)"
$h = @{Authorization="Bearer $tok"}

# 9 /me
$r = req "http://localhost:5000/api/auth/me" "GET" $null $h
check "Auth /me" ($r -and $r.success -and $r.data.user.name.Length -gt 0) "name=$($r.data.user.name)"

# 10 Refresh token
$rlogin2 = req "http://localhost:5000/api/auth/login" "POST" '{"email":"admin@campusnavigator.in","password":"Admin@1234"}' $null
$rt = $rlogin2.data.tokens.refreshToken
$rb2 = '{"refreshToken":"' + $rt + '"}'
$r = req "http://localhost:5000/api/auth/refresh" "POST" $rb2 $null
check "Token refresh" ($r -and $r.success) "newToken=$(if ($r.data.tokens.accessToken.Length -gt 10) {'ok'} else {'fail'})"

# 11 Dashboard stats
$r = req "http://localhost:5000/api/dashboard/stats" "GET" $null $h
check "Dashboard stats" ($r -and $r.success) "bookmarks=$($r.data.bookmarks) colleges=$($r.data.totalColleges)"

# 12 Dashboard activity
$r = req "http://localhost:5000/api/dashboard/activity" "GET" $null $h
check "Dashboard activity" ($r -and $r.success)

# 13 Dashboard analytics
$r = req "http://localhost:5000/api/dashboard/analytics" "GET" $null $h
check "Dashboard analytics" ($r -and $r.success -and $r.data.labels.Count -gt 0)

# 14 Admin stats (new route)
$r = req "http://localhost:5000/api/admin/stats" "GET" $null $h
check "Admin stats" ($r -and $r.success -and $r.data.totalColleges -gt 0) "colleges=$($r.data.totalColleges) users=$($r.data.totalUsers)"

# 15 Admin reviews
$r = req "http://localhost:5000/api/admin/reviews?status=pending" "GET" $null $h
check "Admin reviews" ($r -and $r.success) "count=$($r.data.reviews.Count)"

# 16 Admin user-growth
$r = req "http://localhost:5000/api/admin/analytics/user-growth" "GET" $null $h
check "Admin user-growth" ($r -and $r.success -and $r.data.labels.Count -eq 7) "labels=$($r.data.labels.Count)"

# 17 AI chat
$r = req "http://localhost:5000/api/ai/chat" "POST" '{"message":"What is IIT Bombay known for?"}' $h
check "AI chat" ($r -and $r.success -and $r.data.response.Length -gt 10) "resp_len=$($r.data.response.Length)"

# 18 AI recommendations
$r = req "http://localhost:5000/api/ai/recommendations" "POST" '{"preferences":{"streams":["Engineering"]}}' $h
check "AI recommendations" ($r -and $r.success) "count=$($r.data.recommendations.Count)"

# 19 Bookmark toggle
$rb3 = '{"collegeId":"' + $id + '"}'
$r = req "http://localhost:5000/api/dashboard/bookmarks/toggle" "POST" $rb3 $h
check "Bookmark toggle" ($r -and $r.success)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
$color = if ($fail -eq 0) { "Green" } else { "Yellow" }
Write-Host "  PASSED: $pass  |  FAILED: $fail" -ForegroundColor $color
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
