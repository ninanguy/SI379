import { getBinomialProbability } from './utils.js';

const BALL_COLOR = "#2F65A7"; // default color for pegs and actual bars (umich blue)

// fallback values (will be overwritten by user input, but still needed for initialization)
// const NUM_BALLS = 10;          // default number of balls to drop
// const PROBABILITY_RIGHT = 0.5; // default probability of bouncing right- the probability of a ball going right (as opposed to left)

// get references to all interactive DOM elements
window.addEventListener('DOMContentLoaded', () => {
 // where everything gets drawn - the parent SVG container
 const svgElement = document.querySelector('svg');
 
 // input: how many rows of pegs aka the input for the number of levels
 const numLevelsInput = document.querySelector('#num-levels');  
 // the button to drop the balls and start the ball dropping animation
 const dropBallsButton = document.querySelector('#do-drop');
 // The slider input for the speed of the animation
 const speedInput = document.querySelector('#speed');
  // The input for number of balls to drop
 const numBallsInput = document.querySelector('#ball-count'); 
 // the input for probability of bouncing right   
 const probRightInput = document.querySelector('#prob-right');
 
 // store SVG element references so we can remove or update them later
 // A 2D array of circle elements representing the pegs
 const pegs = [];
 // An array of number of balls that actually hit each bar
 const actualBars = []; 
 // An array of the expected number of balls that hit each bar 
 const expectedBars = []; // array of rectangles for expected outcome bars
 
 
 const GRAPH_HEIGHT = 300;          // The maximum height of the graph (in pixels)
 const BALL_RADIUS = 10;            // The radius of the balls (in pixels)
 const PEG_RADIUS = 3;              // The radius of the pegs (in pixels)
 const X_MOVEMENT = 30;             // The horizontal distance between pegs (in pixels)
 const Y_MOVEMENT = 20;             // The vertical distance between pegs (in pixels)
 const DELAY_BETWEEN_BALLS = 1000;  // How long to wait between dropping balls (in milliseconds)
 const DELAY_BETWEEN_PEGS  = 1000;  // How long it takes for a ball to drop from one peg to the next (in milliseconds)
 const DELAY_WHEN_DROP     = 6000;  // How long it takes for the ball to "fall" into the hole (in milliseconds)
 
 const PADDING = Math.max(PEG_RADIUS, BALL_RADIUS, X_MOVEMENT/2) + 5; // The padding around the edge of the SVG element (in pixels)
 
 
 function drawBoard() {
     Array.from(svgElement.children).forEach(child => child.remove()); // Remove all the children of the SVG element
     // read latest user inputs
     const NUM_LEVELS = parseInt(numLevelsInput.value); // How many levels of pegs to have
     const NUM_BALLS = parseInt(numBallsInput.value);
     const PROBABILITY_RIGHT = parseFloat(probRightInput.value);
 
     // calculate svg canvas size based on number of levels
     const TOTAL_WIDTH  = (NUM_LEVELS-1) * X_MOVEMENT + 2 * PADDING;                // The total width of the SVG element (in pixels)
     const TOTAL_HEIGHT = (NUM_LEVELS-1) * Y_MOVEMENT + 2 * PADDING + GRAPH_HEIGHT; // The total height of the SVG element (in pixels)
 
     
     // calculate expected binomial probabilities for final slot distribution
     // The mode (most probable outcome) of the binomial distribution
     const MODE = Math.round((NUM_LEVELS-1) * PROBABILITY_RIGHT);
     // chance of most common outcome (the estimated max probability)
     const maxProb = getBinomialProbability(NUM_LEVELS-1, MODE, PROBABILITY_RIGHT);
     // The scale factor for the expected/actual bars visuals
     const BAR_SCALE_FACTOR = 0.5 * GRAPH_HEIGHT / maxProb; // The scale factor for the bars
 
     // Set the width and height of the SVG element (row x column)
     svgElement.setAttribute('width', TOTAL_WIDTH);
     svgElement.setAttribute('height', TOTAL_HEIGHT); 
 
     // A 2D array of the number of balls that hit each peg
     const hitCounts = []; // A 2D array of the number of balls that hit each peg
     
     // build a triangle of pegs row by row
     for(let level = 0; level < NUM_LEVELS; level++) {
         // To track the hit counts for pegs in this row
         const rowHitCounts = [];
         hitCounts.push(rowHitCounts);
         
         // To track the svg circles (the pegs) in this row
         const rowPegs = [];
         pegs.push(rowPegs);
 
         // only place pegs at even column indicies (0, 2, 4, etc.)
         for(let i = NUM_LEVELS - level - 1; i <= NUM_LEVELS + level - 1; i+=2) {
             // Initialize the hit count for this peg at 0
             hitCounts[level][i] = 0; 
 
             // find the pixel position for the current peg
             const { x, y } = getGraphicLocation(i, level);
             // make a white peg
             const circle = createCircle(x, y, PEG_RADIUS, '#FEFEFE', 'none', svgElement);
 
             // top peg is always filled in
             if(level === 0) {
                 circle.setAttribute('fill', BALL_COLOR); // The top peg is always filled in
             }
             // Store the peg circle in the 2D array
             pegs[level][i] = circle; 
         }
     }
 
     // Draw the bars for the expected (gray) and actual (blue) probabilities
     // loop through every other column at the bottom row (0, 2, 4, 6, etc.)
     for (let i = 0; i < 2 * NUM_LEVELS - 1; i += 2) { 
         // Get the x and y coordinates for the peg in the current column in the last row
         const { x, y } = getGraphicLocation(i, NUM_LEVELS-1);
 
         // The y position of the top bar should start (a little below the peg)
         const barY = y + PEG_RADIUS + 2; 
 
         // Create a blue rectangle for the actual number of balls that land here (height = 0 initially)
         const actualBar = createRect(x - X_MOVEMENT/2, barY, X_MOVEMENT, 0, BALL_COLOR, 'none', svgElement); 
         // Add the actual bar to the array to track it later
         actualBars.push(actualBar);
         // The expected probability that a ball lands here (binomial math)
         const prob = getBinomialProbability(NUM_LEVELS-1, Math.floor(i/2), PROBABILITY_RIGHT);
         // Scale the probability to a bar height
         // const expectedHeight = 0.5 * GRAPH_HEIGHT * prob / getBinomialProbability(NUM_LEVELS-1, Math.round((NUM_LEVELS-1) * PROBABILITY_RIGHT), PROBABILITY_RIGHT);
 
         // Create a new rectangle for the expected number of balls that hit
         const expectedBar = createRect(x - X_MOVEMENT/2, barY, X_MOVEMENT, BAR_SCALE_FACTOR * prob, 'rgba(0, 0, 0, 0.1)', BALL_COLOR, svgElement); 
 
         // Add the expected bar to the array to track it
         expectedBars.push(expectedBar);
     }
     // Drop one ball down through the board
     async function dropBall() {
         // Start at the top row
         let row = 0;
         // Start in the middle column
         let col = NUM_LEVELS - 1; 
 
         // Get the starting (x, y) position for the ball
         const { x, y } = getGraphicLocation(col, row);
         
         // Create a new ball circle at the top of the board
         const circle = createCircle(x, y, BALL_RADIUS, BALL_COLOR, BALL_COLOR, svgElement);
 
         // Make the ball slightly transparent to see pegs underneath when ball passes through
         circle.setAttribute('opacity', 0.9);
 
         // Drop the ball down the board by looping down the rows and randomly choosing left or right
         // Move the ball down one row at a time
         for(let i = 0; i < NUM_LEVELS-1; i++) {
             // The row is always incremented
             row++;
 
             // If the random number is less than the probability of going right, go right
             if(Math.random() < PROBABILITY_RIGHT) { 
                 // Go right
                 col++;
             } else {
                 // Go left
                 col--; 
             }
             // Get the new (x, y) position after moving
             const { x, y } = getGraphicLocation(col, row);
             // Animate the ball moving to the new location
             await moveCircleTo(circle, x, y, DELAY_BETWEEN_PEGS / parseFloat(speedInput.value)); 
 
             // The peg that the ball just hit
             const peg = pegs[row][col]; 
             // Increment the hit count for this peg
             hitCounts[row][col]++; 
             // If this is the first time the peg was hit (i.e. the peg was not hit before this ball was dropped
             if(hitCounts[row][col] === 1) { 
                 // Change the color of the peg to indicate that it was hit
                 peg.setAttribute('fill', '#DDD');
             } else {
                 // Change the color of the peg to a darker gray to indicate that it was hit
                 peg.setAttribute('fill', '#AAA'); 
             }
         }
 
         // The hit count for the final column
         const finalColHitCount = hitCounts[NUM_LEVELS-1][col];
         // The index of the bar that corresponds to the final column (since there are 2 pegs per bar)
         const barIndex = Math.floor(col/2); 
         // The new height of the bar
         const newBarHeight = BAR_SCALE_FACTOR * finalColHitCount / NUM_BALLS; 
         // Animate the change in height of the bar
         // await changeHeightTo(actualBars[barIndex], newBarHeight, DELAY_WHEN_DROP / parseFloat(speedInput.value)); 
         await changeHeightTo(actualBars[barIndex], newBarHeight, DELAY_WHEN_DROP / parseFloat(speedInput.value));
         // Remove the circle from the SVG element 
         await animateBallFadeOutAndDrop(circle, DELAY_WHEN_DROP / parseFloat(speedInput.value));
         circle.remove(); 
     }
     // Drop all the balls one after another
     async function dropBalls() {
         // Redraw the board to clear the results
         redrawBoard(); 
 
         // Disable the inputs and button while the balls are dropping
         dropBallsButton.setAttribute('disabled', true);
         numLevelsInput.setAttribute('disabled', true);
         
         // Create an array of promises for each ball that is dropped
         const dropBallPromises = []; 
         // Loop to drop each ball
         for(let i = 0; i < NUM_BALLS; i++) {
             // Drop a ball
             const ballDropPromise = dropBall();
             // Wait a random amount of time before dropping the next ball
             await pause(Math.random() * DELAY_BETWEEN_BALLS / parseFloat(speedInput.value)); 
             // Add the promise to the array
             dropBallPromises.push(ballDropPromise); 
         }
         
         // Wait for all the balls to be dropped
         await Promise.all(dropBallPromises); 
 
         // Re-enable the inputs and button after the balls are done dropping
         dropBallsButton.removeAttribute('disabled');
         numLevelsInput.removeAttribute('disabled');
     }
 
     // When the button is clicked, drop the balls
     dropBallsButton.addEventListener('click', dropBalls); 
 
     // Return a function that cleans up the board
     function cleanup() {
         // Remove each expected (gray) bar from the SVG
         expectedBars.forEach(bar => bar.remove()); 
         // Clear the expectedBars array
         expectedBars.splice(0, expectedBars.length); 
 
         // Remove each actual (blue) bar from the SVG
         actualBars.forEach(bar => bar.remove()); 
         // Clear the actualBars array
         actualBars.splice(0, actualBars.length); 
 
         // Remove each peg (circle) from the SVG
         pegs.forEach(row => row.forEach(peg => peg.remove())); 
         // Clear the pegs array
         pegs.splice(0, pegs.length); // ...and clear the array
         // Remove the event listener (we will re-add it when we redraw the board)
         dropBallsButton.removeEventListener('click', dropBalls); 
     }
     
     return cleanup; // Return the cleanup function
 }
 
 
 // Easing function for a smooth slow start (ease-in)
 function easeInQuad(t) {
     return t * t;
 }
 // Easing function for smoother slowdown at the end of each move
 function easeOutQuad(t) {
     return t * (2 - t);
 }
 // Animate just the ball: drop down 20px and fade to 0 opacity
 async function animateBallFadeOutAndDrop(circle, duration) {
     const fromY = parseFloat(circle.getAttribute('cy'));
     const fromOpacity = parseFloat(circle.getAttribute('opacity')) || 0.9;
     const start = Date.now();
 
     return new Promise((resolve) => {
         function step() {
             const now = Date.now();
             const elapsed = now - start;
             const t = Math.min(1, elapsed / duration);
             const eased = easeOutQuad(t);
 
             // Drop the ball down by 20px
             circle.setAttribute('cy', fromY + 20 * eased);
 
             // Fade the ball out
             // fade faster: square the eased time to speed up fade
             circle.setAttribute('opacity', fromOpacity * (1 - t * 2));
 
             if (t < 1) {
                 requestAnimationFrame(step);
             } else {
                 resolve();
             }
         }
 
         step();
     });
 }
 
 
 // Animate the height of a rectangle smoothly from current height to target height
 async function changeHeightTo(rect, toHeight, duration) {
     const fromHeight = parseFloat(rect.getAttribute('height'));
     const start = Date.now();
 
     return new Promise((resolve) => {
         function step() {
             const now = Date.now();
             const elapsed = now - start;
             const t = Math.min(1, elapsed / duration);
             const eased = easeOutQuad(t);
 
             const currentHeight = fromHeight + (toHeight - fromHeight) * eased;
             rect.setAttribute('height', currentHeight);
 
             if (t < 1) {
                 requestAnimationFrame(step);
             } else {
                 resolve();
             }
         }
 
         step();
     });
 }
 
 
 
 // Animates the movement of a circle to a new (x, y) location using easing and requestAnimationFrame
 async function moveCircleTo(circle, cx, cy, duration) {
     const fromX = parseFloat(circle.getAttribute('cx'));
     const fromY = parseFloat(circle.getAttribute('cy'));
     const start = Date.now();
 
     return new Promise((resolve) => {
         function step() {
             const now = Date.now();
             const elapsed = now - start;
             const t = Math.min(1, elapsed / duration);
             const easedT = easeOutQuad(t);
 
             const newX = fromX + (cx - fromX) * easedT;
             const newY = fromY + (cy - fromY) * easedT;
 
             circle.setAttribute('cx', newX);
             circle.setAttribute('cy', newY);
 
             if (t < 1) {
                 requestAnimationFrame(step);
             } else {
                 resolve();
             }
         }
 
         step();
     });
 }
 /**
  * Translates a column and row into a pixel location
  * 
  * @param {number} col The column of the peg (0 is the leftmost peg)
  * @param {number} row The row of the peg (0 is the topmost peg)
  * @returns {Object} An object with x and y properties representing the location of the peg in pixels
  */
 
 // Convert a (col, row) grid position into pixel (x, y) coordinates
 function getGraphicLocation(col, row) {
     // Return an object with the x and y coordinates
     return {
         // Calculate the x position based on column number
         // and the y based on the row number
         x: PADDING + col * (X_MOVEMENT/2),
         y: PADDING + row *  Y_MOVEMENT
     };
 }
 
 /**
  * Returns a promise that resolves after the given number of milliseconds
  * 
  * @param {number} ms The number of milliseconds to pause
  * @returns A promise that resolves after the given number of milliseconds
  */
 
 // Pause for a given number of milliseconds
 function pause(ms) {
     // Return a promise that resolves after the given time
     return new Promise(resolve => setTimeout(resolve, ms));
 }
 
 /**
  * Creates a rectangle and appends it to the parent SVG element
  * 
  * @param {number} x The x coordinate of the top left corner of the rectangle
  * @param {number} y The y coordinate of the top left corner of the rectangle
  * @param {number} width The width of the rectangle
  * @param {number} height The height of the rectangle
  * @param {string} fill The fill color of the rectangle
  * @param {string} stroke The stroke color of the rectangle
  * @param {SVGElement} parent The parent SVG element
  * @returns 
  */
 // Create an SVG rectangle and add it to the parent SVG element
 function createRect(x, y, width, height, fill, stroke, parent) {
     // Create a new rectangle element using the SVG namespace
     const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
     // Set the x position of the rectangle
     rect.setAttribute('x', x);
    
     // Set the y position of the rectangle
     rect.setAttribute('y', y);
 
     // Set the width of the rectangle
     rect.setAttribute('width', width);
 
     // Set the height of the rectangle
     rect.setAttribute('height', height);
 
     // Set the fill color of the rectangle
     rect.setAttribute('fill', fill);
 
     // and then set the stroke color of the rectangle
     rect.setAttribute('stroke', stroke);
 
     // remember Add the rectangle to the parent SVG
     parent.append(rect);
     
     // return it :)
     return rect;
 }
 
 /**
  * Creates a circle and appends it to the parent SVG element
  * 
  * @param {number} cx The x coordinate of the center of the circle
  * @param {number} cy The y coordinate of the center of the circle
  * @param {number} r The radius of the circle
  * @param {string} fill The fill color of the circle
  * @param {string} stroke The stroke color of the circle
  * @param {SVGElement} parent The parent SVG element
  * @returns A new circle element
  */
 
 // Create an SVG circle and add it to the parent SVG element
 function createCircle(cx, cy, r, fill, stroke, parent) {
     // Create a new circle element using the SVG namespace
     const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
     // like before
     circle.setAttribute('cx', cx);
     circle.setAttribute('cy', cy);
     circle.setAttribute('r', r);
     circle.setAttribute('fill', fill);
     circle.setAttribute('stroke', stroke);
     parent.append(circle);
     return circle;
 }
 console.log("numLevelsInput =", numLevelsInput);
 console.log("probRightInput =", probRightInput);
 console.log("dropBallsButton =", dropBallsButton);
 // When we change any of the parameter inputs, redraw the board
 numLevelsInput.addEventListener('input', redrawBoard);
 // numBallsInput.addEventListener('input', redrawBoard);
 probRightInput.addEventListener('input', redrawBoard);
 
 // Draw the board initially (and store the cleanup function)
 let clearBoard = drawBoard(); 
 /**
  * Redraws the board (by calling the cleanup function and then drawing the board again)
  */
 function redrawBoard() {
     clearBoard(); // Clean up the old board
     clearBoard = drawBoard(); // Draw the new board (and store the cleanup function)
 }
});
