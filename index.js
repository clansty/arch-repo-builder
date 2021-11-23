const express = require('express')
const {addPackage, getQueue} = require('./repo-builder')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('0.0')
})

app.get('/api/add-package/:pkg', (req, res) => {
    const {pkg} = req.params
    res.send('w')
    setTimeout(() => {
        addPackage(pkg)
    }, 0)
})

app.get('/api/queue', (req, res) => {
    res.send(getQueue())
})

app.listen(port, () => console.log(`listening on port ${port}`))
