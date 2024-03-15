import * as functions from "firebase-functions";
const express = require('express');
const cors = require('cors');
//const util = require('util');
const bodyParser = require('body-parser');
import {db} from "../init";
//import { convertSnaps } from "./db-utils";
//import { Account } from "./account";
export const syncSetlistHelperData = express();

syncSetlistHelperData.use(bodyParser.json());
syncSetlistHelperData.use(cors({origin: true}));

syncSetlistHelperData.post("/", async (req, res)=> {
    const responseBody = req.body;
    const accountid = responseBody['accountid'];
    functions.logger.debug(`Account id passed in ${accountid}`);
    functions.logger.debug(`Calling Sync Setlist Helper Data.`);
    try{
        const accountRef = db.doc(`/accounts/${accountid}`);
        const accountSnap = await accountRef.get();
        const account = accountSnap.data();
        const songs = await getSongs(account.importToken);
        functions.logger.debug(`Account name ${songs}`);
        res.status(200).json(songs);
    }
    catch(err){
        functions.logger.error(`Could not import Setlist Helper data.`, err);
        res.status(500).json({message: "User create successuffly"})
    }
})


async function getSongs(accessToken: string){
    const actionUrl = "https://setlisthelper.azurewebsites.net/api/v2.0/Song";
    // const startIndex = 0;
    // const numberOfSongsToGet = 100;
    // const orderByColumnName = 'name';
    // const orderByColumDirection = "asc";
    const jwt = accessToken;
    const songsUrl = actionUrl //+ `?start=${startIndex}&records=${numberOfSongsToGet}&orderbycol=${orderByColumnName}&orderbydirection=${orderByColumDirection}`;
    
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Authorization',  'Bearer ' + jwt,)
    
    const request: RequestInfo = new Request(songsUrl, {
      // We need to set the `method` to `POST` and assign the headers
      method: 'GET',
      headers: headers,
    });
  
    // Send the request and print the response
    const response = await fetch(request);
    const data = await response.json();
    console.log("Songs response", data);
    return data;
  }