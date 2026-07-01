$files = @(
    "src\pages\public\CollegeDetailPage.tsx",
    "src\components\common\DataTable.tsx",
    "src\components\common\ErrorBoundary.tsx",
    "src\components\animations\FloatingCard.tsx",
    "src\components\animations\MeshGradient.tsx",
    "src\components\modals\Modal.tsx",
    "src\components\auth\ProtectedRoute.tsx",
    "src\components\animations\TypewriterText.tsx"
)

$replacements = @(
    @{ From = "bg-primary-50 dark:bg-primary-900/20"; To = "bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12" },
    @{ From = "dark:bg-primary-900/20";                To = "dark:bg-[#6b5fff]/12" },
    @{ From = "bg-primary-500/10";                     To = "bg-[#6b5fff]/10" },
    @{ From = "bg-primary-500/20";                     To = "bg-[#6b5fff]/20" },
    @{ From = "bg-primary-500/25";                     To = "bg-[#6b5fff]/25" },
    @{ From = "bg-primary-500";                        To = "bg-[#6b5fff]" },
    @{ From = "bg-primary-50";                         To = "bg-[#6b5fff]/8" },
    @{ From = "from-primary-600 to-accent-500";        To = "from-[#6b5fff] to-[#06b6d4]" },
    @{ From = "from-primary-600 to-primary-500";       To = "from-[#6b5fff] to-[#8b5cf6]" },
    @{ From = "from-primary-500 to-purple-600";        To = "from-[#6b5fff] to-[#a855f7]" },
    @{ From = "from-primary-500 to-accent-500";        To = "from-[#6b5fff] to-[#06b6d4]" },
    @{ From = "from-primary-500 to-purple-500";        To = "from-[#6b5fff] to-[#a855f7]" },
    @{ From = "from-primary-600";                      To = "from-[#6b5fff]" },
    @{ From = "from-primary-500";                      To = "from-[#6b5fff]" },
    @{ From = "to-primary-600";                        To = "to-[#8b5cf6]" },
    @{ From = "to-primary-500";                        To = "to-[#8b5cf6]" },
    @{ From = "text-primary-700 dark:text-primary-300"; To = "text-[#5b47f0] dark:text-[#a89fff]" },
    @{ From = "text-primary-600 dark:text-primary-400"; To = "text-[#6b5fff] dark:text-[#a89fff]" },
    @{ From = "text-primary-600";                      To = "text-[#6b5fff]" },
    @{ From = "text-primary-500";                      To = "text-[#6b5fff]" },
    @{ From = "text-primary-400";                      To = "text-[#a89fff]" },
    @{ From = "text-primary-300";                      To = "text-[#c4b8ff]" },
    @{ From = "text-primary-100";                      To = "text-[#e4e0ff]" },
    @{ From = "border-primary-500";                    To = "border-[#6b5fff]" },
    @{ From = "border-primary-200 dark:border-primary-800"; To = "border-[#6b5fff]/20 dark:border-[#6b5fff]/30" },
    @{ From = "border-primary-100 dark:border-primary-800"; To = "border-[#6b5fff]/15 dark:border-[#6b5fff]/25" },
    @{ From = "ring-primary-500";                      To = "ring-[#6b5fff]" },
    @{ From = "shadow-primary-500/25";                 To = "shadow-[#6b5fff]/25" },
    @{ From = "shadow-primary-500/30";                 To = "shadow-[#6b5fff]/30" },
    @{ From = "hover:bg-primary-50";                   To = "hover:bg-[#6b5fff]/8" },
    @{ From = "dark:hover:bg-primary-900/20";          To = "dark:hover:bg-[#6b5fff]/12" },
    @{ From = "dark:bg-primary-900/30";                To = "dark:bg-[#6b5fff]/15" },
    @{ From = "dark:bg-primary-900/40";                To = "dark:bg-[#6b5fff]/18" },
    @{ From = "bg-primary-100 dark:bg-primary-900/40"; To = "bg-[#6b5fff]/10 dark:bg-[#6b5fff]/18" },
    @{ From = "bg-primary-100";                        To = "bg-[#6b5fff]/10" },
    @{ From = "bg-primary-900/20";                     To = "bg-[#6b5fff]/12" },
    @{ From = "dark:bg-surface-dark";                  To = "dark:bg-[#060612]" },
    @{ From = "bg-surface-dark";                       To = "bg-[#060612]" },
    @{ From = "dark:bg-surface-card-dark";             To = "dark:bg-[#0e0e20]" },
    @{ From = "bg-surface-card-dark";                  To = "bg-[#0e0e20]" },
    @{ From = "dark:bg-surface-card-light";            To = "dark:bg-[#0e0e20]" },
    @{ From = "dark:border-border-dark";               To = "dark:border-[#1c1c35]" },
    @{ From = "border-border-dark";                    To = "border-[#1c1c35]" },
    @{ From = "border-border-light";                   To = "border-gray-200" },
    @{ From = "dark:text-accent-500";                  To = "dark:text-[#06b6d4]" },
    @{ From = "text-accent-500";                       To = "text-[#06b6d4]" },
    @{ From = "from-primary-700 hover:to-primary-600"; To = "from-[#5b47f0] hover:to-[#7c3aed]" },
    @{ From = "hover:from-primary-700 hover:to-primary-600"; To = "hover:from-[#5b47f0] hover:to-[#7c3aed]" }
)

foreach ($f in $files) {
    $fullPath = Join-Path "c:\Users\anujt\Downloads\campusnavigator" $f
    if (-not (Test-Path $fullPath)) { Write-Output "SKIP (not found): $f"; continue }
    $content = Get-Content $fullPath -Raw
    $original = $content
    foreach ($r in $replacements) {
        $content = $content.Replace($r.From, $r.To)
    }
    if ($content -ne $original) {
        Set-Content $fullPath $content -NoNewline
        Write-Output "FIXED: $f"
    } else {
        Write-Output "OK (no changes): $f"
    }
}
Write-Output "Done."
