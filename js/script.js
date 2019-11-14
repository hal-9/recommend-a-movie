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
    let urlToFetch = movies[index].LetterboxdURI
      ? movies[index].LetterboxdURI
      : missingUrls[movie.Name];

    if (!urlToFetch) {
      console.log(index,movie.Name + " --- ❌ (ignored because it has no URL)");
      return;
    }

    letterboxdLimiter.schedule(() => fetch(urlToFetch)
      .then(response => response.text())
      .then(data => {
        const dom = new JSDOM(data);
        const link = dom.window.document.querySelector('[data-track-action=TMDb]');
        const betaID = link.href.substring(33);
        const finalID = betaID.slice(0, betaID.length -1);
        movies[index].tmdbID = finalID;
        const apiKey = 'api_key=0940bdf47236bfccc797ffa5fd1ebe6e';

        let tmdbURL = (link.href.includes('tv'))
          ? `https://api.themoviedb.org/3/tv/${finalID}?${apiKey}`
          : `https://api.themoviedb.org/3/movie/${finalID}?${apiKey}`


        return tmdbLimiter.schedule(() => fetch(tmdbURL)
          .then(response => {
            return response.json();
          })
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
