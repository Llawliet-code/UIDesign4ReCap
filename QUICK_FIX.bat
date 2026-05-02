@echo off
echo ========================================
echo QUICK FIX: Remove Large Files from Git
echo ========================================
echo.
echo This will:
echo 1. Go back to the last good commit (before large files)
echo 2. Re-apply your recent changes
echo 3. Push to GitHub
echo.
echo Press Ctrl+C to cancel, or
pause

REM Go back to the commit before large files were added
git reset --soft f967171

REM Commit all current changes (without large files)
git add .
git commit -m "Clean commit: Groq semantic search + Mistral/Gemini chatbot (no large files)"

REM Force push to GitHub
git push origin main --force

echo.
echo ========================================
echo Done! Check GitHub to verify.
echo ========================================
pause
