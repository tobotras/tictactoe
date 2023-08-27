import './TicTacToe.css';
import Board from './Board';
import RoleChooser from './RoleChooser';

function TicTacToe({state}) {
    const [player, setPlayer] = state

    function RoleChosen(role) {
        setPlayer(role);
    }
    console.log(`state is ${state} of type ${typeof state}`);    
    console.log("Showing screen by player: " + player);
    if (player === null)       
        return <RoleChooser callback={RoleChosen} />;
    else
        return <Board state={state} />;
}

export default TicTacToe;
