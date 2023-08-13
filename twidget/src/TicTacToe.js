import './TicTacToe.css';
import { useState } from 'react';
import Board from './Board';
import RoleChooser from './RoleChooser';

function TicTacToe() {
    const [player, setPlayer] = useState(null);

    function RoleChosen(role) {
        setPlayer(role);
    }
    
    console.log("Showing screen by player: " + player);
    if (player === null)       
        return <RoleChooser callback={RoleChosen} />;
    else
        return <Board state={[player, setPlayer]} />;
}

export default TicTacToe;
