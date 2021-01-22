// import filesystem for node to work on files
const fs = require('fs');
// make fetch requests through node possible
const fetch = require('node-fetch');
// import jsdom to later use regular dom methods on json structure
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
// import bottleneck to rate limit fetch requests according to tmdb api
const Bottleneck = require("bottleneck/es5");
const tmdbLimiter = new Bottleneck({
  minTime: 250,
  maxConcurrent: 1
});
// import bottleneck to rate limit page scrapes on letterboxd to mitigate errors
const letterboxdLimiter = new Bottleneck({
  minTime: 250,
  maxConcurrent: 1
});


let promisesArray = [];
// read json file and put it in a variable
let rawData = fs.readFileSync('../data.json');
let movies = JSON.parse(rawData);

const missingUrls = {
  "Kirschblüten - Hanami": "https://letterboxd.com/film/cherry-blossoms/",
}

const getMovieData = (movie, index) => {
  const promise = new Promise((resolve, reject) => {
    // send out promise to fetch letterboxdURIs from data.json
    let urlToFetch = movies[index].LetterboxdURI
    // if letterboxdURI exists, use it
      ? movies[index].LetterboxdURI
      // if not, check missingURls list for movie with name
      : missingUrls[movie.Name];
    // if no url is found, ignore movie
    if (!urlToFetch) {
      console.log(index,movie.Name + " --- ❌ (ignored because it has no URL)");
      return;
    }
    // use rate limiter for fetch request
    letterboxdLimiter.schedule(() => fetch(urlToFetch)
      // take returned promise and textify it
      .then(response => response.text())
      .then(data => {
        // construct jsdom with data from the url in order to use regular js methods
        const dom = new JSDOM(data);
        // check for the tmdb link on the page
        const link = dom.window.document.querySelector('[data-track-action=TMDb]');
        // cut off id with slash
        const betaID = link.href.substring(33);
        // cut off slash at the end
        const finalID = betaID.slice(0, betaID.length -1);
        // add tmdbid property to movie object
        movies[index].tmdbID = finalID;
        const apiKey = 'api_key=0940bdf47236bfccc797ffa5fd1ebe6e';

        // check whether the link targets tv or movie section of the tmdb database
        // to properly build the link
        let tmdbURL = (link.href.includes('tv'))
          ? `https://api.themoviedb.org/3/tv/${finalID}?${apiKey}`
          : `https://api.themoviedb.org/3/movie/${finalID}?${apiKey}`

        // use rate limiter for api requests
        return tmdbLimiter.schedule(() => fetch(tmdbURL)
          .then(response => {
            return response.json();
          })
          // parse returned promise in json to get needed information 
          .then(data => {
            let allGenres = data.genres;
            let genresFinal = allGenres.map((genreObject) => {
              return genreObject.name;
            });
            movie.Genre = genresFinal;
            movie.PosterPath = data.poster_path;
            console.log(index,movie.Name + " --- ✅");
            resolve();
          }))
          .catch((error) => {
            console.log(index,movie.Name + " --- ❌");
            console.log(error);
            resolve();
          })
      }).catch((error) => {
        console.log(index,movie.Name + " --- ❌");
        console.log(error);
        resolve();
      }));
  });
  // push all promises into a promises array so that we can use Promise.all
  // this prevents the completeData file to be written before its properly filled
  promisesArray.push(promise);
};

// loop through all films and get the data we want
movies.forEach(getMovieData);

// wait for all promises to resolve, and then create the new file with all info
Promise.all(promisesArray).then(() => {
  const moviesJSON = JSON.stringify(movies);
  fs.writeFileSync('completeData.json', moviesJSON);
}).catch((error) => {
  console.log("das catch von all promises", error);
});
