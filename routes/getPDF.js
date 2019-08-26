var express = require('express');
var router = express.Router();
var path = require('path');

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

let defaultData;
const spreadsheetId = '1P89Hs8TXhmciHGu4wkSizMBdOqcfKXUBSlmuCOrFrNY';

/* GET home page. */
router.post('/', function(req, res, next) {
    fs.readFile(path.join(__dirname,'../apis/google-sheet/credentials.json'), (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), (auth)=>{
            writeSheet(auth,req.body,()=>{
                res.send(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=pdf&gid=1275095812`)
            });
        });
    });
});
router.get('/defaults', function(req, res) {
    res.json(defaultData)
});

fs.readFile(path.join(__dirname,'../apis/google-sheet/credentials.json'), (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content),setDefaultData);
});

function setDefaultData(auth){
    const sheets = google.sheets({version: 'v4', auth});
    let ranges = [
        "'Dropdowns'!A3:A",
        "'Dropdowns'!B3:B",
        "'Dropdowns'!C3:C",
        "'Dropdowns'!D3:D",
        "'Dropdowns'!E3:E",
        "'Dropdowns'!F3:F",
        "'Dropdowns'!G3:G",
        "'Dropdowns'!H3:H"
    ];
    sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
    }, (err, result) => {
        if (err) {
            // Handle error
            console.log(err);
        } else {
            const data = result.data.valueRanges;
            defaultData = {
                storeTypes:data[0].values.map((arrayedValues)=>arrayedValues[0]),
                audioBandWidths:data[1].values.map((arrayedValues)=>arrayedValues[0]),
                callingSearchSpace:data[2].values.map((arrayedValues)=>arrayedValues[0]),
                CUCMGroup:data[3].values.map((arrayedValues)=>arrayedValues[0]),
                region:data[4].values.map((arrayedValues)=>arrayedValues[0]),
                MRGList:data[5].values.map((arrayedValues)=>arrayedValues[0]),
                Extension:data[6].values.map((arrayedValues)=>arrayedValues[0]),
                CUCMNodes:data[7].values.map((arrayedValues)=>arrayedValues[0]),
            }
        }
    });
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname,'../apis/google-sheet/token.json');

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function getAudioLevel(storeType) {
    console.log(storeType)
    for(i = 0; i<defaultData.storeTypes.length;i++){
        if(storeType === defaultData.storeTypes[i]){
            console.log(defaultData.audioBandWidths[i])
            return defaultData.audioBandWidths[i];
        }
    }
}

function writeSheet(auth,webData,callback) {
    const sheets = google.sheets({version: 'v4', auth});

    const data = [
        {
            range:'B5',
            values:[[webData.storeCode]]
        },
        {
            range:'B6',
            values:[[webData.phoneNumber]]
        },
        {
            range:'B7',
            values:[[webData.storeAddress]]
        },
        {
            range:'B8',
            values:[[webData.storeCUCMNode]]
        },
        {
            range:'B15',
            values:[[getAudioLevel(webData.storeType)]]
        },
        {
            range:'B75',
            values:[[webData.managerGroup]]
        },
        {
            range:'B78',
            values:[[webData.region]]
        },
        {
            range:'B79',
            values:[[webData.mediaGroup]]
        },
        {
            range:'B85',
            values:[[webData.phoneNumber]]
        },
        {
            range:'B96',
            values:[[webData.translationPattern]]
        },
        {
            range:'B92',
            values:[[webData.partyMask]]
        },
        {
            range:'B101',
            values:[[webData.partyMask]]
        }
    ];

    const resource = {
        data,
        valueInputOption:'RAW',
        requests:[{
        "updateSheetProperties":{
            "properties":{
                "sheetID":"1275095812",
                "title":webData.storeCode
            },
            "fields":"title"
        }}]
    };
    sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource
    }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            callback()
        }
    });
}

module.exports = router;