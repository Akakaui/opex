#!/usr/bin/env node

/**
 * Extractor - Universal content extractor
 * 
 * Supports: YouTube, Instagram, TikTok, Twitter/X, Facebook, Vimeo, 
 *           SoundCloud, LinkedIn, and 1000+ other sites via yt-dlp
 * 
 * Usage:
 *   node extractor.js <url> [--mode transcript|analysis|deep]
 *   node extractor.js <url> --audio-only
 * 
 * Flow:
 *   1. Extract metadata (always)
 *   2. Download audio (for transcription)
 *   3. Extract frames (for visual analysis)
 *   4. Transcribe audio (if Groq API key set)
 *   5. Delete all temp files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const YTDLP = '/home/ubuntu/.local/bin/yt-dlp';
const FFMPEG = 'ffmpeg';
const PROXY = process.env.WEBSHARE_PROXY || 'http://sgfpmhdm:eqorm333gsth@31.59.20.176:6754/';

function tmpDir(prefix = 'opex-extract') {
  return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
}

function getVideoId(url) {
  // Extract video ID from various platform URLs
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/i,
    /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i,
    /tiktok\.com\/@[^/]+\/video\/(\d+)/i,
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i,
    /vimeo\.com\/(\d+)/i,
    /soundcloud\.com\/[^/]+\/[^/]+/i,
    /linkedin\.com\/feed\/update\/[^/]+/i,
    /facebook\.com\/.*\/videos\/(\d+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  // Fallback: use URL hash
  return Buffer.from(url).toString('base64').substring(0, 12);
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

function isFacebook(url) {
  return /facebook\.com|fb\.watch/i.test(url);
}

function isLinkedIn(url) {
  return /linkedin\.com/i.test(url);
}

function isSoundCloud(url) {
  return /soundcloud\.com/i.test(url);
}

function getPlatform(url) {
  if (isYouTube(url)) return 'youtube';
  if (isInstagram(url)) return 'instagram';
  if (isTwitter(url)) return 'twitter';
  if (isTikTok(url)) return 'tiktok';
  if (isFacebook(url)) return 'facebook';
  if (isLinkedIn(url)) return 'linkedin';
  if (isSoundCloud(url)) return 'soundcloud';
  return 'web';
}

function cleanVTT(vttContent) {
  return vttContent
    .split('\n')
    .filter(line => !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}/) && !line.match(/^WEBVTT/) && !line.match(/^Kind:/) && !line.match(/^Language:/) && line.trim() !== '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractMetadata(url) {
  try {
    const cmd = `"${YTDLP}" --proxy "${PROXY}" --dump-json --no-download "${url}"`;
    const info = JSON.parse(execSync(cmd, { encoding: 'utf-8', timeout: 30000 }));
    
    return {
      title: info.title,
      description: info.description,
      channel: info.channel || info.uploader,
      uploader: info.uploader,
      duration: info.duration,
      view_count: info.view_count,
      like_count: info.like_count,
      upload_date: info.upload_date,
      tags: info.tags || [],
      thumbnail: info.thumbnail,
      platform: getPlatform(url),
    };
  } catch (e) {
    return { error: e.message, platform: getPlatform(url) };
  }
}

async function downloadAudio(url, outputPath) {
  try {
    const cmd = `"${YTDLP}" --proxy "${PROXY}" -f "bestaudio" -o "${outputPath}" "${url}"`;
    execSync(cmd, { encoding: 'utf-8', timeout: 120000 });
    
    // Check if file needs splitting (Groq limit is 25MB)
    const webmPath = outputPath.replace('.wav', '.webm');
    const wavPath = outputPath;
    
    if (fs.existsSync(wavPath)) {
      const stats = fs.statSync(wavPath);
      if (stats.size > 24 * 1024 * 1024) { // > 24MB
        console.log(`    ⚠ Large file (${(stats.size / 1024 / 1024).toFixed(1)}MB), splitting for transcription...`);
        const chunksDir = path.join(path.dirname(outputPath), 'chunks');
        fs.mkdirSync(chunksDir, { recursive: true });
        const chunks = splitAudio(wavPath, chunksDir);
        return { wavPath, chunks, needsChunking: true };
      }
    }
    
    return { wavPath, chunks: [], needsChunking: false };
  } catch (e) {
    console.error(`  ⚠ Audio download failed: ${e.message}`);
    return null;
  }
}

async function downloadVideo(url, outputPath, quality = '720') {
  try {
    const cmd = `"${YTDLP}" --proxy "${PROXY}" -f "best[height<=${quality}]" -o "${outputPath}" "${url}"`;
    execSync(cmd, { encoding: 'utf-8', timeout: 180000 });
    return true;
  } catch (e) {
    console.error(`  ⚠ Video download failed: ${e.message}`);
    return false;
  }
}

function convertToWav(inputPath, outputPath) {
  try {
    execSync(`${FFMPEG} -i "${inputPath}" -ar 16000 -ac 1 "${outputPath}" -y 2>/dev/null`, { encoding: 'utf-8' });
    return true;
  } catch (e) {
    return false;
  }
}

function splitAudio(inputPath, outputDir, chunkDuration = 300) {
  try {
    execSync(`${FFMPEG} -i "${inputPath}" -f segment -segment_time ${chunkDuration} -c copy "${outputDir}/chunk_%03d.wav" -y 2>/dev/null`, { encoding: 'utf-8' });
    return fs.readdirSync(outputDir).filter(f => f.endsWith('.wav')).map(f => path.join(outputDir, f));
  } catch (e) {
    return [];
  }
}

function extractFrames(videoPath, outputDir, interval = 30) {
  try {
    execSync(`${FFMPEG} -i "${videoPath}" -vf "fps=1/${interval}" -q:v 2 "${outputDir}/frame_%03d.jpg" 2>/dev/null`, { encoding: 'utf-8' });
    return fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
  } catch (e) {
    return [];
  }
}

function cleanupFiles(files) {
  let freedBytes = 0;
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        freedBytes += stats.size;
        fs.unlinkSync(file);
      }
    } catch (e) {}
  }
  return freedBytes;
}

function cleanupDir(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (e) {}
}

async function extract(url, mode = 'analysis', options = {}) {
  const videoId = getVideoId(url);
  const platform = getPlatform(url);
  const tmp = tmpDir(`opex-${videoId}`);
  
  console.log(`\n  Platform: ${platform}`);
  console.log(`  Mode: ${mode}`);
  
  const result = {
    platform: platform,
    url: url,
    videoId: videoId,
    frames: [],
    audioPath: null,
    transcript: null,
  };
  
  try {
    // Step 1: Always extract metadata
    console.log('\n  1. Extracting metadata...');
    const metadata = await extractMetadata(url);
    Object.assign(result, metadata);
    if (metadata.title) {
      console.log(`    Title: ${metadata.title}`);
    }
    
    // Step 2: Download audio for transcription
    console.log('\n  2. Downloading audio...');
    const audioPath = path.join(tmp, `audio.wav`);
    const audioResult = await downloadAudio(url, audioPath);
    
    if (audioResult) {
      result.audioPath = audioResult.wavPath;
      result.audioChunks = audioResult.chunks;
      result.needsChunking = audioResult.needsChunking;
      const size = audioResult.needsChunking 
        ? `${audioResult.chunks.length} chunks`
        : `${(fs.statSync(audioResult.wavPath).size / 1024 / 1024).toFixed(2)} MB`;
      console.log(`    ✓ Audio ready (${size})`);
    }
    
    // Step 3: Download video + extract frames (for analysis/deep modes)
    if (mode === 'analysis' || mode === 'deep') {
      console.log('\n  3. Downloading video for frame extraction...');
      const videoPath = path.join(tmp, 'video.mp4');
      const videoDownloaded = await downloadVideo(url, videoPath);
      
      if (videoDownloaded) {
        const framesDir = path.join(tmp, 'frames');
        fs.mkdirSync(framesDir, { recursive: true });
        
        const interval = mode === 'deep' ? 10 : 30;
        console.log(`    Extracting frames (1 per ${interval}s)...`);
        const frames = extractFrames(videoPath, framesDir, interval);
        result.frames = frames.map(f => path.join(framesDir, f));
        console.log(`    ✓ Extracted ${frames.length} frames`);
      }
    }
    
    // Step 4: Get transcript if available (captions, not audio transcription)
    if (mode === 'transcript' || mode === 'analysis' || mode === 'deep') {
      console.log('\n  4. Checking for captions...');
      try {
        const subCmd = `"${YTDLP}" --write-auto-sub --sub-lang en --skip-download --sub-format vtt -o "${tmp}/%(title)s.%(ext)s" "${url}"`;
        execSync(subCmd, { encoding: 'utf-8', timeout: 30000 });
        const subFiles = fs.readdirSync(tmp).filter(f => f.endsWith('.vtt'));
        if (subFiles.length > 0) {
          const subContent = fs.readFileSync(path.join(tmp, subFiles[0]), 'utf-8');
          result.transcript = cleanVTT(subContent);
          console.log(`    ✓ Captions available (${result.transcript.length} chars)`);
        }
      } catch (e) {
        console.log('    ℹ No captions available (audio transcription will be used)');
      }
    }
    
    return result;
    
  } catch (e) {
    console.error(`  ✗ Error: ${e.message}`);
    result.error = e.message;
    return result;
  }
}

// CLI
if (require.main === module) {
  const [,, url, ...flags] = process.argv;
  
  if (!url) {
    console.log('Usage: node extractor.js <url> [--mode transcript|analysis|deep] [--audio-only]');
    process.exit(1);
  }
  
  const modeIdx = flags.indexOf('--mode');
  const mode = modeIdx !== -1 ? flags[modeIdx + 1] : 'analysis';
  
  extract(url, mode).then(result => {
    console.log('\nResult:', JSON.stringify({
      platform: result.platform,
      title: result.title,
      hasTranscript: !!result.transcript,
      hasAudio: !!result.audioPath,
      frameCount: result.frames?.length || 0,
    }, null, 2));
  }).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = { extract, getPlatform, downloadAudio, downloadVideo, cleanupFiles, cleanupDir };
