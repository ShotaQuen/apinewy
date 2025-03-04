const axios = require('axios')
const { createDecipheriv } = require('crypto')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const YTDL = require('@distube/ytdl-core')

// === Const
const randomKarakter = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
}

const FileSize = (path) => {
  const bytes = fs.statSync(path).size
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return bytes + ' B'
}

const morseCode = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
    'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
    'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
    'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
    'Z': '--..',  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', ' ': '  '
};

const morseIkann = {
    'A': '@',    'B': ';',  'C': `'`,  'D': '$',   'E': '3',
    'F': '_',  'G': '&',   'H': '-',  'I': '8',    'J': '+',
    'K': '(',   'L': ')',  'M': '?',    'N': '!',    'O': '9',
    'P': '0',  'Q': '1',  'R': '4',   'S': '#',   'T': '5',
    'U': '7',   'V': ':',  'W': '2',   'X': '"',  'Y': '6',
    'Z': '*',  '0': '∆', '1': '~', '2': '`', '3': '|',
    '4': '•', '5': '√', '6': 'π', '7': '÷', '8': '×',
    '9': '§', ' ': '/'
};

// === Module
async function laheluSearch(query) {
  let { data } = await axios.get(`https://lahelu.com/api/post/get-search?query=${query}&cursor=cursor`)
  return data.postInfos
}

async function createPayment(amount, codeqr) {
    const apiUrl = "https://linecloud.my.id/api/orkut/createpayment";
    const apikey = "Line";

    try {
        const response = await fetch(`${apiUrl}?apikey=${apikey}&amount=${amount}&codeqr=${codeqr}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating payment:", error);
        return { success: false, message: error.message };
    }
}

async function deepseek(text) {
try {
        let response = await axios.get(`https://velyn.vercel.app/api/ai/deepseek?prompt=${text}`);
        let result = response.data;
        
        return result
    } catch (err) {
        console.error(err);
    }
}

async function ssweb(link) {
   let { data } = await axios.get(`https://api.pikwy.com/?tkn=125&d=3000&u=${link}&fs=0&w=1280&h=1200&s=100&z=100&f=jpg&rt=jweb`)
   return data
}

const QualsVideo = ["144", "240", "360", "480", "720", "1080"]
const QualsAudio = ['32', '64', '128', '192', '256', '320']

const downloadFolder = '/home/container'
if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder)

async function ytdlv1(url, type, qual = null) {
    let cookie
    const match = cookie?.match(/Expires=([^;]+)/)
    const date = match ? new Date(match[1]) : null
    const now = new Date()

    if (!cookie || (date && now > date)) {
        const yt_page = await axios.get("https://www.youtube.com", { timeout: 5000 })
        cookie = yt_page.headers['set-cookie']?.join('; ') || ''
    }

    const config = { requestOptions: { headers: { Cookie: cookie } } }
    const info = await YTDL.getInfo(url, config)
    const video = info.videoDetails
    const file_id = randomKarakter(8)

    if (type === 'mp3') {
        const file_path = `./${file_id}.mp3`

        const stream = YTDL(url, {
            filter: 'audioonly',
            highWaterMark: 32 * 1024 * 1024,
            requestOptions: { headers: { Cookie: cookie } }
        })

        const ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-b:a', `${qual}k`,
            '-preset', 'ultrafast',
            '-movflags', '+faststart',
            file_path
        ])

        stream.pipe(ffmpeg.stdin)

        await new Promise((resolve, reject) => {
            ffmpeg.on('close', resolve)
            ffmpeg.on('error', reject)
        })

        const file_size = FileSize(file_path)
        return {
            audio: {
                title: video.title,
                duration: video.lengthSeconds,
                views: video.viewCount,
                likes: video.likes,
                quality: qual + 'kbps',
                description: video.description,
                thumbnail: video.thumbnails.pop().url
            },
            channel: {
                name: video.ownerChannelName,
                subscriber: video.author.subscriber_count,
                verified: video.author.verified,
                url: video.author.channel_url
            },
            file_name: `${video.title}.mp3`,
            file_size,
            download: file_path
        }
    }

    const formats = info.formats.map(f => ({
        itag: f.itag,
        quality: f.qualityLabel || 'Audio',
        hasAudio: !!f.audioBitrate,
        url: f.url,
        type: f.mimeType.split(';')[0]
    }))

    let format_video = formats.find(f => f.quality.includes(`${qual}p`) && !f.hasAudio) || formats.find(f => f.quality.includes('p') && !f.hasAudio)
    let format_audio = formats.find(f => f.hasAudio)

    if (!format_video || !format_audio) return { availableFormats: formats }

    const video_path = `./${file_id}.mp4`

    const video_stream = YTDL(url, {
        quality: format_video.itag,
        highWaterMark: 64 * 1024 * 1024,
        requestOptions: { headers: { Cookie: cookie } }
    })

    const audio_stream = YTDL(url, {
        quality: format_audio.itag,
        highWaterMark: 32 * 1024 * 1024,
        requestOptions: { headers: { Cookie: cookie } }
    })

    const ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:3',
        '-i', 'pipe:4',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-movflags', '+faststart',
        video_path
    ], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] })

    video_stream.pipe(ffmpeg.stdio[3])
    audio_stream.pipe(ffmpeg.stdio[4])

    await new Promise((resolve, reject) => {
        ffmpeg.on('close', resolve)
        ffmpeg.on('error', reject)
    })

    const file_size = FileSize(video_path)
    return {
        video: {
            title: video.title,
            duration: video.lengthSeconds,
            views: video.viewCount,
            likes: video.likes,
            quality: format_video.quality,
            description: video.description,
            thumbnail: video.thumbnails.pop().url
        },
        channel: {
            name: video.ownerChannelName,
            subscriber: video.author.subscriber_count,
            verified: video.author.verified,
            url: video.author.channel_url
        },
        file_name: `${video.title}.mp4`,
        file_size,
        download: video_path
    }
}

async function ytdlv2(url, type, quality) {
  const api = {
    base: 'https://media.savetube.me/api',
    cdn: '/random-cdn',
    info: '/v2/info',
    download: '/download'
  }

  const headers = {
    accept: '*/*',
    'content-type': 'application/json',
    origin: 'https://yt.savetube.me',
    referer: 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  }

  const vid_quality = ['144', '240', '360', '480', '720', '1080']
  const aud_quality = ['32', '64', '128', '192', '256', '320']

  const hex_to_buf = (hex) => Buffer.from(hex, 'hex')

  const decrypt = (enc) => {
    try {
      const secret_key = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
      const data = Buffer.from(enc, 'base64')
      const iv = data.slice(0, 16)
      const content = data.slice(16)
      const key = hex_to_buf(secret_key)

      const decipher = createDecipheriv('aes-128-cbc', key, iv)
      let decrypted = Buffer.concat([decipher.update(content), decipher.final()])

      return JSON.parse(decrypted.toString())
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const get_id = (url) => {
    const regex = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ]
    for (let r of regex) {
      let match = url.match(r)
      if (match) return match[1]
    }
    return null
  }

  const dl_file = (url, file_path) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream'
        })
        const writer = fs.createWriteStream(file_path)
        response.data.pipe(writer)
        writer.on('finish', () => resolve(file_path))
        writer.on('error', reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  const convert_audio = (input, output, bitrate) => {
    return new Promise((resolve, reject) => {
      const process = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-b:a', `${bitrate}k`,
        '-preset', 'ultrafast',
        '-movflags', '+faststart',
        output
      ])
    
      const readStream = fs.createReadStream(input)
      readStream.pipe(process.stdin)

      process.on('close', (code) => {
        if (code === 0) resolve(output)
        else reject(new Error('Error :('))
      })
    })
  }

  const id = get_id(url)

  try {
    const { data: cdn_res } = await axios.get(api.base+api.cdn, { headers })
    const cdn = cdn_res.cdn

    const { data: info_res } = await axios.post(`https://${cdn}${api.info}`, {
      url: `https://www.youtube.com/watch?v=${id}`
    }, { headers })

    const decrypted = decrypt(info_res.data)

    if (type === 'mp4') {
      if (!vid_quality.includes(quality.toString())) quality = '360'
    } else if (type === 'mp3') {
      if (!aud_quality.includes(quality.toString())) quality = '192'
    }

    const { data: dl_res } = await axios.post(`https://${cdn}${api.download}`, {
      id,
      downloadType: type === 'mp3' ? 'audio' : 'video',
      quality,
      key: decrypted.key
    }, { headers })

    const file_name = `${randomKarakter(4)}.${type}`
    const file_path = './' + file_name

    await dl_file(dl_res.data.downloadUrl, file_path)

    if (type === 'mp3') {
      const output_file = `./${randomKarakter(4)}.mp3`
      await convert_audio(file_path, output_file, quality)
      fs.unlinkSync(file_path)
      return {
        title: decrypted.title,
        format: 'mp3',
        quality: quality+'kbps',
        duration: decrypted.duration,
        thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        file_name: decrypted.title+'.mp3',
        file_size: FileSize(output_file),
        download: output_file
      }
    }

    return {
      title: decrypted.title,
      format: 'mp4',
      quality: quality+'p',
      duration: decrypted.duration,
      thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      file_name: decrypted.title+'.mp4',
      file_size: FileSize(file_path),
      download: file_path
    }
  } catch (err) {
    return { error: err.message }
  }
}

async function cekidch(url) {
    if (!url.includes("https://whatsapp.com/channel/")) {
        return { error: "Link tautan tidak valid" };
    }

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const id = url.split('https://whatsapp.com/channel/')[1];
        const name = $('meta[property="og:title"]').attr('content') || "Tidak diketahui";
        const description = $('meta[property="og:description"]').attr('content') || "Tidak ada deskripsi";
        
        return {
            id,
            name,
            description
        };

    } catch (error) {
        return { error: "Gagal mengambil data, pastikan link benar" };
    }
}

function textToMorse(text) {
    return text.toUpperCase().split('').map(char => morseCode[char] || '').join('');
}

function morseToText(morse) {
    return morse.split('').map(code => morseToText[code] || '?').join('');
}

function ikannMorse(text) {
    return text.toUpperCase().split('').map(char => morseIkann[char] || char).join('');
}

function ikannToText(morse) {
    return morse.split(' ').map(code => ikannMorse[code] || '?').join('');
}

module.exports = { 
  laheluSearch, 
  createPayment, 
  deepseek, 
  ssweb,
  ytdlv1,
  ytdlv2,
  cekidch,
  textToMorse
}