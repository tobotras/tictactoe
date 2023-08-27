import './App.css';
import TicTacToe from './TicTacToe'
import { useState } from 'react';

function Heading() {
    return (<h1>This is an H1 heading</h1>);
}

function App() {
    const [player, setPlayer] = useState(null);
    
    return (
        <div className="App">
            <header className="App-header">
                <h2>Player: {player}</h2>
                <TicTacToe state={[player, setPlayer]} />                    
            </header>
        </div>
    );
}

export { App, Heading };
