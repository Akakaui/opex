#!/usr/bin/env node

/**
 * Extractor - Universal content extractor
 * 
 * Handles: YouTube, Instagram, Twitter, TikTok, blogs, podcasts
 * 
 * Usage:
 *   node extractor.js <url> [--mode transcript|analysis|deep]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const YTDLP = '/home/ubuntu/.local/bin/yt-dlp';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'opex-extract-'));
}

function isYouTube(url) {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function isInstagram(url) {
  return /instagram\.com/i.test(url);
}

function isTwitter(url) {
  return /(?:twitter\.com|x\.com)/i.test(url);
}

function isTikTok(url) {
  return /tiktok\.com/i.test(url);
}

function isBlog(url) {
  // Heuristic: not a social platform
  return !isYouTube(url) && !isInstagram(url) && !isTwitter(url) && !isTikTok(url);
}

async function extractYouTube(url, mode = 'analysis') {
  const tmp = tmpDir();
  
  try {
    // Get video info
    const infoCmd = `"${YTDLP}" --dump-json --no-download "${url}"`;
    const info = JSON.parse(execSync(infoCmd, { encoding: 'utf-8' }));
    
    const result = {
      platform: 'youtube',
      url: url,
      title: info.title,
      channel: info.channel || info.uploader,
      duration: info.duration,
      description: info.description,
      tags: info.tags || [],
      view_count: info.view_count,
      like_count: info.like_count,
      upload_date: info.upload_date,
    };
    
    // Extract subtitles/transcript
    const subCmd = `"${YTDLP}" --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "${tmp}/%(title)s.%(ext)s" "${url}"`;
    try {
      execSync(subCmd, { encoding: 'utf-8' });
      const subFiles = fs.readdirSync(tmp).filter(f => f.endsWith('.vtt'));
      if (subFiles.length > 0) {
        const subContent = fs.readFileSync(path.join(tmp, subFiles[0]), 'utf-8');
        result.transcript = cleanVTT(subContent);
      }
    } catch (e) {
      result.transcript = null;
    }
    
    // Mode-specific extraction
    if (mode === 'analysis' || mode === 'deep') {
      // Extract key frames for visual analysis
      const frameCmd = `"ffmpeg" -i "$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_type,codec_name,width,height -of csv=p=0 "${url}" 2>/dev/null || echo "")" -vf "fps=1/30" -frames:v 5 "${tmp}/frame_%03d.jpg" 2>/dev/null || true`;
      try {
        // Try to get frames from the video
        const videoCmd = `"${YTDLP}" -f "best[height<=720]" -o "${tmp}/video.%(ext)s" "${url}"`;
        execSync(videoCmd, { encoding: 'utf-8', timeout: 60000 });
        
        const videoFile = fs.readdirSync(tmp).find(f => f.startsWith('video.'));
        if (videoFile) {
          const frameExtractCmd = `"ffmpeg" -i "${tmp}/${videoFile}" -vf "fps=1/30" -frames:v 5 "${tmp}/frame_%03d.jpg" 2>/dev/null`;
          try {
            execSync(frameExtractCmd, { encoding: 'utf-8' });
            result.frames = fs.readdirSync(tmp).filter(f => f.startsWith('frame_')).map(f => path.join(tmp, f));
          } catch (e) {
            result.frames = [];
          }
        }
      } catch (e) {
        result.frames = [];
      }
    }
    
    return result;
  } finally {
    // Cleanup temp files but keep for caller if needed
  }
}

async function extractInstagram(url, mode = 'analysis') {
  const tmp = tmpDir();
  
  try {
    const cmd = `"${YTDLP}" --dump-json --no-download "${url}"`;
    const info = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    
    const result = {
      platform: 'instagram',
      url: url,
      title: info.title || info.description?.substring(0, 100),
      description: info.description,
      uploader: info.uploader,
      like_count: info.like_count,
      comment_count: info.comment_count,
      tags: info.tags || [],
      extractor: info.extractor,
    };
    
    // Try to get subtitles
    const subCmd = `"${YTDLP}" --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "${tmp}/%(title)s.%(ext)s" "${url}"`;
    try {
      execSync(subCmd, { encoding: 'utf-8' });
      const subFiles = fs.readdirSync(tmp).filter(f => f.endsWith('.vtt'));
      if (subFiles.length > 0) {
        const subContent = fs.readFileSync(path.join(tmp, subFiles[0]), 'utf-8');
        result.transcript = cleanVTT(subContent);
      }
    } catch (e) {
      result.transcript = null;
    }
    
    return result;
  } finally {
    // Cleanup
  }
}

async function extractTwitter(url, mode = 'analysis') {
  // Twitter extraction via yt-dlp (limited) or web scraping
  const result = {
    platform: 'twitter',
    url: url,
    transcript: null,
    text: null,
  };
  
  try {
    const cmd = `"${YTDLP}" --dump-json --no-download "${url}"`;
    const info = JSON.parse(execSync(cmd, { encoding: 'utf-8' }));
    result.title = info.title;
    result.description = info.description;
    result.uploader = info.uploader;
  } catch (e) {
    // yt-dlp might not support this tweet
    result.error = 'Could not extract tweet via yt-dlp';
  }
  
  return result;
}

async function extractGeneric(url, mode = 'analysis') {
  // For blog posts and other URLs
  const result = {
    platform: 'web',
    url: url,
    transcript: null,
  };
  
  // Use curl to get basic page info
  try {
    const cmd = `curl -sL -o /dev/null -w '%{http_code}' "${url}"`;
    const status = execSync(cmd, { encoding: 'utf-8' }).trim();
    result.status = status;
  } catch (e) {
    result.error = 'Could not fetch URL';
  }
  
  return result;
}

function cleanVTT(vttContent) {
  // Remove timestamps and formatting, keep only text
  return vttContent
    .split('\n')
    .filter(line => !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}/) && !line.match(/^WEBVTT/) && !line.match(/^Kind:/) && !line.match(/^Language:/) && line.trim() !== '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extract(url, mode = 'analysis') {
  if (isYouTube(url)) {
    return extractYouTube(url, mode);
  } else if (isInstagram(url)) {
    return extractInstagram(url, mode);
  } else if (isTwitter(url)) {
    return extractTwitter(url, mode);
  } else if (isTikTok(url)) {
    // TikTok uses similar extraction to Instagram
    return extractInstagram(url, mode);
  } else {
    return extractGeneric(url, mode);
  }
}

// CLI
if (require.main === module) {
  const [,, url, ...flags] = process.argv;
  
  if (!url) {
    console.log('Usage: node extractor.js <url> [--mode transcript|analysis|deep]');
    process.exit(1);
  }
  
  const modeIdx = flags.indexOf('--mode');
  const mode = modeIdx !== -1 ? flags[modeIdx + 1] : 'analysis';
  
  extract(url, mode).then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { extract, isYouTube, isInstagram, isTwitter, isTikTok, isBlog };
