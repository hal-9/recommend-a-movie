const grid = document.querySelector('.grid');
const genreSelector = document.querySelector('.genreSelector');

const createMovieEntries = (filteredList) => {
  filteredList.forEach((movieData) => {
    const gridItem = document.createElement('div')
    gridItem.classList.add('gridItem');
    const letterboxdLink = document.createElement('a')
    letterboxdLink.href = movieData.LetterboxdURI;
    letterboxdLink.target = 'blank';
    let movie = document.createElement('img');
    const srcUrl = " https://image.tmdb.org/t/p/w300"
    const posterPath = movieData.PosterPath;
    movie.src = (posterPath !== null) 
    ? `${srcUrl}${posterPath}`
    : 'https://via.placeholder.com/300x450';
    movie.alt = `${movieData.Name} movie poster`;
    grid.appendChild(gridItem);
    gridItem.appendChild(letterboxdLink);
    letterboxdLink.appendChild(movie);
  });
}

const generateList = (selectedGenre) => {
  if (selectedGenre === 'Favorite') {
    const filteredListFavorite = data
    .filter(movie => movie.Rating === 5);

    createMovieEntries(filteredListFavorite);
  } else {
    const filteredListGenre = data
      .filter(movie => movie.Genre[0] === selectedGenre)
      .sort(function(movie1, movie2) {
        return movie2.Rating - movie1.Rating;
      });
    
      createMovieEntries(filteredListGenre);
  }
};

genreSelector.addEventListener('change', (event) => {
  grid.innerHTML = '';
  const selectedGenre = event.target.value;
  let helperWord = document.querySelector('.helper-word');
  let movie = document.querySelector('.movie');

  switch(event.target.value) {
    case 'Action':
    case 'Animation':
      helperWord.innerHTML = 'an';
      break;
    
    case 'Favorite':
      console.log('wir sind in favorites switch')
      console.log('helperWord.innerHTML vorher = ' + helperWord.innerHTML);
      helperWord.innerHTML = 'his';
      movie.innerHTML = 'movies';
      console.log('helperWord.innerHTML nachher = ' + helperWord.innerHTML)
      break;

    default:
      helperWord.innerHTML = 'a';
      movie.innerHTML = 'MOVIE';
  }

  generateList(selectedGenre);
})


