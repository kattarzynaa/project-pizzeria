import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class amountWidget extends BaseWidget {
  constructor(element){
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    //console.log('Amount Widget: ', thisWidget);
    //console.log('Constructor arguments: ', element);

    thisWidget.getElements(element);
    //thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
    //thisWidget.announce();
      
  }
      
  getElements(){
    const thisWidget = this;

    //thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input); // Okienko z ilością
    //console.log('amount widget: ', thisWidget.dom.input );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease); // ---
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease); // +++
  }

  isValid(value){
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin 
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }  

  initActions(){
    const thisWidget = this;
      
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default amountWidget;