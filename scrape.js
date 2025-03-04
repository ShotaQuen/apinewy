const axios = require('axios')
const { createDecipheriv } = require('crypto')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const YTDL = require('@distube/ytdl-core')

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

module.exports = { 
  laheluSearch,
  ttstalk
}
