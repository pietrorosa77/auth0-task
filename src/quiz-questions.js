import * as React from 'react';
import { Loading } from 'react-simple-chatbot';
import config from './config';

export default function QuizQuestions(props) {
  React.useEffect(() => {
    getQuizQuestions();
  }, []);

  async function getQuizQuestions() {
    const name = props.steps['2'].value;
    const difficulty = props.steps['4'].value;
    const category = props.steps['6'].value;
    const amount = props.steps['8'].value;

    const gameReq = await fetch(config.WEBTASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        difficulty,
        category,
        amount
      })
    });

    const gameResp = await gameReq.json();

    props.onGameData(gameResp);
  }

  return <Loading />;
}
