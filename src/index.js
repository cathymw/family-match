import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import _ from 'lodash';
import './index.css';

const uniqueCards = ['pig','fish','cactus','corn','shroom'];
const numCardsToMatch = 2;
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

Modal.setAppElement('#app')

class MemoryGame extends React.Component{
  constructor(){
    super();
    this.shuffleCards = this.shuffleCards.bind(this);
    this.pickCard = this.pickCard.bind(this);
    this.addWin = this.addWin.bind(this);
   
    //is this an anti-pattern? what is better solution?
    this.ignoreCardClicks = false;
    
    this.state = { 
      cards : [],
      gamesWon: 0,
      selectedCards: [],
      gameOver: 1,
       modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }
  
  multiplyCards(cards,multiplier){
    let loopTimes = multiplier - 1;
    let multiplied = cards;
    for (var i = 0; i < loopTimes; i++){
      multiplied = _.concat(multiplied,cards);
    }
    
    return multiplied;
  }
  
  shuffleCards(){
    //console.log('shuffle');
    
    let multipliedCards = this.multiplyCards(uniqueCards,numCardsToMatch);
    let shuffled = _.shuffle(multipliedCards);
    
    //make each card an object with its own state values:
    let cards = shuffled.map(function(val){
      return {
        type: val,
        position: 'unselected'
      }
    });
    //
    //console.log('card type='+cards[1].type);
    
    this.setState({ 
      cards: cards,
      gameOver: 0
    });
    
  }
  
  changeAllPositionsOfSelected(allCards,selectedCards,newPosition){
    for (var v of selectedCards) {
      allCards[v].position=newPosition;
    }
    return allCards;
  }
  
  addWin(){
    let newGamesWon = this.state.gamesWon + 1;
    this.setState({ gamesWon: newGamesWon, gameOver: 1 });
  }
  
  selectedHasSameAttribute(allCards,selectedCards,attribute){
    //console.log('hasSameAttribute '+attribute);
    let eq = allCards[selectedCards[0]][attribute];
    for (var v of selectedCards) {
      if(allCards[v][attribute] !== eq){ return false; }
    }
    return true;
  }
  
  
  checkForMatch(curCards, curSelectedCards){
      //console.log('checkForMatch');
    
      //2 cards selected... check for match
     if( this.selectedHasSameAttribute(curCards,curSelectedCards,'type') ){
      this.setState({modalIsOpen: true});
        curCards = this.changeAllPositionsOfSelected(curCards,curSelectedCards,"removed");
        //check if won game!

       let winTest =  _.reduce(curCards, function(result, value, key) {
          //console.log('value.position='+value.position);
          //console.log('result='+result);
         
          if(result === value.position){
            return result;
          }else{
            return false;
          }
         //return true;
          
        }, curCards[0].position); 
        
       //console.log('WINTEST='+winTest);
       if(winTest !== false){
         this.addWin();
       }
       
      }else{
        curCards = this.changeAllPositionsOfSelected(curCards,curSelectedCards,"unselected");
      }
    
      //only curCards is transformed
      return curCards;
  }

  pickCard(index){
    //console.log('card type='+this.state.cards[index].type+', index='+index);
    
    if(this.ignoreCardClicks !== true){

      let curSelectedCards = _.concat(this.state.selectedCards, index);
      let curCards = this.state.cards;

      //if(curSelectedCards.length !== )
      //console.log('cards stored: '+curSelectedCards.length);

      curCards[curSelectedCards[ curSelectedCards.length-1 ]].position="selected";

      if(curSelectedCards.length === numCardsToMatch){

          this.setState({
            //selectedCards: curSelectedCards,
            cards: curCards
          })

        let _this = this; //needed for timeout because 'this' changes 
        this.ignoreCardClicks = true;

        let pauseGame = setTimeout(function(){ 
          curCards = _this.checkForMatch(curCards, curSelectedCards);
          curSelectedCards = [];

          _this.ignoreCardClicks = false;

          _this.setState({
            selectedCards: curSelectedCards,
            cards: curCards
          })

        }, 750);

      }else{
        curCards[curSelectedCards[0]].position="selected";

          this.setState({
            selectedCards: curSelectedCards,
            cards: curCards
          })

      }

    }


  }
  
  render(){ 
     let clickEvent = this.pickCard;
    let cardIndex = 0;
     return(
     <div className="memory-app">

       <HomeScreen gameOver={this.state.gameOver} gamesWon={this.state.gamesWon} clickEvent={this.shuffleCards} />
       <div className="cards">
           {this.state.cards.map(function(thisCard) {
            return <Card index={cardIndex++} clickEvent={clickEvent} position={thisCard.position} type={thisCard.type}/>
            })}
       </div> 
       <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h2 ref={subtitle => this.subtitle = subtitle}>Hello</h2>
          <div>This is your family. Remember when this picture was taken? Good times...</div>
          <button onClick={this.closeModal}>close</button>
        </Modal>
      </div>
      </div>
     )
  }
}

class Card extends React.Component{
 constructor(){
    super();
    this.clickMe = this.clickMe.bind(this);
 }
  clickMe(){
    //call parent function that manages state
    if(this.props.position === 'unselected'){
      this.props.clickEvent(this.props.index);
    }else{
      console.log('cant click me! my position is '+this.props.position);
    }
    
  }
 
   render(){ 
     return (
       <div data-index={this.props.index} data-cardtype={this.props.type} onClick={this.clickMe } className={ 'card card--'+this.props.type+' card--'+this.props.position } > 
        <div className="card__inner"> 
            <div className="card__face card__front"> 
              
            </div> 
            <div className="card__face card__back"> 
               
            </div> 
        </div> 
    </div> 
     ) 
   }
}


class HomeScreen extends React.Component{
   constructor(){
      super();
      this.clickMe = this.clickMe.bind(this);
    }
  clickMe(){
    //call parent function that manages state
     this.props.clickEvent(this.props.clickEvent);
    //this.shuffleCards
  } 
     render(){ 
       return (
          <div className={this.props.gameOver ? "homescreen homescreen--visible" : "homescreen homescreen--hidden"}>
          <div class="background">
            <div class="row">
              <div class="column">
                <h1 className="homescreen__title">Family&nbsp;  Match</h1>
              </div>
              <div class="column">
                <button className="homescreen__shuffle-button " onClick={this.clickMe} >Start</button>
                <button className="homescreen__shuffle-button "  >Family Album</button>
              </div>
            </div>
           </div>
          </div>
         )
     }
}


ReactDOM.render(<MemoryGame />, document.getElementById('app'));