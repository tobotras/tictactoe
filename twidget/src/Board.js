import { useState, useEffect } from 'react';

const emptyBoard = [[null, null, null],
                    [null, null, null],
                    [null, null, null]];

function streamToString(stream) {
    const chunks = [];
    for (let chunk of stream) {
        chunks.push(chunk);
    }
    return chunks.join();
}

function moreMoves(board) {
    return []
        .concat(...board)
        .filter(cell => cell === null)
        .length > 0;
}

function Board({state}) {
    const [player, setPlayer] = state
    console.log("Playing the game");

    const [theBoard, setTheBoard] = useState(emptyBoard);
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        console.log("Board changed, it is now " + theBoard);
        if (!moreMoves(theBoard)) {
            alert("End of game!");
            setPlayer(null);
        }
    }, [theBoard, setPlayer]);

    useEffect(() => {
        async function fetchMessage() {
            console.log('Starting event stream');
            fetch('http://localhost:8080/events', {
                headers: { Accept: 'text/event-stream' },
                onopen(res) {
                    if (res.ok)
                        console.log("Connected to event source");
                },
                onmessage(event) {
                    console.log("Got event: " + event.data);
                    const parsed = JSON.parse(event.data);
                    setMessages((msgs) => [...msgs, parsed]);
                },
                onclose() {
                    console.log("Disconnected from event source");
                },
                onerror(e) {
                    console.log("Event stream error", e);
                }
            });
        }
        
        fetchMessage();
    }, []);
          
    function getData() {
        console.log("Getting board");
        fetch('http://localhost:8080/board')
            .then((resp) => resp.json())
            .then((data) => {
                console.log("Data obtained:" + data.board);
                setTheBoard(data.board);
            })
            .catch((err) => {
                // console.log(err.message);
                alert(err);
            });
    }

    function doReset() {
        fetch('http://localhost:8080/board', {
            method: 'DELETE'
        })
            .then((resp) => {
                if (resp.ok)
                    return resp.json();
                throw new Error('Delete error: ' + resp.body);
            })
            .catch((err) => {
                console.log("Reset error: " + err.message);
            });
        console.log("Delete done, now get");
        getData();
        setPlayer(null);
    }

    function makeMove(event) {
        const id = event.target.id;
        const row = id.charCodeAt(0) - 'a'.charCodeAt(0);
        const col = id.charCodeAt(1) - '1'.charCodeAt(0);
        const formData = new FormData();
        formData.append('row', row);
        formData.append('col', col);
        formData.append('player', player);
        
        fetch('http://localhost:8080/move', {
            method: 'POST',
            //headers: {'Content-Type': 'multipart/form-data'},
            body: formData
        })
            .then((resp) => {
                if (resp.ok)
                    return resp.json();
                return JSON.stringify(resp.body);
            })
            .then((data) => {
                setTheBoard(data.board);
                if (data.winner === player) {
                    alert('Wow! You won!');
                    doReset();
                }
            })
            .catch((err) => {
                console.log("Move error: " + err.message);
            });
    }

    function cell(x, y) {
        if (!Array.isArray(theBoard) || theBoard[x][y] === null)
            return " ";
        return theBoard[x][y];
    }

    return(        
        <div className="board">
            <table>
                <tbody>
                    <tr className="top-row">
                        <td id="a1" onClick={(e)=>makeMove(e)}>{cell(0,0)}</td>
                        <td id="a2" onClick={(e)=>makeMove(e)}>{cell(0,1)}</td>
                        <td id="a3" onClick={(e)=>makeMove(e)}>{cell(0,2)}</td>
                    </tr>
                    <tr className="middle-row">
                        <td id="b1" onClick={(e)=>makeMove(e)}>{cell(1,0)}</td>
                        <td id="b2" onClick={(e)=>makeMove(e)}>{cell(1,1)}</td>
                        <td id="b3" onClick={(e)=>makeMove(e)}>{cell(1,2)}</td>
                    </tr>
                    <tr className="bottom-row">
                        <td id="c1" onClick={(e)=>makeMove(e)}>{cell(2,0)}</td>
                        <td id="c2" onClick={(e)=>makeMove(e)}>{cell(2,1)}</td>
                        <td id="c3" onClick={(e)=>makeMove(e)}>{cell(2,2)}</td>
                    </tr>
                </tbody>
            </table>
            <div align='center'>
                <button onClick={(e)=>doReset()}>Reset</button>
            </div>
        </div>
    );
}

export default Board;
