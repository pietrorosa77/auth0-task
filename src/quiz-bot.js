import * as React from 'react';
import ChatBot, { Loading } from 'react-simple-chatbot';
import { ThemeProvider } from 'styled-components';
import QuizQuestions from './quiz-questions';
import QuizResult from './quiz-results';
import config from './config';
import logo from './auth0.png';

const theme = {
  background: '#f5f8fb',
  fontFamily: 'Arial',
  headerBgColor: '#EB5424',
  headerFontColor: '#fff',
  headerFontSize: '15px',
  botBubbleColor: '#EB5424',
  botFontColor: '#fff',
  userBubbleColor: '#fff',
  userFontColor: '#4a4a4a'
};

export default function QuizSetup(props) {
  const [activeSteps, setActiveSteps] = React.useState();
  const [gameId, setGameId] = React.useState();

  React.useEffect(() => {
    getQuizOptions();
  }, []);

  async function getQuizOptions() {
    const optResp = await fetch(config.WEBTASK_URL);
    const quizOptions = await optResp.json();
    const steps = [
      {
        id: '1',
        message: 'What is your name?',
        trigger: '2'
      },
      {
        id: '2',
        user: true,
        trigger: '3'
      },
      {
        id: '3',
        message:
          'Hi {previousValue}, welcome to Auth0 Quiz challenge! Please choose the difficulty level',
        trigger: '4'
      },
      {
        id: '4',
        options: quizOptions.level.map(el => ({ value: el, label: el, trigger: '5' }))
      },
      {
        id: '5',
        message: 'Please choose the category',
        trigger: '6'
      },
      {
        id: '6',
        options: quizOptions.categories.trivia_categories.map(el => ({
          value: el.id,
          label: el.name,
          trigger: '7'
        }))
      },
      {
        id: '7',
        message: 'How many questions do you want to answer? (1 to 30)',
        trigger: '8'
      },
      {
        id: '8',
        user: true,
        validator: value => {
          if (isNaN(value) || !value || value > 30) {
            return 'please enter a number between 1 and 30';
          }
          return true;
        },
        trigger: '9'
      },
      {
        id: '9',
        asMessage: true,
        component: <QuizQuestions onGameData={onGameData} />
      }
    ];
    setActiveSteps(steps);
  }

  const onNewGame = async () => {
    await getQuizOptions();
    setGameId(undefined);
  };

  const onGameData = gameData => {
    const quizSteps = gameData.questions.reduce((acc, curr, i) => {
      const question = {
        id: `${i}`,
        trigger: `answ-${i}`,
        message: config.decode(curr.question)
      };
      const answers = {
        id: `answ-${i}`,
        metadata: { id: curr.id },
        options: curr.options.map(el => ({
          value: el,
          label: config.decode(el),
          trigger: `${i + 1}`
        }))
      };
      acc = acc.concat([question, answers]);
      return acc;
    }, []);
    const resultsStep = {
      id: `${gameData.questions.length}`,
      asMessage: true,
      component: <QuizResult gameId={gameData.gameId} onNewGame={onNewGame} />,
      end: true
    };

    setActiveSteps(quizSteps.concat([resultsStep]));
    setGameId(gameData.gameId);
  };

  const QuizInit = () => (
    <div
      style={{
        height: '610px',
        width: '100%',
        margin: '50px auto',
        textAlign: 'center',
        fontSize: '100pt'
      }}
    >
      <i className="fas fa-circle-notch fa-spin" />
    </div>
  );

  return !activeSteps ? (
    <QuizInit />
  ) : (
    <ThemeProvider theme={theme}>
      <ChatBot
        botAvatar={logo}
        key={`game-${gameId || 'init'}`}
        steps={activeSteps}
        botDelay={500}
        speechSynthesis={{ enable: true, lang: 'en' }}
        bubbleOptionStyle={{ color: '#fff' }}
        headerTitle="Webtask powered quiz challenge!"
        style={{ height: '610px', width: '100%', margin: '50px auto' }}
        contentStyle={{ height: '500px' }}
      />
    </ThemeProvider>
  );
}
