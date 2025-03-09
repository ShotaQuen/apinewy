const axios = require('axios')
const cheerio = require('cheerio')
const { createDecipheriv } = require('crypto')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const YTDL = require('@distube/ytdl-core')

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

async function laheluSearch(query) {
  let { data } = await axios.get(`https://lahelu.com/api/post/get-search?query=${query}&cursor=cursor`)
  return data.postInfos
}

async function ttstalk(username) {

    let url = 'https://tiktoklivecount.com/search_profile';
    let data = {
        username: username.startsWith('@') ? username : `@${username}`
    };

    try {
        let res = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://tiktoklivecount.com/'
            }
        });

        let json = res.data;
        if (!json || !json.followers) return {
            error: 'Profil tidak ditemukan.'
        };

        return {
            name: json.name,
            username: username,
            Pengikut: json.followers,
            Top: json.rankMessage.replace(/<\/?b>/g, '') || 'Tidak tersedia',
            url_profile: json.profile_pic
        };
    } catch (error) {
        return {
            error: 'Error saat mengambil data.'
        };
    }
}

function viooai(content, user, prompt, imageBuffer) {
    return new Promise(async (resolve, reject) => {
      const payload = {
        content,
        user,
        prompt
      }
      if (imageBuffer) {
        payload.imageBuffer = Array.from(imageBuffer)
      }
      try {
        const response = await axios.post('https://luminai.my.id/', payload, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        resolve(response.data.result)
      } catch (error) {
        reject(error.response ? error.response.data : error.message)
      }
    })
  }

async function githubSearch(query, page = 1, lang = '') {
	try {
		const res = await axios.get(`https://github.com/search?q=${query}&type=repositories&p=${page}&l=${lang}`)
		const $ = cheerio.load(res.data)
		let script = $('script[data-target="react-app.embeddedData"]').html()
        let json = JSON.parse(script).payload.results
        const result = json.map(res => {
        return {
        archived: res.archived,
        desc: res.hl_trunc_description?.replace(/<em>/g, '').replace(/<\/em>/g, '') || null,
        lang: res.language,
        mirror: res.mirror,
        public: res.public,
        repo: 'https://github.com/' + res.repo.repository.owner_login + '/' + res.repo.repository.name,
        updated_at: res.repo.repository.updated_at,
        sponsorable: res.sponsorable,
        topics: res.topics
        }
        })
        return result
	} catch (e) {
		throw e
	}
}

async function npmStalk(pname) {
  let stalk = await axios.get("https://registry.npmjs.org/" + pname)
  let versions = stalk.data.versions
  let allver = Object.keys(versions)
  let verLatest = allver[allver.length - 1]
  let verPublish = allver[0]
  let packageLatest = versions[verLatest]
  return {
    name: pname,
    versionLatest: verLatest,
    versionPublish: verPublish,
    versionUpdate: allver.length,
    latestDependencies: Object.keys(packageLatest.dependencies).length,
    publishDependencies: Object.keys(versions[verPublish].dependencies).length,
    publishTime: stalk.data.time.created,
    latestPublishTime: stalk.data.time[verLatest]
  }
}

async function getCookies() {
    try {
        const response = await axios.get('https://www.pinterest.com/csrf_error/');
        const setCookieHeaders = response.headers['set-cookie'];
        if (setCookieHeaders) {
            const cookies = setCookieHeaders.map(cookieString => {
                const cookieParts = cookieString.split(';');
                const cookieKeyValue = cookieParts[0].trim();
                return cookieKeyValue;
            });
            return cookies.join('; ');
        } else {
            console.warn('No set-cookie headers found in the response.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching cookies:', error);
        return null;
    }
}

async function pin(query) {
    try {
        const cookies = await getCookies();
        if (!cookies) {
            console.log('Failed to retrieve cookies. Exiting.');
            return;
        }

        const url = 'https://www.pinterest.com/resource/BaseSearchResource/get/';

        const params = {
            source_url: `/search/pins/?q=${query}`, // Use encodedQuery here
            data: JSON.stringify({
                "options": {
                    "isPrefetch": false,
                    "query": query,
                    "scope": "pins",
                    "no_fetch_context_on_resource": false
                },
                "context": {}
            }),
            _: Date.now()
        };

        const headers = {
            'accept': 'application/json, text/javascript, */*, q=0.01',
            'accept-encoding': 'gzip, deflate',
            'accept-language': 'en-US,en;q=0.9',
            'cookie': cookies,
            'dnt': '1',
            'referer': 'https://www.pinterest.com/',
            'sec-ch-ua': '"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"',
            'sec-ch-ua-full-version-list': '"Not(A:Brand";v="99.0.0.0", "Microsoft Edge";v="133.0.3065.92", "Chromium";v="133.0.6943.142"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-platform-version': '"10.0.0"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
            'x-app-version': 'c056fb7',
            'x-pinterest-appstate': 'active',
            'x-pinterest-pws-handler': 'www/[username]/[slug].js',
            'x-pinterest-source-url': '/hargr003/cat-pictures/',
            'x-requested-with': 'XMLHttpRequest'
        };

        const { data } = await axios.get(url, {
            headers: headers,
            params: params
        })

        const container = [];
        const results = data.resource_response.data.results.filter((v) => v.images?.orig);
        results.forEach((result) => {
            container.push({
                upload_by: result.pinner.username,
                fullname: result.pinner.full_name,
                followers: result.pinner.follower_count,
                caption: result.grid_title,
                image: result.images.orig.url,
                source: "https://id.pinterest.com/pin/" + result.id,
            });
        });

        return container;
    } catch (error) {
        console.log(error);
        return [];
    }
}
const ffStalk = {
  api: {
    base: "https://tools.freefireinfo.in/profileinfo.php"
  },

  headers: {
    'authority': 'tools.freefireinfo.in',
    'accept': 'text/data,application/xdata+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'content-type': 'application/x-www-form-urlencoded',
    'origin': 'https://tools.freefireinfo.in',
    'referer': 'https://tools.freefireinfo.in/',
    'user-agent': 'Postify/1.0.0'
  },

  generateCookie: () => {
    const now = Date.now();
    const timestamp = Math.floor(now / 1000);
    const visitorId = Math.floor(Math.random() * 1000000000);
    const sessionId = Math.random().toString(36).substring(2, 15);
    return `PHPSESSID=${sessionId}; _ga=GA1.1.${visitorId}.${timestamp}; _ga_PDQN6PX6YK=GS1.1.${timestamp}.1.1.${timestamp}.0.0.0`;
  },

  parse: (data) => {
    try {
      const toCamelCase = (str) => {
        return str
          .split(/[\s-_]+/)
          .map((word, index) => {
            if (index === 0) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join('');
      };

      const accountInfo = {};
      const info = data.match(/<h3>Your Account Info:<\/h3>\s*(.*?)(?=<br \/>\s*<br \/>)/s);
      if (info) {
        const lines = info[1].split('<br />');
        lines.forEach(line => {
          const match = line.match(/[╭├╰]\s*([^:]+):\s*([^<]+)/);
          if (match) {
            accountInfo[toCamelCase(match[1].trim())] = match[2].trim();
          }
        });
      }
      
      const booyahPass = {};
      const bm = data.match(/╭\s*Booyah Pass[^]*?(?=<br \/>\s*<br \/>)/);
      if (bm) {
        const lines = bm[0].split('<br />');
        lines.forEach(line => {
          const match = line.match(/[╭╰]\s*([^:]+):\s*([^<]+)/);
          if (match) {
            const key = match[1].trim().toLowerCase().includes('premium') ? 'premium' : 'level';
            booyahPass[key] = match[2].trim();
          }
        });
      }

      const pet = {};
      const pm = data.match(/🐾\s*Pet Information[^]*?(?=<br \/>\s*<br \/>)/);
      if (pm) {
        const lines = pm[0].split('<br />');
        lines.forEach(line => {
          const match = line.match(/[╭├╰]\s*([^:]+):\s*([^<]+)/);
          if (match) {
            pet[toCamelCase(match[1].trim())] = match[2].trim();
          }
        });
      }

      const guild = {};
      const gm = data.match(/Guild Information[^]*?(?=<br \/>\s*<br \/>)/);
      if (gm) {
        const lines = gm[0].split('<br />');
        lines.forEach(line => {
          const match = line.match(/[╭├╰]\s*([^:]+):\s*([^<]+)/);
          if (match) {
            guild[toCamelCase(match[1].trim())] = match[2].trim();
          }
        });
      }

      const vm = data.match(/Current Version:\s*([^\s<]+)/);
      const version = vm ? vm[1] : null;
      const equippedItems = {
        outfit: [],
        pet: [],
        avatar: [],
        banner: [],
        weapons: [],
        title: []
      };

      const categoryMapping = {
        'Outfit': 'outfit',
        'Pet': 'pet',
        'Avatar': 'avatar',
        'Banner': 'banner',
        'Weapons': 'weapons',
        'Title': 'title'
      };

      Object.entries(categoryMapping).forEach(([dataCategory, jsonCategory]) => {
        const cp = new RegExp(`<h4>${dataCategory}</h4>(.*?)(?=<h4>|<script|$)`, 's');
        const cm = data.match(cp);
        
        if (cm) {
          const ip = /<div class='equipped-item'><img src='([^']+)' alt='([^']+)'[^>]*><p>([^<]+)<\/p><\/div>/g;
          let im;
          
          while ((im = ip.exec(cm[1])) !== null) {
            equippedItems[jsonCategory].push({
              imageUrl: im[1],
              itemName: im[2],
              itemDescription: im[3]
            });
          }
        }
      });

      return {
        status: true,
        code: 200,
        message: "Success",
        result: {
          accountInfo,
          booyahPass,
          pet,
          guild,
          version,
          equippedItems
        }
      };

    } catch (error) {
      return {
        status: false,
        code: 500,
        error: error.message
      };
    }
  },

  stalk: async (uid) => {
    try {
      if (!uid) {
        return {
          status: false,
          code: 400,
          message: "Seriously? lu mau ngestalking akun orang, kagak nginput apa2 ? 🗿"
        };
      }

      if (!/^\d+$/.test(uid)) {
        return {
          status: false,
          code: 400,
          message: "UIDnya kudu angka bree, dah jangan macem2 dah 😑"
        }
      }

      const cookie = ffStalk.generateCookie();
     
      const formData = new URLSearchParams();
      formData.append('uid', uid);

      const response = await axios({
        method: 'POST',
        url: ffStalk.api.base,
        headers: {
          ...ffStalk.headers,
          'cookie': cookie
        },
        data: formData,
        maxRedirects: 5,
        validateStatus: status => status >= 200 && status < 400
      });

      if (!response.data || typeof response.data !== 'string' || response.data.length < 100) {
        return {
          status: false,
          code: 404,
          message: "Kagak ada response nya bree 👍🏻"
        };
      }

      return ffStalk.parse(response.data);

    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        error: {
          type: error.name,
          details: error.message
        }
      };
    }
  }
};

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

async function cekStatus(merchant, keyorkut) {
    const apiUrl = "https://linecloud.my.id/api/orkut/cekstatus";
    const apikey = "Line";

    try {
        const response = await fetch(`${apiUrl}?apikey=${apikey}&merchant=${merchant}&keyorkut=${keyorkut}`, {
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

async function mod(query) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    };

    const { data } = await axios.get(`https://modcombo.com/id/?s=${encodeURIComponent(query)}`, { headers });
    const $ = cheerio.load(data);

    let hasil = [];

    $('li a.blog.search').each((_, el) => {
      const image = $(el).find('figure img').attr('data-src') || $(el).find('figure img').attr('src'); // Cek data-src dulu
      const title = $(el).find('.title').text().trim();
      const link = $(el).attr('href');

      if (image) {
        hasil.push({
          title,
          image: image.startsWith('//') ? 'https:' + image : image, // Tambahkan https jika perlu
          link
        });
      }
    });

    return hasil
  } catch (e) {
    console.error('Error:', e.message);
  }
}

async function anime(query) {
    try {
        const searchUrl = `https://otakudesu.cloud/?s=${encodeURIComponent(query)}&post_type=anime`;
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const results = [];

        $('.chivsrc > li').each((i, el) => {
            const image = $(el).find('img').attr('src');
            const title = $(el).find('h2 a').text().trim();
            const url = $(el).find('h2 a').attr('href');
            const genres = [];
            $(el).find('.set').eq(0).find('a').each((_, genre) => {
                genres.push($(genre).text().trim());
            });
            const status = $(el).find('.set').eq(1).text().replace('Status :', '').trim();
            const rating = $(el).find('.set').eq(2).text().replace('Rating :', '').trim();

            if (title && url) {
                results.push({ title, url, image, genres, status, rating });
            }
        });

        return results;
    } catch (error) {
        return { error: 'Gagal mengambil data, coba lagi nanti' };
    }
}

async function mediafire(url) {
  try {
    const { data: text } = await axios.get('https://r.jina.ai/' + url)

    const result = {
      title: (text.match(/Title: (.+)/) || [])[1]?.trim() || '',
      filename: '',
      extension: '',
      size: '',
      download: '',
      repair: '',
      url: (text.match(/URL Source: (.+)/) || [])[1]?.trim() || ''
    }

    const matches = [...text.matchAll(/\[(.*?)\]\((https:\/\/[^\s]+)\)/g)]
    for (const match of matches) {
      const desc = match[1].trim()
      const link = match[2].trim()
      
      if (desc.toLowerCase().includes('download') && desc.match(/\((\d+(\.\d+)?[KMGT]B)\)/)) {
        result.url = link
        result.size = (desc.match(/\((\d+(\.\d+)?[KMG]?B)\)/) || [])[1] || ''
      }
      if (desc.toLowerCase().includes('repair')) {
        result.repair = link
      }
    }

    if (result.url) {
      const decodedUrl = decodeURIComponent(result.url)
      const fileMatch = decodedUrl.match(/\/([^\/]+\.[a-zA-Z0-9]+)(?:\?|$)/)
      if (fileMatch) {
        result.filename = fileMatch[1]
        result.extension = result.filename.split('.').pop().toLowerCase()
      }
    }

    return result
  } catch (err) {
    throw Error(err.message)
  }
}

async function ytdl(url, type, quality) {
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

const Apk4Free = {
    async search(q) {
       const { data } = await axios.get('https://apk4free.net/?s='+q);
       const $ = cheerio.load(data);
       const res = [];
       $('.baps > .bav').each((i, e)=>{
           let obj = {};
           obj.title = $(e).find('span.title').text().trim();
           obj.link = $(e).find('a').attr('href');
           obj.developer = $(e).find('span.developer').text().trim();
           obj.version = $(e).find('span.version').text().trim();
           obj.image = $(e).find('img').attr('src').replace('150x150', '300x300');
           obj.rating = parseInt($(e).find('span.stars').attr('style').replace(/\D/g, ''))/20;
           res.push(obj);
       });
       
       return res;
    },
    async detail(url) {
       const { data } = await axios.get(url);
       const $ = cheerio.load(data);
       const _ = $('div.app-s');
       _.find('div#ez-toc-container').remove();
       const res = {
           title: _.find('h1.main-box-title').text().trim(),
           version: _.find('div.version').text().trim(),
           genre: _.find('ul.post-categories').text().trim(),
           icon: _.find('div.image-single').attr('style').match(/\((.*?)\)/)[1].replace('150x150', '300x300'),
           download: _.find('a.downloadAPK').attr('href'),
           rating: _.find('span.rating-average > b').text().trim(),
           votes: _.find('span.rating-text > span').text().trim(),
           developer: _.find('div.app-icb > div.da-s:eq(0)').text().replace('Developer', '').trim(),
           devlink: _.find('div.app-icb > div.da-s:eq(0) > a').attr('href'),
           requirements: _.find('div.app-icb > div.da-s:eq(2)').text().replace('Requirements', '').trim(),
           downloads: _.find('div.app-icb > div.da-s:eq(3)').text().replace('Downloads', '').trim(),
           playstore: _.find('div.app-icb > div.da-s:eq(4) > a').attr('href'),
           description: _.find('div.descripcion').text().trim(),
           details: _.find('div#descripcion').text().trim().replace(/^Description|Screenshots$/g, '').replace(/\n+/g, '\n').trim(),
           whatsnew: _.find('div#novedades > div.box-content').text().trim(),
           video: _.find('div.iframeBoxVideo > iframe').attr('src'),
           images: [],
           related: []
       };
       
       _.find('div#slideimages img').each((i, e)=>{
           res.images.push($(e).attr('src'));
       });
       
       _.find('.baps > .bav').each((i, e)=>{
           let obj = {};
           obj.title = $(e).find('span.title').text().trim();
           obj.link = $(e).find('a').attr('href');
           obj.developer = $(e).find('span.developer').text().trim();
           obj.version = $(e).find('span.version').text().trim();
           obj.image = $(e).find('img').attr('src').replace('150x150', '300x300');
           obj.rating = parseInt($(e).find('span.stars').attr('style').replace(/\D/g, ''))/20;
           res.related.push(obj);
       });
       
       return res;
    },
    async download(url) {
       const { data } = await axios.get(/(download\/?)$/.test(url)?url:url.replace(/\/$/, '')+'/download');
       const $ = cheerio.load(data);
       let obj = {};
       obj.title = $('div.pxtd > h3').text().trim();
       obj.package = $('div.pxtd > table tr:eq(0) td:eq(1)').text().trim();
       obj.version = $('div.pxtd > table tr:eq(1) td:eq(1)').text().trim();
       obj.size = $('div.pxtd > table tr:eq(2) td:eq(1)').text().trim();
       obj.requirements = $('div.pxtd > table tr:eq(3) td:eq(1)').text().trim();
       obj.url = $('div.pxtd #list-downloadlinks > li:eq(1) > a').attr('href');
       
       return obj;
    },
};

module.exports = { 
  laheluSearch,
  ttstalk,
  viooai,
  githubSearch,
  npmStalk,
  pin,
  ffStalk,
  createPayment,
  cekStatus,
  mod,
  anime,
  mediafire,
  ytdl,
  Apk4Free
}
