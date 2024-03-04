import * as functions from "firebase-functions";
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');

export const getSetlistHelperToken = express();

getSetlistHelperToken.use(bodyParser.json());
getSetlistHelperToken.use(cors({origin: true}));

getSetlistHelperToken.post("/", async (req, res)=> {
    functions.logger.debug(`Calling import Setlist Helper Data function.`);
    try{
        res.status(200).json({message: "User create successuffly"});
    }
    catch(err){
        functions.logger.error(`Could not import Setlist Helper data.`, err);
        res.status(500).json({message: "User create successuffly"})
    }
});
