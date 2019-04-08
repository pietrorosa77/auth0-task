import * as React from 'react';
import { Loading } from 'react-simple-chatbot';
import config from './config';

export default function QuizQuestions(props) {
  const [results, setResults] = React.useState();
  React.useEffect(() => {
    getQuizResults();
  }, []);

  async function getQuizResults() {
    const resultsReq = await fetch(`${config.WEBTASK_URL}?gameId=${props.gameId}`);
    const resultsResp = await resultsReq.json();

    const results = Object.keys(props.steps)
      .filter(key => key.startsWith('answ'))
      .map(answ => {
        const answerStep = props.steps[answ];
        const correspondingSolution = resultsResp.find(el => el.id === answerStep.metadata.id);
        return {
          question: config.decode(correspondingSolution.question),
          correctAnswer: config.decode(correspondingSolution.correct_answer),
          userAnswer: config.decode(answerStep.value),
          ok: correspondingSolution.correct_answer === answerStep.value
        };
      });

    setResults(results);
  }

  return !results ? (
    <Loading />
  ) : (
    <div>
      {results.map((res, i) => (
        <div key={i} className={`"p-3 border alert alert-${res.ok ? 'success' : 'danger'}`}>
          <div>{res.question}</div>
          {!res.ok && (
            <div>
              <del>{res.userAnswer}</del>
            </div>
          )}
          <div>
            <strong>{res.correctAnswer}</strong>
          </div>
        </div>
      ))}
      <div className="p-3 border bg-light">
        <button className="btn btn-primary" onClick={props.onNewGame}>
          New Game
        </button>
      </div>
    </div>
  );
}
