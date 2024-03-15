import { Request, Response } from 'express';
import {SLHSong, SLHSongHelper} from './model/SLHSong'

export async function getToken(req: Request, res: Response) {
  const responseBody = req.body;
  const userName = responseBody['username'];
  const password = responseBody['password'];
  
  // Since this request will send JSON data in the body,
  // we need to set the `Content-Type` header to `application/json`
  const headers: Headers = new Headers()
  headers.set('Content-Type', 'application/x-www-form-urlencoded')
  // We also need to set the `Accept` header to `application/json`
  // to tell the server that we expect JSON in response
  //headers.set('Accept', 'application/json')

  var details = {
      'userName': userName,
      'password': password,
      'grant_type': 'password'
  };
  var formBody:string[] = [];
  for (var property in details) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(details[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  const formBodyForPost = formBody.join("&");

  const request: RequestInfo = new Request('https://setlisthelper.azurewebsites.net/token', {
    // We need to set the `method` to `POST` and assign the headers
    method: 'POST',
    headers: headers,
    // Convert the user object to JSON and pass it as the body
    body: formBodyForPost
  });

  // Send the request and print the response
  const response = await fetch(request);
  const data = await response.json();
  console.log(data);
  const songs = await getSongs(data.access_token);
  res.send(songs);
    
}

async function getSongs(accessToken: string){
  const actionUrl = "https://setlisthelper.azurewebsites.net/api/v2.0/Song";
  const startIndex = 0;
  const numberOfSongsToGet = 100;
  const orderByColumnName = 'name';
  const orderByColumDirection = "asc";
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
  data.forEach((slhSong: SLHSong) => {
    const song = SLHSongHelper.slhSongToSong(slhSong, {
                  uid: "testuid",
                  displayName: "tim burnham",
                  email: "timburnham73@getMaxListeners.com",
                  photoUrl: "httsp://wwww.setlisthelepr.com"
                });
    console.log("Songs response", song);  
  })
  return data;
}
