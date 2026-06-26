#!/bin/bash

# OPEX Setup Script
# Installs OPEX system globally for OpenCode and Claude Code

set -e

REPO_DIR="/home/ubuntu/opex"
GLOBAL_DIR="/home/ubuntu/.config/opex"
OPENCODE_DIR="/home/ubuntu/.config/opencode"
CLAUDE_DIR="/home/ubuntu/.claude"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Setting up OPEX system..."

# Create directories
mkdir -p "$GLOBAL_DIR"
mkdir -p "$OPENCODE_DIR/agents"
mkdir -p "$OPENCODE_DIR/skills"
mkdir -p "$OPENCODE_DIR/tools"
mkdir -p "$CLAUDE_DIR"

# Copy files to global locations
log "Installing agents..."
cp "$REPO_DIR/agents/"*.md "$OPENCODE_DIR/agents/"

log "Installing skills..."
cp "$REPO_DIR/skills/"*.skill.md "$OPENCODE_DIR/skills/"

log "Installing tools..."
cp -r "$REPO_DIR/tools/"* "$OPENCODE_DIR/tools/"

log "Installing Claude Code config..."
cp "$REPO_DIR/CLAUDE.md" "$CLAUDE_DIR/"

log "Installing OPEX config..."
cp -r "$REPO_DIR/config" "$GLOBAL_DIR/" 2>/dev/null || true
cp -r "$REPO_DIR/knowledge" "$GLOBAL_DIR/" 2>/dev/null || true
cp -r "$REPO_DIR/memory" "$GLOBAL_DIR/" 2>/dev/null || true

# Install inotify-tools for file watcher
log "Installing file watcher dependencies..."
sudo apt-get install -y inotify-tools 2>/dev/null || true

# Set up systemd service for auto-sync
log "Setting up auto-sync service..."
sudo cp "$REPO_DIR/opex-sync.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable opex-sync
sudo systemctl start opex-sync

log "OPEX system installed successfully!"
log ""
log "Usage:"
log "  OpenCode: @opex [your request]"
log "  Claude Code: [your request]"
log ""
log "Auto-sync is running. Changes will be pushed to GitHub automatically."
