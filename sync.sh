#!/bin/bash

# OPEX Auto-Sync Script
# Watches ~/.config/opencode/ and auto-pushes changes to GitHub
# Usage: ./sync.sh (run in background)

set -e

REPO_DIR="/home/ubuntu/opex"
GLOBAL_DIR="/home/ubuntu/.config/opencode"
LOCK_FILE="/tmp/opex-sync.lock"
DEBOUNCE_SECONDS=10

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

sync_to_repo() {
    log "Syncing changes..."
    
    # Copy agents
    rsync -av --delete "$GLOBAL_DIR/agents/" "$REPO_DIR/agents/" 2>/dev/null || true
    
    # Copy skills
    rsync -av --delete "$GLOBAL_DIR/skills/" "$REPO_DIR/skills/" 2>/dev/null || true
    
    # Copy tools
    rsync -av --delete "$GLOBAL_DIR/tools/" "$REPO_DIR/tools/" 2>/dev/null || true
    
    # Stage and commit
    cd "$REPO_DIR"
    git add -A
    
    if ! git diff --cached --quiet; then
        CHANGES=$(git diff --cached --stat | tail -1)
        git commit -m "Auto-sync: $CHANGES" 2>/dev/null || true
        git push origin main 2>/dev/null || true
        log "Pushed: $CHANGES"
    fi
}

# Check if inotifywait is available
if ! command -v inotifywait &> /dev/null; then
    log "Installing inotify-tools..."
    sudo apt-get install -y inotify-tools 2>/dev/null || {
        log "Cannot install inotify-tools. Using polling mode."
        
        # Polling fallback
        while true; do
            sleep 30
            sync_to_repo
        done
    }
fi

log "Starting OPEX auto-sync watcher..."
log "Watching: $GLOBAL_DIR"

# Watch for changes and sync
inotifywait -m -r -e modify,create,delete,move \
    --exclude '\.swp$|\.tmp$|node_modules' \
    "$GLOBAL_DIR" 2>/dev/null | while read -r directory event filename; do
    
    # Debounce - wait for changes to settle
    touch "$LOCK_FILE"
    sleep $DEBOUNCE_SECONDS
    
    # Only sync if no new changes during debounce
    if [ -f "$LOCK_FILE" ]; then
        rm -f "$LOCK_FILE"
        sync_to_repo
    fi
done
