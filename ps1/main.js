/*
 * SI 379 Problem Set 1: Whack-a-Buckeye
 * 
 * I used ChatGPTto help me better understand the assignment requirements and to help me format the answer. 
 * It helped claried how to:
 * - use setInterval to make moles appear randomly every second.
 * - add event listeners to handle mole removal, animations, and score updates.
 * - Implement game-ending logic when the score reaches 45.
 * I also used google to help me understand some of the event listeners.
*/
let score = 0;

// Write code that *every second*, picks a random unwhacked hole (use getRandomUnwhackedHoleId)
// and adds the "needs-whack" class
// Spawn Moles
const interval = setInterval(() => {
    // checks if there are any empty holes
    const holeId = getRandomUnwhackedHoleId();
    if (holeId) {
        document.getElementById(holeId).classList.add('needs-whack');
    }
}, 1000);

for(const id of getAllHoleIds()) {
   const hole = document.getElementById(id);
   hole.addEventListener('click', () => {
    // no else because instructions say do nothing
    if (hole.classList.contains('needs-whack')) {
        hole.classList.remove('needs-whack');
        hole.classList.add('animating-whack');
        setTimeout(() => {
            hole.classList.remove('animating-whack');
        }, 500);

        // increment and display score
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
        // stop game when score reaches 45
        if (score >= 45) {
            clearInterval(interval);
        }
    }
   });
}

/**
 * @returns a random ID of a hole that is "idle" (doesn't currently contain a mole/buckeye). If there are none, returns null
 */
function getRandomUnwhackedHoleId() {
    const inactiveHoles = document.querySelectorAll('.hole:not(.needs-whack)');  // Selects elements that have class "hole" but **not** "needs-whack"

    if(inactiveHoles.length === 0) {
        return null;
    } else {
        const randomIndex = Math.floor(Math.random() * inactiveHoles.length);
        return inactiveHoles[randomIndex].getAttribute('id');
    }
}

/**
 * @returns a list of IDs (as strings) for each hole DOM element
 */
function getAllHoleIds() {
    const allHoles = document.querySelectorAll('.hole'); 
    const ids = [];
    for(const hole of allHoles) {
        ids.push(hole.getAttribute('id'));
    }
    return ids;
}
