@echo off
echo ========================================
echo FINAL FIX: Clean Git History
echo ========================================
echo.
echo This will remove:
echo - Large files (meilisearch-windows-amd64.exe)
echo - Exposed API keys (TempUICAPSTONEREP folder)
echo - Database files (data.ms)
echo.
echo WARNING: This rewrites Git history!
echo Press Ctrl+C to cancel, or
pause

echo.
echo Step 1: Removing sensitive files from ALL commits...
git filter-branch -f --index-filter "git rm -rf --cached --ignore-unmatch meilisearch-windows-amd64.exe data.ms dumps TempUICAPSTONEREP *.docx" --prune-empty -- --all

echo.
echo Step 2: Cleaning up Git...
git for-each-ref --format="delete %%(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo Step 3: Force pushing to GitHub...
git push origin main --force

echo.
echo ========================================
echo Done! Check GitHub to verify.
echo ========================================
echo.
echo IMPORTANT: Rotate your API keys!
echo - Groq API: https://console.groq.com
echo - Mistral API: https://console.mistral.ai
echo - Gemini API: https://aistudio.google.com
echo.
pause
