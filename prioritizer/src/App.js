import React from 'react';
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
    <div className="choice-card" onClick={props.onClick}>{props.text}</div>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.choices = [
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
      {
        text: 'human',
        elo: BASE_ELO,
      },
    ];
    this.state = {
      choice1: {
        text: '',
        index: 0,
      },
      choice2: {
        text: '',
        index: 1,
      },
    };
  }

  initializeCombos() {
    this.allCombos = generateCombinations(this.choices.length);
    const firstCombo = this.allCombos.pop();

    this.setState({
      choice1: {
        text: this.choices[firstCombo[0]].text,
        index: firstCombo[0],
      },
      choice2: {
        text: this.choices[firstCombo[1]].text,
        index: firstCombo[1],
      },
      pasteText: this.getPasteText(),
    });
  }

  getPasteText() {
    const sortedChoices = _.sortBy(this.choices, ['elo']).reverse();
    return sortedChoices.map(choice => {
      return `${choice.text}, ${choice.elo}`.trim();
    }).join('\n');
  }

  handleClick(index) {
    const index1 = this.state.choice1.index;
    const index2 = this.state.choice2.index;
    const oldRating1 = this.choices[index1].elo;
    const oldRating2 = this.choices[index2].elo;

    this.choices[index1].elo = getNewRating(oldRating1, oldRating2, index === 0 ? 1 : 0);
    this.choices[index2].elo = getNewRating(oldRating2, oldRating1, index === 1 ? 1 : 0);

    if (!this.allCombos.length) {
      alert('All Over');
      this.initializeCombos();
    }

    const combo = this.allCombos.pop();

    this.setState({
      choice1: {
        text: this.choices[combo[0]].text,
        index: combo[0],
      },
      choice2: {
        text: this.choices[combo[1]].text,
        index: combo[1],
      },
      pasteText: this.getPasteText(),
    });
  }

  handleChange(event) {
    this.setState({
      pasteText: event.target.value,
    });

    const lines = event.target.value.split('\n');
    
    this.choices = lines.map(line => {
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

    this.initializeCombos();
  }

  componentDidMount(){
    this.initializeCombos();

    document.addEventListener('keydown', event => {
      if (event.which === 37 || event.which === 65) {
        // Left arrow or A
        this.handleClick(0);
      } else if (event.which === 39 || event.which === 68) {
        // Right arrow or D
        this.handleClick(1);
      }
    });
  }

  render() {
    return (
      <div>
        <ChoiceCard
          text={this.state.choice1.text}
          onClick={() => this.handleClick(0)}
        />
        <ChoiceCard
          text={this.state.choice2.text}
          onClick={() => this.handleClick(1)}
        />
        <textarea value={this.state.pasteText} onChange={event => this.handleChange(event)}></textarea>
      </div>
    );
  }
}

export default App;
