- Simple quiz bot.

- uses OPEN TRIVIA API https://opentdb.com/api_config.php
  -the webtask accepts GET and POST

in the POST it creates a new game: 1)retrieve the questions from open trivia passing the config parameters choosen by the user. The questions (along with answers) are stored to 'https://api.myjson.com. This json store gives back a unique id used to get the questions at the end of the game to check for the results.
The questions retrieved from api are sent to client without info on the correct answer (so the user can't cheat looking at the API response)

the first GET gets the available categories and difficulty levels
the get results uses the gameId obtained in the newGame creation to get all the questions and results and compare it with what the user choose

the decode function (in config) is used to decode the text sent back by open trivia api
