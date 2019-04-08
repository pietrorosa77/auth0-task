const axios = require('axios');
const url = require('url');

const writeResponse = (res, obj, code) => {
  const response = JSON.stringify(obj);

  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.write(response);
  res.end();
};

const getGameResults = async (gameId, response) => {
  const results = await axios.get(`https://api.myjson.com/bins/${gameId}`);
  writeResponse(response, results.data, 200);
};

const getQuizBaseParameters = async response => {
  const cat = await axios.get('https://opentdb.com/api_category.php');
  const rsp = {
    categories: cat.data,
    level: ['easy', 'medium', 'hard']
  };
  writeResponse(response, rsp, 200);
};

const newGame = async (request, response) => {
  const body = await getBody(request);
  if (!body || !body.amount || !body.difficulty || !body.category) {
    writeResponse(
      response,
      { message: 'parameters required: name, category, difficulty, amount' },
      400
    );
  } else {
    const { amount, difficulty, category } = body;

    const apiResp = await axios.get(
      `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple&encode=url3986`
    );

    const questions = apiResp.data.results.map((el, id) => ({ ...el, id }));
    const clientQuestions = transformQuestions(questions);

    //save questions
    const game = await axios.post('https://api.myjson.com/bins', questions);

    const gameId = game.data.uri.substring(
      game.data.uri.lastIndexOf('/') + 1,
      game.data.uri.length
    );
    writeResponse(response, { gameId, questions: clientQuestions }, 200);
  }
};

const transformQuestions = questions => {
  return questions.map(qs => {
    // Shuffles array so correct answer won't be always at the end
    const options = shuffle(qs.incorrect_answers.concat([qs.correct_answer]));
    return { question: qs.question, options, id: qs.id };
  });
};

/**
 * Shuffles array so correct answer won't be always at the end.
 */
const shuffle = input => {
  let ret = input.slice();
  for (let i = ret.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ret[i], ret[j]] = [ret[j], ret[i]];
  }
  return ret;
};

const getBody = request => {
  return new Promise((resolve, reject) => {
    let body = [];
    request
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        resolve(JSON.parse(body));
      });
  });
};

module.exports = async (ctx, req, res) => {
  try {
    switch (req.method) {
      case 'GET':
        const query = url.parse(req.url, true).query;
        console.log(query);
        if (query && query.gameId) {
          await getGameResults(query.gameId, res);
        } else {
          await getQuizBaseParameters(res);
        }
        break;
      case 'POST':
        newGame(req, res);
        break;
      default:
        throw new Error('method not implemented');
    }
  } catch (err) {
    console.log(err);
    writeResponse(res, err, 500);
  }
};
