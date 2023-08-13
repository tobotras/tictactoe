import { useState } from 'react';

function RoleChooser({callback}) {
    const [role, setRole] = useState("X");
    
    return(
        <div className="chooser">
            <form>
                <label> Choose a player:
                    <select autoFocus={true} onChange={e => setRole(e.target.value)}>
                        <option value="X"> X </option>
                        <option value="O"> O </option>
                    </select>
                </label>
                <button
                    onClick={(event) => {
                        console.log("Calling back from RoleChooer, role is " + role);
                        callback(role);
                        console.log("Did the call");
                        event.preventDefault();
                    }}
                >Start the game</button>
            </form>
        </div>
    );
}

export default RoleChooser;
