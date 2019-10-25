const fs = require('fs');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const Bottleneck = require("bottleneck/es5");
const limiter = new Bottleneck({
  minTime: 333,
  maxConcurrent: 1
});

let promisesArray = [];

let rawData = fs.readFileSync('data.json');
let movies = JSON.parse(rawData);

const getMovieData = (movie, index) => {
  const promise = new Promise((resolve, reject) => {
    limiter.schedule(() => fetch(movies[index].LetterboxdURI)
      .then(response => response.text())
      .then(data => {
        const dom = new JSDOM(data);
        const link = dom.window.document.getElementsByClassName('micro-button track-event').item(1);
        const betaID = link.href.substring(33);
        const finalID = betaID.slice(0, betaID.length -1);
        movies[index].tmdbID = finalID;
        const tmdbURL = `https://api.themoviedb.org/3/movie/${finalID}?api_key=0940bdf47236bfccc797ffa5fd1ebe6e`
        return fetch(tmdbURL);
      })
      .then(response => response.json())
      .then(data => {
        console.log(movie.Name);
        let allGenres = data.genres;
        console.log(allGenres);
        let genresFinal = allGenres.map((genreObject) => {
          return genreObject.name;
        });
        movie.Genre = genresFinal;
        console.log(movie.Genre);
        movie.PosterPath = data.poster_path;
        console.log(movie.PosterPath);
        resolve();
      }).catch((error) => {
        console.log(error);
        reject();
      })
    );

  });

  promisesArray.push(promise);

};

movies.forEach(getMovieData);

Promise.all(promisesArray).then(() => {
  const moviesJSON = JSON.stringify(movies);
  fs.writeFileSync('completeData.json', moviesJSON);
});
