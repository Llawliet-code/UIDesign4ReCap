@echo off
echo ========================================
echo Fixing Git History - Removing Large Files
echo ========================================
echo.

REM Step 1: Remove large files from Git history
echo Step 1: Removing large files from Git history...
git filter-branch -f --index-filter "git rm -rf --cached --ignore-unmatch meilisearch-windows-amd64.exe data.ms dumps TempUICAPSTONEREP *.docx" --prune-empty --tag-name-filter cat -- --all

REM Step 2: Clean up
echo.
echo Step 2: Cleaning up...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

REM Step 3: Force push
echo.
echo Step 3: Ready to force push!
echo.
echo WARNING: This will rewrite history on GitHub.
echo Press Ctrl+C to cancel, or
pause

git push origin main --force

echo.
echo ========================================
echo Done! Large files removed from history.
echo ========================================
pause
