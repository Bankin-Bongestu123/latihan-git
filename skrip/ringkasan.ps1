param(
    [string]$Path = "hobi.txt"
)

if (-not (Test-Path $Path)) {
    Write-Host "File hobi.txt tidak ditemukan"
    exit 1
}

$hobi = @(Get-Content $Path -Encoding UTF8 |
    Where-Object { $_ -like "- *" } |
    ForEach-Object { $_.Substring(2).Trim() })

# TODO: kalau $hobi kosong -> "Belum ada hobi", exit 0
# TODO: cetak jumlah
# TODO: cetak daftar terurut (Sort-Object)
# TODO: cetak hobi terpanjang