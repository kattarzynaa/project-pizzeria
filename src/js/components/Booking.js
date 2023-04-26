import { templates, select } from '../settings.js';
import amountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class booking {
  constructor(element){

    const thisBooking = this; 

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){

    const thisBooking = this;
    
    
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper.innerHTML = generatedHTML;


    thisBooking.dom.wrapper = element;
    thisBooking.dom.amountWidget = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.dateInput = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    console.log('wraper date: ', thisBooking.dom.dateInput);
    thisBooking.dom.hoursInput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    console.log('wraper time: ', thisBooking.dom.hoursInput);
    

  }

  initWidgets(){

    const thisBooking = this; 

    thisBooking.amountWidget = new amountWidget(thisBooking.dom.amountWidget);
    thisBooking.dom.amountWidget.addEventListener('updated', function(){console.log('amountWidget');});

    thisBooking.hoursAmount = new amountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){console.log('hoursAmount');});

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dateInput);
    thisBooking.hoursPicker = new HourPicker(thisBooking.dom.hoursInput);

  }
}

export default booking; 