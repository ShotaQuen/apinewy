var express = require("express"), cors = require("cors"), secure = require("ssl-express-www");
const path = require('path');
const os = require('os');
const fs = require('fs');
const axios = require('axios')

var app = express();
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(cors());
app.use(secure);
const port = 3000;

app.get('/stats', (req, res) => {
  const stats = {
    platform: os.platform(),
    architecture: os.arch(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
    cpuModel: os.cpus()[0].model,
    numCores: os.cpus().length,
    loadAverage: os.loadavg(),
    hostname: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    osType: os.type(),
    osRelease: os.release(),
    userInfo: os.userInfo(),
    processId: process.pid,
    nodeVersion: process.version,
    execPath: process.execPath,
    cwd: process.cwd(),
    memoryUsage: process.memoryUsage()
  };
  res.json(stats);
});

app.get('/api/lahelu', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { laheluSearch } = require('./scrape')
    const response = await laheluSearch(q);    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/modcombo', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { mod } = require('./scrape')
    const response = await mod(q);
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/anime', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { anime } = require('./scrape')
    const response = await anime(q);
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/githubSearch', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { githubSearch } = require('./scrape')
    const response = await githubSearch(q);    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/Apk4Free', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { Apk4Free } = require('./scrape')
    const response = await Apk4Free(q);
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/pin', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { pin } = require('./scrape')
    const response = await pin(q);
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/ttstalk', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }
  try {
    const { ttstalk } = require('./scrape')
    const response = await ttstalk(q);    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/npmStalk', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { npmStalk } = require('./scrape')
    const response = await npmStalk(q);    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/ffStalk', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }
  try {
    const { ffStalk } = require('./scrape')
    const response = await ffStalk.stalk(q);
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/mediafile', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }
  try {
    const { mediafire } = require('./scrape')
    const response = await mediafire.stalk(q);
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/viooai', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
  }

  try {
    const { viooai } = require('./scrape')
    const response = await viooai(q);    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/ytmp4', async (req, res) => {
  const { url, quality } = req.query;

  if (!url) {
    return res.status(400).json({ status: false, error: "Tolong masukkan url YouTube" });
  }
  if (!quality) {
    return res.status(400).json({ status: false, error: "Tolong masukkan url quality" });
  }

  try {
    const { ytdl } = require('./scrape')
    const response = await ytdl(url, ytmp4, quality);    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/ytmp3', async (req, res) => {
  const { url, quality } = req.query;

  if (!url) {
    return res.status(400).json({ status: false, error: "Tolong masukkan url YouTube" });
  }
  if (!quality) {
    return res.status(400).json({ status: false, error: "Tolong masukkan url quality" });
  }

  try {
    const { ytdl } = require('./scrape')
    const response = await ytdl(url, ytmp3, quality);
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/orkut/createpayment', async (req, res) => {
  const { amount, codeqr } = req.query;

  if (!amount) {
    return res.status(400).json({ status: false, error: "Tolong masukkan harganya" });
  }
  if (!codeqr) {
    return res.status(400).json({ status: false, error: "Tolong masukkan codeqr" });
  }

  try {
    const { createPayment } = require('./scrape')
    const response = await createPayment(amount, codeqr);    
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response.result
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/orkut/cekstatus', async (req, res) => {
  const { merchant, keyorkut } = req.query;

  if (!merchant) {
    return res.status(400).json({ status: false, error: "Tolong masukkan merchant" });
  }
  if (!keyorkut) {
    return res.status(400).json({ status: false, error: "Tolong masukkan keyorkut" });
  }

  try {
    const { cekStatus } = require('./scrape')
    const response = await cekStatus(merchant, keyorkut);    
    res.status(200).json({
      status: true,
      creator: 'ikann',
      data: response.result
    });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
});

app.get('/api/islam/surah', async (req, res) => {
    try {
        const listSurat = await axios.get('https://api.npoint.io/99c279bb173a6e28359c/data');

        res.status(200).json({
            status: true,
            creator: 'ikann',
            data: listSurat.data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            creator: 'ikann',
            message: "Server sedang error :("
        });
    }
});

app.get('/api/islam/nosurat', async (req, res) => {
    const { nosurat } = req.query
    if (nosurat >= 115) {
        return res.status(404).json({
            status: false,
            creator: 'ikann',
            message: "Al-Qur'an hanya sampai 114 surah"
        });
    }

    try {
        const surat = await axios.get(`https://api.npoint.io/99c279bb173a6e28359c/surat/${nosurat}`);
        res.status(200).json({
            status: true,
            creator: 'ikann',
            data: surat.data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            creator: 'ikann',
            message: "Server sedang error :("
        });
    }
});

app.get('/api/islam/namasurat', async (req, res) => {
    try {
        const { namasurat } = req.query
        const listSurat = await axios.get('https://api.npoint.io/99c279bb173a6e28359c/data');
        const findSurah = listSurat.data.find(surah => surah.nama === namasurat);

        if (!findSurah) {
            return res.status(404).json({
                status: false,
                creator: 'ikann',
                message: "Surah tidak ditemukan"
            });
        }

        res.status(200).json({
            status: true,
            creator: 'ikann',
            data: findSurah
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            creator: 'ikann',
            message: "Server sedang error :("
        });
    }
});

app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ada kesalahan pada server');
});


app.use((req, res, next) => {
  res.status(404).send("Halaman tidak ditemukan");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ada kesalahan pada server');
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});