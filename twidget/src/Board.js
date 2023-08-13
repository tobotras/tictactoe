import { useState, useEffect } from 'react';

const emptyBoard = [[null, null, null],
                    [null, null, null],
                    [null, null, null]];

function MoreMoves(board) {
    return []
        .concat(...board)
        .filter(cell => cell === null)
        .length > 0;
}

function Board({state}) {
    const [player, setPlayer] = state
    console.log("Playing the game");

    const [theBoard, setTheBoard] = useState(emptyBoard);

    useEffect(() => {
        console.log("Board changed, it is now " + theBoard);
        if (!MoreMoves(theBoard)) {
            alert("End of game!");
            setPlayer(null);
        }
    }, [theBoard, setPlayer]);

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
                if (resp.status !== 200)
                    throw new Error('Delete error: ' + resp.body);
                else
                    return resp.json();
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
                if (resp.status !== 200)
                    throw new Error('Post error:' + resp.body);
                else
                    return resp.json();
            })
            .then((data) => {
                setTheBoard(data.board);
                if (data.winner === player)
                    alert('Wow! You won!');
            })
            .catch((err) => {
                console.log("Move error:" + err.message);
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
