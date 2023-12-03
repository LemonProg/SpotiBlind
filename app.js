const express = require("express");
const path = require('path')
require('dotenv').config()
const querystring = require('querystring');
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const port = 3000;

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT;

function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', "home",'index.html'))
})

app.get('/connected', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main', 'index.html'));
})

app.get('/login', function(req, res) {
    var state = generateRandomString(16);
    var scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative user-library-read';
  
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
});

app.get('/callback', function(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: "post",
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        }).toString(),
        json: true
      };
      axios(authOptions).then(response => {
        token = response.data.access_token;
        res.redirect('/connected?token=' + token);
      }).catch(e => console.error(e))
    }
});

app.post('/fetchAPI', function(req, res) {
    const token = req.body.token
    const endpoint = req.body.endpoint
    const method = req.body.method

    var fetchOptions = {
        url: endpoint,
        method: method,
        headers: {
          'Authorization': 'Bearer ' + token,
        },
        json: true
    };

    axios(fetchOptions).then(response => {
      res.json(response.data)
    }).catch(e => console.error(e))
})

app.listen(port, () => {
    console.log('server started on 3000');
})