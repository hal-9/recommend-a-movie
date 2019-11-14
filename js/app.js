const grid = document.querySelector('#grid');
const genreSelector = document.querySelector('#genreSelector');

const generateList = (selectedGenre) => {

  const filteredList = data
    .filter(movie => movie.Genre.includes(selectedGenre))
    .sort(function(movie1, movie2) {
      return  movie2.Rating - movie1.Rating;
    });
  console.log(filteredList);

  filteredList.forEach((movieData) => {
    let movie = document.createElement('img');
    let rating = document.createElement('p');
    const srcUrl = " https://image.tmdb.org/t/p/w200"
    const posterPath = movieData.PosterPath;
    const imageAlt = " alt='movie poster'"
    movie.src =  `${srcUrl}${posterPath}`
    movie.alt = 'movie poster';
    console.log(movie.innerHTML);
    rating.innerText = movieData.Rating;
    grid.appendChild(movie);
    grid.appendChild(rating);
  });
};


genreSelector.addEventListener('change', (event) => {
  grid.innerHTML = '';
  const selectedGenre = event.target.value;
  generateList(selectedGenre);
})
