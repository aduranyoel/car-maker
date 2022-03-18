const
    express = require('express'),
    app = express(),
    path = require('path'),
    cors = require('cors');


app.use(cors())
app.use(express.json())

app.use(express.static(path.resolve(__dirname, 'front')))

app.use('/api', require('./routes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on port: ${ PORT }`))
