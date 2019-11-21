# recommend-a-movie
a basic movie recommendation tool


# Recommend a Movie
**a basic movie recommendation tool based off of my ratings on letterboxd.com**

## Instructions

You can either visit the page here https://hal-9.github.io/recommend-a-movie/ or clone/download a local version to your computer to run it by opening the index.html file in your browser.

## Features

* the user can select a genre in the header of the page 
* upon selection, the page displays a grid of all movie posters matching the genre 
* all movie posters are external links to the letterboxd page of the movie

## Code

* as the letterboxd page has no open api to work with, i exported my ratings into a .csv file and then converted into json to make use of the data
* i had to write a script (and run it through a node.js server) that scrapes the letterboxd page of each movie for a link to the according tmdb page
* in that link, there was a unique ID for the movie, which i then extracted
* with that id i was then able make fetch requests to the tmdb api, to get a poster path and genres for each movie
* finally i took that new information and added it into each movie object in my json data file 
* with that file i can now dynamically create a grid of movies based on user input and sorted by rating
* to make the script work i had to utilize fetch requests and work with promise chains, moreover i had to use a rate limiter to make requests according to the tmdb api

* in order to create the page layout i used css grid and filled an empty div dynamically with js by manipulating the dom. 

## License

