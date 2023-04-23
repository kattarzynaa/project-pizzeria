import { select } from '../settings.js';
import amountWidget from './AmountWidget.js';

class CartProduct{

  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions(); 
    thisCartProduct.getData();     
      
    //console.log('thisCartProduct.amount: ', thisCartProduct.amount);

  }

  getElements(element){
    const thisCartProduct = this; 

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    thisCartProduct.dom.cartProductPrice = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);

  }

  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);

    thisCartProduct.amountWidget.setValue(thisCartProduct.amount);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        
      thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
      thisCartProduct.dom.cartProductPrice.innerHTML = thisCartProduct.price;
    });
  }

  remove(){
    const thisCartProduct = this; 

    const event = new CustomEvent ('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();

    }); 

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
        
      thisCartProduct.remove();
    }); 
        
  }

  getData(){
    const thisCartProduct = this;

    //console.log('this: ', thisCartProduct);
    const productCartData = {
      'id': thisCartProduct.id,
      'amount': thisCartProduct.value,
      'price': thisCartProduct.priceSingle *  thisCartProduct.amountWidget.value,
      'priceSingle': thisCartProduct.priceSingle,
      'name': thisCartProduct.name,
      'params': thisCartProduct.params,
    };

    return productCartData;
  }
}

export default CartProduct;