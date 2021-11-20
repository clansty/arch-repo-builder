const express = require('express')
const {addPackage} = require('./repo-builder')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('0.0')
})

app.get('/api/add-package/:pkg', (req, res) => {
    const {pkg} = req.params
    try {
        addPackage(pkg)
        res.send('w')
    }
    catch (e) {
        res.statusCode = 500
        res.send(e.message)
    }
})

app.listen(port, () => console.log(`listening on port ${port}`))
