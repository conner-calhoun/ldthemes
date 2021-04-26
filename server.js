const axios = require('axios')
const express = require('express')
const app = express()
const port = 3000

const jamRange = {
    low: 37,
    high: 48
}

var jamThemes = null;

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

async function getJamThemes() {
    let jamThemes = {}

    for (let i = jamRange.low; i <= jamRange.high; i++) {
        try {
            jamThemes[i] = []

            let themeIDApi = `https://api.ldjam.com/vx/node2/walk/1/events/ludum-dare/${i}/theme/4`

            let themeID = await axios.get(themeIDApi)
            themeID = themeID.data.node_id

            let themeApi = `https://api.ldjam.com/vx/theme/list/get/${themeID}/4`

            let themes = await axios.get(themeApi)
            themes = themes.data.lists['4']
            for (theme of themes) {
                jamThemes[i].push(theme.theme)
            }
        } catch (e) {
            // must catch async errors
        }
    }

    return jamThemes
}

app.get('/api/jam-themes', async (req, res) => {
    // Poll the ldJam theme page and pull the theme names
    // let plotData = await getData()
    let jamThemes = await getJamThemes()
    res.send(jamThemes)
})

app.get('/api/theme-counts', async (req, res) => {
    if (jamThemes == null) {
        jamThemes = await getJamThemes()
    }

    let themeCounts = {}

    for (jam in jamThemes) {
        jamThemes[jam].map((theme) => {
            let saniTheme = theme.toUpperCase()

            if (saniTheme in themeCounts)
                themeCounts[saniTheme] += 1
            else
                themeCounts[saniTheme] = 1
        })
    }

    res.send(themeCounts)
})

app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`)

    // make the call when the server is started, not when the api request is made
    jamThemes = await getJamThemes()
})