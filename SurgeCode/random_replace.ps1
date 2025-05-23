# 设置替换字符串
$replacement = "⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀⯀"

# 获取所有TS文件
$tsFiles = Get-ChildItem -Path . -Filter "*.ts" -Recurse

Write-Host "Found the following TS files:"
$tsFiles | ForEach-Object { Write-Host $_.FullName }
Write-Host ""

foreach ($file in $tsFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName
    
    # 如果文件行数少于5行，跳过
    if ($content.Count -lt 5) {
        Write-Host "  File has fewer than 5 lines, skipping"
        continue
    }
    
    # 随机选择5个不同的行号
    $lineCount = $content.Count
    $linesToReplace = @()
    
    while ($linesToReplace.Count -lt 5) {
        $randomLine = Get-Random -Minimum 0 -Maximum $lineCount
        if ($linesToReplace -notcontains $randomLine) {
            $linesToReplace += $randomLine
        }
    }
    
    Write-Host "  Lines to replace: $linesToReplace"
    
    # 替换选中的行
    for ($i = 0; $i -lt $content.Count; $i++) {
        if ($linesToReplace -contains $i) {
            $content[$i] = $replacement
        }
    }
    
    # 保存修改后的内容
    $content | Set-Content -Path $file.FullName
    
    Write-Host "  Completed 5 random replacements"
    Write-Host ""
}

Write-Host "All files processed!" 