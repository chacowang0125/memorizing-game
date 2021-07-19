const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]
//model//
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}
//view//
const view = {
  //渲染卡片組
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')

  },
  //渲染牌（背面）
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  //渲染牌面
  getCardContent(index) {
    const number = transFormNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
    <img src=${symbol} alt="">
    <p>${number}</p>
    `
  },
  //把數字換成字母
  transFormNumber(number) {
    switch (number) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return number
    }
  },
  //翻牌
  flipCard(card) {
    //如果是背面
    if (card.classList.contains('back')) {
      //回傳正面
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
    //如果是正面,回傳背面
    card.classList.add('back')
    card.innerHTML = null //卡片沒有內容
  },
  //配對的卡片顯示灰底
  pairCard(card) {
    card.classList.add('paired')
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  //遊戲開始派發卡片
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //依照狀態分配工作
  dispatchCardAction(card) {
    //如果不是背面，跳出
    if (!card.classList.contains('back')) return
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)
        this.GAME_STATE = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)
        //判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          //配對成功
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(model.revealedCards[0])
          view.pairCard(model.revealedCards[1])
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          setTimeout(() => {
            this.currentState = GAME_STATE.CardsMatchFailed
            view.flipCard(model.revealedCards[0])
            view.flipCard(model.revealedCards[1])
            model.revealedCards = []
            this.currentState = GAME_STATE.FirstCardAwaits
          }, 1000)
        }
        break
    }
  }
}
const utility = {
  //得到一個亂數的陣列
  getRandomNumberArray(count) {
    const number = Array.from(Array(52).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})


controller.generateCards()