import { templates, select, settings } from '../settings.js';
import amountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';


class booking {
  constructor(element){

    const thisBooking = this; 

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this; 

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    console.log('getData params', params);

    const urls = {
      bookings: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event  + '?' + params.eventCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event  + '?' + params.eventRepeat.join('&'),
    };

    //console.log('db.booking: ', settings.db.booking);
    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);

      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);
      });
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
    //console.log('wraper date: ', thisBooking.dom.dateInput);
    thisBooking.dom.hoursInput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    //console.log('wraper time: ', thisBooking.dom.hoursInput);
    

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