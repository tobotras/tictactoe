import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function App() {

    const [myState, setState] = useState(0);

    var cnt = 0;

    useEffect(() => {
        new EventSource('http://localhost:8080/events')
            .onmessage = (e) => {
                console.log('Got event: ' + e.data);
                setState(++cnt);
            }
    }, []);
    
    useEffect(() => {
        console.log(`Updated state: ${myState}`);
    }, [myState]);        
    
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>myState is {myState}.</p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
