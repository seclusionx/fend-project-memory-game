/* Some code/methodology used from Matthew Cranford's walkthrough.
* https://matthewcranford.com/memory-game-walkthrough-part-1-setup/
* I've done my best to provide notation everywhere to explain I know exactly what this code is doing and it was chosen because I felt it was the best way of doing it.
*/
// UI element (ul with 'deck' class) that contains the 'cards' (li elements with the 'card' class) -- prints to test completion
const gameBoard = document.querySelector('.deck');
console.log('Card Container UI element loaded:', gameBoard);

// Set constant for selecting the elements with the deck/card classes at once.
const gameBoardAndCards = Array.from(document.querySelectorAll('.deck li'));
console.log('Card Container and All Cards in UI loaded:', gameBoardAndCards);

// Line 1. Set constant for score-panel span -- selects the span element with the "moves" class
// Line 3. Set Variable that keeps track of the current move -- ES6 variable call
// Line 5. Set variable that keeps track of the score (with stars!)
// Line 7. Set variable that keeps track of the cards that have been matched (using a template literal)
// Line 9. Set variable for the total number of matching sets of cards
// Line 11. Set variable for the current star score
const scorePanelMoves = document.querySelector('.moves');
console.log('Score Panel Move Number Loaded:', scorePanelMoves);
let moveNumber = 0;
console.log('Current Move Number loaded into a variable:', moveNumber);
const starScore = document.querySelectorAll('.stars li');
console.log('Star score UI element loaded:');
let cardMatchSets = 0;
console.log(`Card Match variable loaded: ${cardMatchSets}`);
const totalMatchSets = 8;
console.log(`Total Card Match Sets variable loaded ${totalMatchSets}`);
let currentStarScore = 0;
console.log (`Current Star Score loaded: ${currentStarScore}`);

// Set constant for the reset button -- selects the div with the 'reset' class
const resetButton = document.querySelector('.fa-repeat');
const additionalResetArea = document.querySelector('.restart');
console.log('Reset Button Loaded:', resetButton);

// Set Array that keeps track of the 'cards' currently flipped over
let flippedCards = [];
console.log('Array created for all cards that have been flipped:', flippedCards);

// Sets a variable for the timer in the UI and also sets variables to keep track of whether or not the timer is activated as well as the current time, methodology taken from Matthew Cranford's walkthrough
// Additionally timerIntervalNumber will later be used to keep track of the interval ID in order to use clearInterval()
const scorePanelTimer = document.querySelector('.timer');
console.log('Score Panel Timer Loaded:', scorePanelTimer);
let timerDisabled = true;
let currentTime = 0;
let timerIntervalNumber;

// Sets a variable for the modal as well as the player's stats
const modal = document.querySelector('.modal');
const modalStarScore = document.querySelector('.modal_starscore');
const modalMoves = document.querySelector('.modal_moves');
const modalTotalTime = document.querySelector('.modal_totaltime');

// Shuffle function from http://stackoverflow.com/a/24509// 76
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Copies/converts NodeList to an Array and shuffles the 'deck' -- ES6 Array.from() method
// Shuffles the 'cards' and 'deck' (.li / .ul respectively), calls itself immediately after the function in order to perform on load
// Additionally prints status updates to the console for testing purposes
function deckShuffle() {
    const theseWereShuffled = shuffle(gameBoardAndCards);
    console.log('The following were shuffled:', theseWereShuffled);
    setMoveNumber();
    console.log('Move number UI element now equal to MoveNumber variable.')
        for (item of theseWereShuffled) {
            gameBoard.appendChild(item);
        }
}
deckShuffle();

// Listener for clicks to the gameBoard, also prevents the user from re-clicking 'cards' (.lis) that were already matched, or clicking over 2 cards at a time. Uses an ES6 Arrow function for the event.
// Also uses the .includes Array method, this takes an array and returns a true or false value of the elements' existence in the array.
// Additionally calls for a reset of the gameBoard when the reset button is clicked
// Checks the score as well
gameBoard.addEventListener('click', event => {
    const targetClicked = event.target;
        if (aCardWasClicked(targetClicked)) {
           if (wasTheResetButtonClicked(targetClicked)) {
                resetGameBoard();
            } if (timerDisabled) {
                startTheTimer();
                console.log('Timer started.')
                timerDisabled = false;
                flipCard(targetClicked);
                addFlippedCard(targetClicked);
                setScorePanelTimer();
                adjustScorePanelTimer();
            } else if (timerDisabled == false) {
                flipCard(targetClicked);
                addFlippedCard(targetClicked);
                if (flippedCards.length === 2) {
                    console.log('Maximum Cards Flipped. (2)');
                    doTheCardsMatch(targetClicked);
                  //  addAMove();
                    whatIsTheScore();
                }
        }
    }
});

// Separated from gameBoard listener for readability.
// aCardWasClicked() is called when something on the ul (class="deck") is clicked
// When this function is called, it returns a true or false based on if the element clicked contains the class "card", confirms it does not have the class "match", (cont'd next line)
// confirms that the flippedCards array does not contain more than 2 items, and that the card being clicked is not already in the flippedCards array.
function aCardWasClicked(targetClicked) {
    return(
        targetClicked.classList.contains('card') &&
        !targetClicked.classList.contains('match') &&
        flippedCards.length < 2 &&
        !flippedCards.includes(targetClicked)
    );
}

// Confirms if the reset button was clicked, to correct an issue where it would attempt to 'flip' the reset button
function wasTheResetButtonClicked(targetClicked) {
    return(
        targetClicked.classList.contains('reset')
    );
}

// Listener for clicks to the reset button, resets the game by calling the resetGameBoard() function
resetButton.addEventListener('click', () => {
    resetGameBoard();
    console.log('The reset button has been clicked');
});

// Listener for the modal exit button, 'closes' the modal by adding the hidden class. Adds an event listener for clicks inline using es6 arrow function syntax
document.querySelector('.modal_exitbtn').addEventListener('click', hideTheModal);

// Listener for the modal play again button, adds an event listener for clicks inline using es6 arrow function syntax
document.querySelector('.modal_playbtn').addEventListener('click', () => {
    hideTheModal();
    resetGameBoard();
});

// Flipped over any cards that may be flipped, resets the number of moves, shuffles the deck, resets/stops the timer, resets the cardMatchSets.
// cardMatchSets are reset to correct a bug where the gameWon() scenario would not be reached if the player closed the modal and hit the reset button.
function resetGameBoard() {
    removeCardClass(flippedCards[0]);
    removeCardClass(flippedCards[1]);
    flippedCards = [];
    deckShuffle();
    moveNumber = 0;
    setMoveNumber();
    resetStarScore();
    timerDisabled = true;
    currentTime = 0;
    stopTheTimer();
    setScorePanelTimer();
    adjustScorePanelTimer();
    cardMatchSets = 0;
}

// End game scenario (see: doTheCardsMatch()), stops the timer, fetches the player's stats for the modal, and shows the end game modal
function gameWon() {
    stopTheTimer();
    addPlayerStats();
    showTheModal();
}

// Removes classes from all cards on the deck, primarily for the reset function.
function removeCardClass(card) {
    for (card of gameBoardAndCards) {
        if (card.classList.contains('open') || card.classList.contains('show') || card.classList.contains('match')) {
            card.classList.remove('open');
            card.classList.remove('show');
            card.classList.remove('match');
        }
    }
}

// Function that 'shows'/'flips' a 'card' (adds a css class that makes the .li clicked visible)
function flipCard(card) {
      card.classList.toggle('open');
      card.classList.toggle('show');
}

// Adds the 'card' that was clicked to the end of the 'flippedCards' array
function addFlippedCard(targetClicked) {
     flippedCards.push(targetClicked);
     console.log(flippedCards);
}
 
/* Checks to see if cards in the 'flippedCards' array are a match by comparing their class names using a strict equality comparison (===), then clears the array
* If the cards are a match it adds a class to show they are matching, if not it 'flips' them back over. It also increments the cardMatchSets variable each time.
* Also adds a brief timeout so you are able to see the cards before unmatched cards 'flip' back over -- (ES6 Arrow function)
* Lastly checks for the end game scenario, if the current cards matched (cardMatchSets) reaches 8, the game is won
*/
function doTheCardsMatch() {
    if (flippedCards[0].firstElementChild.className === flippedCards[1].firstElementChild.className) {
        console.log('The Cards are a match!')
        flippedCards[0].classList.toggle('match');
        flippedCards[1].classList.toggle('match');
        cardMatchSets++;
        console.log(`Current cardMatchSets: ${cardMatchSets}`);
        flippedCards = [];
        addAMove();
        if (cardMatchSets === totalMatchSets) {
            gameWon();
        }
    } else {
        setTimeout(() => {
            console.log('The Cards are NOT a match.')
            flipCard(flippedCards[0]);
            flipCard(flippedCards[1]);
            flippedCards = [];
            addAMove();
        }, 1000);
    }
}

// Adds a move to the move counter by incrementing the moveNumber variable by 1 and calling the setMoveNumber function to update the UI
function addAMove() {
    moveNumber++;
    setMoveNumber();
}

// Sets the move number UI element (span 'moves') to equal the 'moveNumber' variable
function setMoveNumber() {
    scorePanelMoves.innerHTML = moveNumber;
}

// Adjusts the score by calling the removeAStar function if the moveNumber variable returns 'true'. It will return true at 14 'OR' (||) 23 'OR' 30
function whatIsTheScore() {
    if (moveNumber == 14 || moveNumber == 23 || moveNumber == 30) {
        removeAStar();
    }
}

// Removes a point from the star score by looping through the .li UI elements and breaking after each. Each "star" has it's css style modified to "display: none;"
function removeAStar() {
    for (star of starScore) {
        if (star.style.display != 'none') {
            star.style.display = 'none';
            console.log('1 star removed');
            break;
        }
    }
}

// Resets the star score by looping through the li's (fa-star) and if their css class has "display: none;" the css style is changed to "display: inline;"
// Also resets the currentStarScore variable to correct an error causing incorrect Star Score reporting in GameWon() scenarios
function resetStarScore() {
    for (star of starScore) {
        if (star.style.display == 'none') {
            star.style.display = 'inline';
            currentStarScore = 0;
            console.log('Star Score: Reset');
            console.log(`The Star Score is: ${currentStarScore}`);
        }
    }
}

// Fetches the star score for the end game modal by looping through the lis with 'class=star' that currently have the 'inline' style
function fetchTheStarScore() {
    for (star of starScore) {
        if (star.style.display !== 'none') {
            currentStarScore++;
        }
    }
}

// Activates the timer methodology used from Matthew Cranford's walkthrough
// Creates a variable (timerIntervalNumber) which is calling the setInterval() function.
// setInterval() calls a function or evaluates an expression at a specified interval in milliseconds, it will continue to do so until clearInterval() is called, or the browser window is closed.
// setInterval() returns an ID value (timerIntervalNumber will later be used for this), this is used as the parameter for clearInterval().
// In this case, the currentTime iterates by 1 every 1000ms (1 second). It also calls setScorePanelTimer() to update the span element ('timer') on the UI
// Lastly it prints to console each time for troubleshooting purposes.

function startTheTimer() {
    timerIntervalNumber = setInterval(() => {
        currentTime++;
        adjustScorePanelTimer();
        console.log(currentTime, ' seconds have passed');
    }, 1000);
}

// Stops the timer function by calling clearInterval and passing it the IntervalID (in this case, it has been stored as timerIntervalNumber)
function stopTheTimer() {
    clearInterval(timerIntervalNumber);
    console.log('Score Panel Timer: Disabled');
}

// Set a variable for minutes using the Math.floor() function to round the number to a time-accurate integer
// Set a variable for seconds dividing the currentTime by 60
// Adjusts the scorePanelTimer (span class= timer) formatting for minutes and seconds using a template literal with a placeholder
function adjustScorePanelTimer() {
    const minutes = Math.floor(currentTime/60);
    const seconds = currentTime % 60;
    if (seconds < 10) {
        scorePanelTimer.innerHTML = `${minutes}:0${seconds}`;
    } else {
        scorePanelTimer.innerHTML = `${minutes}:${seconds}`;
    }
}

// Updates the scorePanelTimer variable (span element 'timer') by setting it to the currentTime variable
function setScorePanelTimer() {
    scorePanelTimer.innerHTML = currentTime;
    console.log('Score Panel Timer: Updated');
}

// Removes the 'modal_hidden' class in order to make the modal visible
function showTheModal() {
    modal.classList.remove('modal_hidden');
    console.log('Modal: Visible');
}

// Adds the 'modal_hidden' class in order to make the modal invisible
function hideTheModal() {
    modal.classList.add('modal_hidden');
    console.log('Modal: Invisible');
}

// Adds the player's stats to the modal using template literals
function addPlayerStats() {
    fetchTheStarScore();
    modalStarScore.innerHTML = `Star Score: ${currentStarScore}`;
    modalMoves.innerHTML = `Total Moves: ${scorePanelMoves.innerHTML}`;
    modalTotalTime.innerHTML = `Time Used: ${scorePanelTimer.innerHTML}`;
}