/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars


{
  'use strict';


  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };


  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };


  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, 
    cart: {
      defaultDeliveryFee: 20,
    },
  };


  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };


  class Product{
    constructor(id, data){
      const thisProduct = this;


      thisProduct.id = id;
      thisProduct.data = data;


     
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProductParams();
      thisProduct.prepareCartProduct();
     
      //--console.log('new Product: ', thisProduct);
    }


    renderInMenu(){
      const thisProduct = this;


      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log('generatedHTML: ', generatedHTML);


      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);


    }


    getElements(){
      const thisProduct = this;


      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); //console.log('accordion trigger: ', thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); //console.log('form: ', thisProduct.form );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); //console.log('inputs: ', thisProduct.formInputs );
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton); //console.log('button: ', thisProduct.cartButton );
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem); //console.log('price elem: ',thisProduct.priceElem );
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget); 
    }


    initAccordion(){
      const thisProduct = this;
 
      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log('clickable: ', clickableTrigger);
 
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //--console.log('active product: ', activeProduct);
        //--console.log('product: ', thisProduct.element);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }
    initOrderForm(){
      const thisProduct = this;


      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault(); //blokujemy domyślną akcję: wysłanie formularza z przeładowaniem strony
        thisProduct.processOrder();
      });


      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();  
        });
      }


      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault(); //blokujemy domyślną akcję: zmianę adresu strony
        thisProduct.processOrder();
        thisProduct.addToCart();
      });


      //console.log('initOrderForm');


    }


    processOrder(){
      const thisProduct = this;

      //console.log('this product: ', thisProduct);

      //convert  form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers'] }
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('form data: ', formData);


      //set price to default price
      let price = thisProduct.data.price; //cena defaultowa
      //console.log('price: ', price);


      //for every category (param)...
      for(let paramId in thisProduct.data.params){


        //determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log('param id: ', paramId, 'param: ', param);
         
        //for every option in this category ---tutaj pracujemy
        for(let optionId in param.options) {


          //determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          const priceOption = option['price'];
          //console.log('option id: ', optionId, 'option: ', option);

          const imagePath = '.'+ paramId + '-' + optionId;
          //console.log('image path: ', imagePath);
          const optionImage = thisProduct.imageWrapper.querySelector(imagePath);
          //console.log('image full path: ', optionImage);

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('optionSelected: ', optionSelected);
                   
          //check if there is param with a name of paramId in formData and if it includes optionId
          if (optionSelected){

            //chceck if the option is not default
            if(!option.default){
            //add option price to price variable
              price = price + priceOption;
              //console.log('price: ', price, 'price option: ', priceOption);
              //optionImage.classList.remove(classNames.menuProduct.imageVisible);
            //check if the option is default
            }else{ 
              if(option.default){
              //reduce price variable
                price = price + priceOption;
                //console.log('price: ', price, 'price option: ', priceOption);
                //optionImage.classList.remove(classNames.menuProduct.imageVisible);
                
              }
            }     
          } 

          if(optionImage){
            if(optionSelected) {
            // add class active to image
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle = price; //console.log('price single: ', thisProduct.priceSingle);

      const finalPrice = price * thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = finalPrice;
      //console.log('this product price: ', thisProduct.priceElem);

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
      //app.cart.update();
    }

    prepareCartProductParams(){
      const thisProduct = this; 
      const params = {};

      const formData = utils.serializeFormToObject(thisProduct.form);
      


      //for every category (param)...
      for(let paramId in thisProduct.data.params){

        const param = thisProduct.data.params[paramId];
        //console.log('param id: ', paramId, 'param: ', param);

        //create category param in paramsObj

        params[paramId] = {
          label: param.label,
          options: {}
        };

        //for every option in this category ---tutaj pracujemy
        for(let optionId in param.options) {

          //determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log('option id: ', optionId, 'option: ', option);
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('optionSelected: ', optionSelected);
                   
          if(optionSelected){
            //option is selected!
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      //console.log('params: ', params);
      return params;
    }

    

    prepareCartProduct(){
      const thisProduct = this; 

      const productSummary = { 
        'id': thisProduct.id,
        'name': thisProduct.data.name,
        'amount':thisProduct.amountWidget.value,
        'priceSingle': thisProduct.priceSingle,
        'price': thisProduct.priceSingle * thisProduct.amountWidget.value,
        'params': thisProduct.prepareCartProductParams(),
      };

      
      //console.log('product summary: ', productSummary);
      return productSummary;
    }

  }

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

    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct); 
      //console.log('HTML: ', generatedHTML); 
      //console.log('DATA: ', menuProduct); 

      thisCart.generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(thisCart.generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, this.generatedDOM));
      //console.log('thisCart.products: ', thisCart.products);
      //console.log('adding product', menuProduct);
      thisCart.update();
    }

    update(){
      const thisCart = this; 

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      thisCart.totalPrice = 0;

      console.log('produkty: ', thisCart.products);

      for(let cartProduct of thisCart.products){
        
        thisCart.totalNumber += cartProduct.amount;
        thisCart.subtotalPrice += cartProduct.price;

      }

      if(thisCart.totalNumber == 0){

             
        thisCart.totalPrice = 0;
        thisCart.deliveryFee = 0;

      } else {

        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      }

      console.log('total price: ', thisCart.totalPrice);
      console.log('total number: ', thisCart.totalNumber);

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      
      for(let totalPrice of thisCart.dom.totalPrice){
        totalPrice.innerHTML = thisCart.totalPrice;
      }

    }

  }

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
      
      console.log('thisCartProduct.amount: ', thisCartProduct.amount);

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
  }

  const app = {


    initMenu: function(){
      const thisApp = this;


      //console.log('thisApp.data: ', thisApp.data);


      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData] ); // skąd to .products?


      }
    },


    initData: function(){
      const thisApp = this;


      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },


    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);


      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}


