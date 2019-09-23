import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import './App.css';

const BASE_ELO = 1200;

function generateCombinations(n) {
  const results = [];
  _.range(n).forEach(first => {
    _.range(first + 1, n).forEach(second => {
      results.push([first, second]);
    });
  });
  return _.shuffle(results);
}

function getRatingDelta(myRating, opponentRating, myGameResult) {
  if ([0, 0.5, 1].indexOf(myGameResult) === -1) {
    return null;
  }
  
  var myChanceToWin = 1 / ( 1 + Math.pow(10, (opponentRating - myRating) / 400));

  return Math.round(32 * (myGameResult - myChanceToWin));
}

function getNewRating(myRating, opponentRating, myGameResult) {
  return myRating + getRatingDelta(myRating, opponentRating, myGameResult);
}

function ChoiceCard(props) {
  return (
    <div id={props.id} className="choice-card" onClick={props.onClick}>{props.text}</div>
  );
}

let allCombos = [];

let choices = [
  {
    text: 'hungryhungryhippo',
    elo: BASE_ELO,
  },
  {
    text: 'cats',
    elo: BASE_ELO,
  },
  {
    text: 'dogs',
    elo: BASE_ELO,
  },
  {
    text: 'elephant',
    elo: BASE_ELO,
  },
  {
    text: 'frog',
    elo: BASE_ELO,
  },
  {
    text: 'gorilla',
    elo: BASE_ELO,
  },
];

function App() {
  const [choice1, setChoice1] = useState({ text: '', index: 0 });
  const [choice2, setChoice2] = useState({ text: '', index: 1 });
  const [pasteText, setPasteText] = useState('');
  const [mode, setMode] = useState('vote');

  function initializeCombos() {
    allCombos = generateCombinations(choices.length);
    const firstCombo = allCombos.pop();

    setChoice1({
      text: choices[firstCombo[0]].text,
      index: firstCombo[0],
    });
    setChoice2({
      text: choices[firstCombo[1]].text,
      index: firstCombo[1],
    });
    setPasteText(getPasteText());
  }

  function getPasteText() {
    const sortedChoices = _.sortBy(choices, ['elo']).reverse();
    return sortedChoices.map(choice => {
      return `${choice.text}, ${choice.elo}`.trim();
    }).join('\n');
  }

  function handleClick(index) {
    const index1 = choice1.index;
    const index2 = choice2.index;
    const oldRating1 = choices[index1].elo;
    const oldRating2 = choices[index2].elo;

    choices[index1].elo = getNewRating(oldRating1, oldRating2, index === 0 ? 1 : 0);
    choices[index2].elo = getNewRating(oldRating2, oldRating1, index === 1 ? 1 : 0);

    if (!allCombos.length) {
      alert('All Over');
      initializeCombos();
    }

    const combo = allCombos.pop();

    setChoice1({
      text: choices[combo[0]].text,
      index: combo[0],
    });
    setChoice2({
      text: choices[combo[1]].text,
      index: combo[1],
    });
    setPasteText(getPasteText());
  }

  function handleChange(event) {
    setPasteText(event.target.value);

    const lines = event.target.value.split('\n');
    
    choices = lines.map(line => {
      const tokens = line.split(',');
      let elo = BASE_ELO;
      let text = line;
      const lastToken = _.last(tokens).trim();
      if (/^\d+$/.test(lastToken)) {
        elo = parseInt(lastToken);
        text = tokens.slice(0, -1).join(',');
      }
      return { elo, text };
    });

    localStorage.setItem();

    initializeCombos();
  }

  useEffect(() => {
    initializeCombos();
  }, []);

  useEffect(() => {
    const f = event => {
      if (event.which === 37 || event.which === 65) {
        // Left arrow or A
        handleClick(0);
      } else if (event.which === 39 || event.which === 68) {
        // Right arrow or D
        handleClick(1);
      } else if (event.which === 27) {
        // Escape
        setMode(mode === 'vote' ? 'edit' : 'vote');
      }
    };

    document.addEventListener('keydown', f);

    return () => document.removeEventListener('keydown', f);
  }, [mode]);

  return (
    <div>
      <div id="choice-grid">
        <ChoiceCard
          id="choice-card-1"
          text={choice1.text}
          onClick={() => handleClick(0)}
        />
        <ChoiceCard
          id="choice-card-2"
          text={choice2.text}
          onClick={() => handleClick(1)}
        />
      </div>
      {
        mode === 'edit' &&
        <div id="text-area-wrapper">
          <textarea value={pasteText} onChange={event => handleChange(event)}></textarea>
        </div>
      }
    </div>
  );
}

export default App;
