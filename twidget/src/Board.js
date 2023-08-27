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
    if (board === undefined)
        return true;
    return []
        .concat(...board)
        .filter(c => c === null)
        .length > 0;
}

function Board({state}) {
    const [player, setPlayer] = state
    console.log(`state is ${state} of type ${typeof state}`);
    console.log(`Playing the game, setPlayer is ${setPlayer} of type ${typeof setPlayer}`);

    const [theBoard, setTheBoard] = useState(emptyBoard);

    useEffect(() => {
        console.log("Board changed, it is now " + theBoard);
        if (!moreMoves(theBoard)) {
            console.log("End of game!");
            alert("End of game!");
            setPlayer(null);
        }
    }, [theBoard]);

    function startEventStream() {
        new EventSource("http://localhost:8080/events")
            .onmessage = (e) => {
                console.log( `message: ${e.data}` );
                setTheBoard(JSON.parse(e.data));
            };
    }
    
    useEffect(() => {
        startEventStream();
        fetchBoard();
    }, []);

    function fetchBoard() {
        fetch('http://localhost:8080/board')
            .then((resp) => {
                if (resp.ok) {
                    return resp.json();
                }
                throw new Error('Board load error: ' + resp.body);
            })
            .then((data) => {
                console.log("Got data from GET: " + data.board + ", setting the board!");
                setTheBoard(data.board);
            })
            .catch((err) => {
                console.log("Get error: " + err.message);
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
                const content = resp.json();
                if (!resp.ok) {
                    console.log("BAD REQUEST!!");
                    return content
                        .then((c) => {return {...c, "failure": true}});
                }
                return content;
            })
            .then((data) => {
                console.log(`data from move: ${JSON.stringify(data)}`);
                if (data.failure === undefined) {
                    setTheBoard(data.board);
                    if (data.winner === player) {
                        alert('Wow! You won!');
                        doReset();
                    }
                } else
                    alert(data.status);
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
