const express = require('express')
const {addPackage, getQueue, packageExists} = require('./repo-builder')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('0.0')
})

app.get('/api/add-package/:pkg', (req, res) => {
    const {pkg} = req.params
    res.send('w')
    addPackage(pkg)
})

app.get('/api/exists/:pkg', (req, res) => {
    const {pkg} = req.params
    res.send(packageExists(pkg))
})

app.get('/api/queue', (req, res) => {
    res.send(getQueue())
})

app.listen(port, () => console.log(`listening on port ${port}`))
