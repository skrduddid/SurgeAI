# 设置替换字符串
$replacement = "⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀"

# 获取所有TS文件
$tsFiles = Get-ChildItem -Path . -Filter "*.ts" -Recurse

Write-Host "Found TS files:"
$tsFiles | ForEach-Object { Write-Host $_.FullName }
Write-Host ""

foreach ($file in $tsFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw
    
    # 找到所有的括号模式 (xxxx)
    $matches = [regex]::Matches($content, '\(([^()]+)\)')
    
    # 获取匹配数量
    $matchCount = $matches.Count
    Write-Host "  Found $matchCount bracket patterns"
    
    # 确定替换次数
    $replaceCount = 5
    if ($matchCount -lt 5 -and $matchCount -ge 2) {
        $replaceCount = 2
        Write-Host "  Less than 5 patterns, will replace 2"
    }
    elseif ($matchCount -lt 2) {
        Write-Host "  Less than 2 patterns, skipping file"
        continue
    }
    else {
        Write-Host "  Will replace 5 patterns"
    }
    
    # 随机选择要替换的索引
    $indicesToReplace = @()
    $availableIndices = 0..($matchCount-1)
    
    for ($i = 0; $i -lt $replaceCount; $i++) {
        if ($availableIndices.Count -eq 0) {
            break
        }
        
        $randomIndex = Get-Random -Minimum 0 -Maximum $availableIndices.Count
        $indexToReplace = $availableIndices[$randomIndex]
        $indicesToReplace += $indexToReplace
        $availableIndices = $availableIndices | Where-Object { $_ -ne $indexToReplace }
    }
    
    Write-Host "  Bracket indices to replace: $indicesToReplace"
    
    # 执行替换
    $newContent = $content
    $offset = 0
    
    foreach ($index in ($indicesToReplace | Sort-Object)) {
        $match = $matches[$index]
        $originalValue = $match.Groups[1].Value
        $startPos = $match.Groups[1].Index + $offset
        $length = $match.Groups[1].Length
        
        # 在原位置替换括号内容
        $newContent = $newContent.Substring(0, $startPos) + 
                      $replacement + 
                      $newContent.Substring($startPos + $length)
        
        # 调整偏移量
        $offset = $offset + ($replacement.Length - $length)
        
        Write-Host "  Replaced: ($originalValue) -> ($replacement)"
    }
    
    # 保存修改后的内容
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    
    Write-Host "  Completed $($indicesToReplace.Count) bracket replacements"
    Write-Host ""
}

Write-Host "All files processed!" 