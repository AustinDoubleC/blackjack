let deckID = ""
let playerDeck = []
let dealerDeck = []
const playerDOM = document.getElementById("player")
const playerDeckContainer = document.getElementById("playerDeck-container")
const dealerDeckContainer = document.getElementById("dealerDeck-container")
const playerPointDisplay = document.getElementById("playerPoint-display")
const dealerPointDisplay = document.getElementById("dealerPoint-display")
const messageDOM = document.getElementById("message-container")
const messageText = document.getElementById("message-text")
const btnNewDeck = document.getElementById("new-deck")
const btnInsurance = document.getElementById("insurance")
const btnInsuranceNo = document.getElementById("insuranceNo")
const btnPlayerDraw = document.getElementById("draw-player")
const btnPlayerEnd = document.getElementById("turn-end")
const moneyText = document.getElementById("money")
const betText = document.getElementById("bet")
const resultText = document.getElementById("result-text")
const insuranceLabel = document.getElementById("insurance-label")
const insuranceValue = document.getElementById("insurance-value")

let playerPoint = 0
let dealerPoint = 0
let playerAce = 0
let dealerAce = 0
let nonAcePoint = 0
let gameEnded = false
let insurance= false
let insuranceAmt = 0
let bet = 10
let money = 100

betText.addEventListener("change",()=>{
    bet=betText.value
})

const newDeck = async ()=>{
    if (money >= betText.value){
        resultText.innerText=""
    gameEnded = false
    money = money-bet
    moneyText.innerText = money
    messageText.innerText=""
    betText.disabled = "true"
    btnInsurance.style.display="none"
    btnInsuranceNo.style.display="none"
    playerDeck =[]
    dealerDeck =[]
    let result = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    let data = await result.json();
    deckID=data.deck_id
    playerDraw()
    dealerDraw()
    playerDraw()
    btnNewDeck.style.display="none"
    }else{
        messageText.innerText="insufficient fund"
    }
    
}

const winOrLoss = ()=>{
    if (playerPoint ===21 && playerDeck.length ===2 ){ 
        messageText.innerText = "Blackjack"
        gameEnded = true
        money = money + bet + bet*1.5
        moneyText.innerText=money
        resultText.innerText = "You win $" + bet*1.5
    }else if (playerDeck.length===5 && playerPoint<=21){
        messageText.innerText = "5 cards"
        gameEnded = true
        money = money + bet*2
        moneyText.innerText=money
        resultText.innerText = "You win $" + bet
    }else if (playerPoint>21){
        messageText.innerText = "Busted.  You lose"
        gameEnded = true
        moneyText.innerText=money
    }else{
        btnPlayerDraw.style.display = "inline"
        btnPlayerEnd.style.display = "inline" 
        messageText.innerText = "Draw card?"
    }
    if (gameEnded ===true){
        setTimeout(resetGame,500)
    }
}
const resetGame=()=>{
    btnPlayerDraw.style.display = "none"
    btnPlayerEnd.style.display = "none"
    btnInsurance.style.display = "none"
    btnNewDeck.style.display = "inline"
    betText.disabled=false
    
}
const finalWin=()=>{
    if (dealerPoint>21){
        messageText.innerText = "Dealer busted"
        setTimeout(resetGame,500)
        money = money + bet*2
        moneyText.innerText=money
        resultText.innerText = "You win $" +bet
    }else {
        if (dealerPoint > playerPoint){
            messageText.innerText = "Dealer wins"
            setTimeout(resetGame,500)
        }else if(playerPoint > dealerPoint){
            messageText.innerText = "Player wins"
            setTimeout(resetGame,500)
            money = money + bet*2
            moneyText.innerText=money
            resultText.innerText = "You win $"+bet
        }else{
            messageText.innerText = "Draw"
            setTimeout(resetGame,500)
            money = money + bet
            moneyText.innerText=money
            resultText.innerText = "Return $" + bet + " to you"
        }
    }
    
}

const askInsurance = ()=>{
    if (dealerDeck.length ===1 && dealerDeck[0].value ==="ACE" &&playerDeck.length===2){
        messageText.innerText = "Insurance?"
        btnPlayerDraw.style.display="none"
        btnPlayerEnd.style.display="none"
        btnInsurance.style.display="inline"
        btnInsuranceNo.style.display="inline"
        insuranceLabel.style.display="inline"
        insuranceValue.style.display="inline"
    }  
}
const insuranceHandler = ()=>{
    btnPlayerDraw.style.display="inline"
    btnPlayerEnd.style.display="inline"
    messageText.innerText = "Draw Card?"
    if(insurance===true){
        money = money-insuranceAmt
        moneyText.innerText = money
    }
}

const playerDraw = async () =>{
    let toShow = ""
    let result = await fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
    let data = await result.json();
    playerDeck.push(data.cards[0])
    playerDeck.forEach(card=>{
        toShow += `<img src=${card.image}>`
    })
    playerDeckContainer.innerHTML = toShow
    calculatePlayerPoint()
    if (playerDeck.length>=2){
        setTimeout(winOrLoss,500)
        setTimeout(askInsurance,500)
    }
    
}

const calculateInsurance = ()=>{
    if(insurance===true && dealerPoint===21){
        gameEnded ===true
        messageText.innerText = "Dealer blackjack"
        money = parseInt(money) + parseInt(insuranceAmt)*3
        moneyText.innerText = money
        resultText.innerText = "You win insurance $"+insuranceAmt*2
    }
}

const dealerDraw = async () =>{
    if (dealerDeck.length >=2 && gameEnded ===false){
        while (dealerPoint<17 || dealerPoint<playerPoint){
            let toShow = ""
            let result = await fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
            let data = await result.json();
            dealerDeck.push(data.cards[0])
            dealerDeck.forEach(card=>{
            toShow += `<img src=${card.image}>`
            dealerDeckContainer.innerHTML = toShow
            calculateDealerPoint()    
    })}
    setTimeout(finalWin,500)
    }else if (dealerDeck.length ===0){
        let toShow = ""
        let result = await fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
        let data = await result.json();
        dealerDeck.push(data.cards[0])
        dealerDeck.forEach(card=>{
        toShow += `<img src=${card.image}>`
    })
    dealerDeckContainer.innerHTML = toShow
    calculateDealerPoint()
    }else if (dealerDeck.length ===1 && gameEnded ===false){   //handle insurance
        let toShow = ""
        let result = await fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
        let data = await result.json();
        dealerDeck.push(data.cards[0])
        dealerDeck.forEach(card=>{
        toShow += `<img src=${card.image}>`
    })
    dealerDeckContainer.innerHTML = toShow
    calculateDealerPoint()
    setTimeout(calculateInsurance,500)
    setTimeout(dealerDraw,1000)
    }
    
}

const calculatePlayerPoint= ()=>{
    playerPoint = 0
    playerAce = 0
    nonAcePoint = 0
    for (let i=0; i<playerDeck.length;i++){
        if (playerDeck[i].value >= 2 && playerDeck[i].value <=10){
            playerPoint = playerPoint+parseInt(playerDeck[i].value)
            nonAcePoint = nonAcePoint+parseInt(playerDeck[i].value)
        }else if(playerDeck[i].value === "JACK" || playerDeck[i].value === "QUEEN" || playerDeck[i].value === "KING"){
            playerPoint = playerPoint+10
            nonAcePoint = nonAcePoint+10
        }else if (playerDeck[i].value === "ACE"){
            playerPoint = playerPoint+11
            playerAce = playerAce+1
        }
    }
    if (playerPoint >21){
        // 1 ace
        if (playerAce === 1){
            if (nonAcePoint>=11){
                playerPoint = playerPoint -10
            }
        }
        // 2 aces
        if (playerAce === 2){
            if (playerDeck.length === 2) { //A + A
                playerPoint = playerPoint -10
            }
            else { // A+ A +? or A+A+?+?
                if (nonAcePoint>=10){ // A+ A +10 or A+A+10+10 or A+A+5+5
                    playerPoint = playerPoint -20
                }else {
                    playerPoint = playerPoint -10
                }
            }
        }
        if (playerAce === 3){
            if (playerDeck.length === 3) { //A + A + A
                playerPoint = playerPoint -20
            }
            else { // A+ A +A+? or A+A +A+?+?
                if (nonAcePoint>=9){ // A+ A +A+9 or A+A+A+10+10 or A+A+A+5+4
                    playerPoint = playerPoint -30
                }else {
                    playerPoint = playerPoint -20
                }
            }
        }
        if (playerAce === 4){
            if (playerDeck.length === 4) { 
                playerPoint = playerPoint - 40
            }else{
                if (nonAcePoint >=8){
                    playerPoint = playerPoint - 40
                }else {
                    playerPoint = playerPoint - 30
                }
            }
    }
}
playerPointDisplay.innerText = "Player points: "+playerPoint
}
const calculateDealerPoint= ()=>{
    dealerPoint = 0
    dealerAce = 0
    nonAcePoint = 0
    for (let i=0; i<dealerDeck.length;i++){
        if (dealerDeck[i].value >= 2 && dealerDeck[i].value <=10){
            dealerPoint = dealerPoint+parseInt(dealerDeck[i].value)
            nonAcePoint = nonAcePoint+parseInt(dealerDeck[i].value)
        }else if(dealerDeck[i].value === "JACK" || dealerDeck[i].value === "QUEEN" || dealerDeck[i].value === "KING"){
            dealerPoint = dealerPoint+10
            nonAcePoint = nonAcePoint+10
        }else if (dealerDeck[i].value === "ACE"){
            dealerPoint = dealerPoint+11
            dealerAce = dealerAce+1
        }
    }
    if (dealerPoint >21){
        // 1 ace
        if (dealerAce === 1){
            if (nonAcePoint>=11){
                dealerPoint = dealerPoint -10
            }
        }
        // 2 aces
        if (dealerAce === 2){
            if (dealerDeck.length === 2) { //A + A
                dealerPoint = dealerPoint -10
            }
            else { // A+ A +? or A+A+?+?
                if (nonAcePoint>=10){ // A+ A +10 or A+A+10+10 or A+A+5+5
                    dealerPoint = dealerPoint -20
                }else {
                    dealerPoint = dealerPoint -10
                }
            }
        }
        if (dealerAce === 3){
            if (dealerDeck.length === 3) { //A + A + A
                dealerPoint = dealerPoint -20
            }
            else { // A+ A +A+? or A+A +A+?+?
                if (nonAcePoint>=9){ // A+ A +A+9 or A+A+A+10+10 or A+A+A+5+4
                    dealerPoint = dealerPoint -30
                }else {
                    dealerPoint = dealerPoint -20
                }
            }
        }
        if (dealerAce === 4){
            if (dealerDeck.length === 4) { 
                dealerPoint = dealerPoint - 40
            }else{
                if (nonAcePoint >=8){
                    dealerPoint = dealerPoint - 40
                }else {
                    dealerPoint = dealerPoint - 30
                }
            }
        }

}
dealerPointDisplay.innerText = "Dealer points: "+dealerPoint
}

btnNewDeck.addEventListener("click",newDeck)
btnPlayerDraw.addEventListener("click",()=>{
    btnPlayerDraw.style.display="none"
    btnPlayerEnd.style.display="none"
    messageText.innerText = ""
    setTimeout(playerDraw,500)  
})
btnPlayerEnd.addEventListener("click",()=>{
    btnPlayerDraw.style.display="none"
    btnPlayerEnd.style.display="none"
    messageText.innerText = ""
    setTimeout(dealerDraw,500)    
})
btnInsurance.addEventListener("click",()=>{
    insurance = true
    insuranceAmt = insuranceValue.value
    btnInsurance.style.display="none"
    btnInsuranceNo.style.display="none"
    insuranceLabel.style.display="none"
    insuranceValue.style.display="none"
    setTimeout(insuranceHandler,1000)
    
})
btnInsuranceNo.addEventListener("click",()=>{
    btnInsurance.style.display="none"
    btnInsuranceNo.style.display="none"
    insuranceLabel.style.display="none"
    insuranceValue.style.display="none"
    setTimeout(insuranceHandler,1000)
})