import './App.css';
import TicTacToe from './TicTacToe'

function Heading() {
    return (<h1>This is an H1 heading</h1>);
}

function App() {
    return (
        <div className="App">
            <header className="App-header">

                <TicTacToe />
               
            </header>
        </div>
    );
}

export { App, Heading };
