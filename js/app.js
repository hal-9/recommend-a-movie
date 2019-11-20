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
    const gridItem = document.createElement('div')
    gridItem.classList.add('gridItem');
    const letterboxdLink = document.createElement('a')
    letterboxdLink.href = movieData.LetterboxdURI;
    letterboxdLink.target = 'blank';
    let movie = document.createElement('img');
    const srcUrl = " https://image.tmdb.org/t/p/w300"
    const posterPath = movieData.PosterPath;
    const imageAlt = " alt='movie poster'"
    movie.src =  `${srcUrl}${posterPath}`
    movie.alt = `${movieData.Name} movie poster`;
    grid.appendChild(gridItem);
    gridItem.appendChild(letterboxdLink);
    letterboxdLink.appendChild(movie);
  });
};


genreSelector.addEventListener('change', (event) => {
  grid.innerHTML = '';
  const selectedGenre = event.target.value;
  generateList(selectedGenre);
})
