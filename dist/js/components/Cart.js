import { select, templates, classNames, settings } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initAction();
    //thisCart.update();

    //console.log('new cart: ', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); //console.log('toglle trigger: ', thisCart.dom.toggleTrigger );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //console.log('thisCart.dom.productList', thisCart.dom.productList);
      
    thisCart.dom.orderButton = thisCart.dom.wrapper.querySelector(select.cart.formSubmit); //console.log(thisCart.dom.orderButton);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form); //console.log (thisCart.dom.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone); //console.log //(thisCart.dom.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address); //console.log //(thisCart.dom.address);
      
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee); //console.log('thisCart.dom.deliveryFee: ', thisCart.dom.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice); //console.log('select.cart.subtotalPrice: ', select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice); //console.log('select.cart.totalPrice: ', select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber); //console.log('select.cart.totalNumber: ', select.cart.totalNumber);

  }


  initAction(){
    const thisCart = this; 

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct); 
      //console.log('produkt: ', event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct); 
    //console.log('HTML: ', generatedHTML); 
    //console.log('DATA: ', menuProduct); 
      

    thisCart.generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(thisCart.generatedDOM);
     

    thisCart.products.push(new CartProduct(menuProduct, this.generatedDOM));

    thisCart.update();
  }

  update(){
    const thisCart = this; 

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    thisCart.totalPrice = 0;

    //console.log('produkty: ', thisCart.products);

    for(let cartProduct of thisCart.products){

      thisCart.totalNumber += cartProduct.amount;
      thisCart.subtotalPrice += cartProduct.price;

    }

    // console.log('thisCart.totalNumber', thisCart.totalNumber);
    // console.log('thisCart.subtotalPrice', thisCart.subtotalPrice);

    if(thisCart.totalNumber == 0){

             
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;

    } else {

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }

    // console.log('total price: ', thisCart.totalPrice);
    
    // console.log('total number: ', thisCart.totalNumber);

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      
    for(let totalPrice of thisCart.dom.totalPrice){
      totalPrice.innerHTML = thisCart.totalPrice;
    }

  }

  remove(deleteProduct){
    const thisCart = this; 

    //remove product form HTML 

    deleteProduct.dom.wrapper.remove();

    //remove prodact from thisCart.products array 

    const indexOfProduct = thisCart.products.indexOf(deleteProduct);
    thisCart.products.splice(indexOfProduct, 1);

    // console.log('indexOfProduct: ',indexOfProduct);
    // console.log('array-delete: ',thisCart.products);

    //run update method

    thisCart.update();

  }

  sendOrder(){
    const thisCart = this; 

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify(payload)
    };

    fetch(url, options);

    console.log(thisCart.payload);

  }

}

export default Cart;