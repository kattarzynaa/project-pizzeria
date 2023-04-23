import { settings, select } from '../settings.js';

class amountWidget {
  constructor(element){
    const thisWidget = this;

    //console.log('Amount Widget: ', thisWidget);
    //console.log('Constructor arguments: ', element);

    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
    //thisWidget.announce();
      
  }
    
  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); // Okienko z ilością
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease); // ---
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); // +++
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);
    //[DONE] ADD VALIDATION

    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce(newValue);
    }

    thisWidget.input.value = thisWidget.value;

  }

  announce(){
    const thisWidget = this;
      
    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }
    
  initActions(){
    const thisWidget = this;
      
    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default amountWidget;