#!/bin/bash
# FateMap - Session initialization script
# Run at the start of every Ralph loop to verify environment

set -euo pipefail

echo "=== FateMap Session Init ==="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Build safety check (CRITICAL — rollback broken commits)
# Only check if there's actual app code (src/app exists)
echo "--- Build Safety Check ---"
if [[ -f "package.json" ]] && [[ -d "node_modules" ]] && [[ -d "src/app" ]]; then
    if ! npm run build --silent 2>/dev/null; then
        echo "WARN: Last commit has broken build. Auto-reverting..."
        git revert HEAD --no-edit
        npm install --silent 2>/dev/null
        if ! npm run build --silent 2>/dev/null; then
            echo "FAIL: Still broken after revert. Manual intervention needed."
            exit 1
        fi
        echo "Auto-reverted broken commit. Clean state restored."
    else
        echo "Build OK"
    fi
fi
echo ""

# 2. Verify we're in the right directory
if [[ ! -f "CLAUDE.md" ]]; then
    echo "ERROR: Not in fatemap project root"
    exit 1
fi

# 3. Verify harness files exist
for f in features.json progress.txt CLAUDE.md; do
    if [[ ! -f "$f" ]]; then
        echo "ERROR: Missing harness file: $f"
        exit 1
    fi
done

# 4. Check node_modules
if [[ -f "package.json" ]] && [[ ! -d "node_modules" ]]; then
    echo "Installing npm dependencies..."
    npm install
fi

# 5. Git status
echo "--- Git Status ---"
git status --short
echo ""
echo "Last 5 commits:"
git log --oneline -5 2>/dev/null || echo "(no commits yet)"
echo ""

# 6. Feature status summary
echo "--- Feature Status ---"
total=$(grep -c '"id"' features.json || true)
done_count=$(grep -c '"status": "done"' features.json || true)
backlog=$(grep -c '"status": "backlog"' features.json || true)
echo "  Total: $total | Done: $done_count | Backlog: $backlog"
echo ""

# 7. Last progress entry
echo "--- Last Progress Entry ---"
tail -5 progress.txt 2>/dev/null || echo "(no progress yet)"
echo ""

echo "=== Init Complete ==="
