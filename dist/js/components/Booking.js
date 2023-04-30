import { templates, select, settings, classNames } from '../settings.js';
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
    //thisBooking.pickTable();
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

    //console.log('getData params', params);

    const urls = {
      bookings: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event  + '?' + params.eventCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event  + '?' + params.eventRepeat.join('&'),
    };

    //console.log('db.booking: ', settings.db.booking);
    //console.log('getData urls', urls);

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
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
    //console.log('thisBooking.booked', thisBooking.booked);
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    //console.log('hour: ', hour);

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

   
    const startHour = utils.hourToNumber(hour);
    //console.log('start hour: ', startHour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      //console.log('loop', hourBlock, 'start hour: ', startHour);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this; 

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hoursPicker.value);

    let allAvalible = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvalible = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvalible 
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }


  pickTable(event){
    const thisBooking = this; 

    const allTables = thisBooking.dom.tables;

    //event.preventDefault();

    if(event.target.classList.contains('booked')){
      alert('stolik niedostępny');
    } else {
      
      if(event.target.classList.contains('table' && 'pickTable')){
        event.target.classList.remove('pickTable');

      } else {
        allTables.forEach(singleTable => singleTable.classList.remove('pickTable'));
        event.target.classList.add('pickTable');
        thisBooking.tableNum = event.target.getAttribute('data-table');

      }
    }

    return thisBooking.tableNum;

  }

  sendBookings(event){
    const thisBooking = this; 

    event.preventDefault();
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: Number(thisBooking.tableNum),
      duration: thisBooking.hoursAmount.correctValue,
      ppl: thisBooking.amountWidget.correctValue,
      starters: [],
      phone: thisBooking.dom.bookingPhone.value,
      address: thisBooking.dom.bookingAddress.value,
    };


    for(let starter of thisBooking.dom.starters){
      if(starter.checked == true){
        payload.starters.push(starter.value);
      }
    }

    if(isNaN(payload.table) || payload.table == 0){
      alert('Porszę wybrać stolik');
    } else {

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(payload)
      };

      thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      
      fetch(url, options);

      alert('stolik zarezerwowany!');
    }

    //console.log('thisBooking: ', thisBooking.booked);
    //console.log(payload);

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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);

    thisBooking.dom.bookingForm = thisBooking.dom.wrapper.querySelector(select.booking.bookingForm);
    thisBooking.dom.bookingPhone = thisBooking.dom.wrapper.querySelector(select.booking.phone); 
    thisBooking.dom.bookingAddress = thisBooking.dom.wrapper.querySelector(select.booking.address); 
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters); 
    

  }

  initWidgets(){

    const thisBooking = this; 


    thisBooking.amountWidget = new amountWidget(thisBooking.dom.amountWidget);
    thisBooking.dom.amountWidget.addEventListener('updated', function(){});

    thisBooking.hoursAmount = new amountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){});

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dateInput);
    thisBooking.hoursPicker = new HourPicker(thisBooking.dom.hoursInput);

    thisBooking.dom.wrapper.addEventListener('updated', function(event){
      thisBooking.updateDOM();
      thisBooking.pickTable(event);
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      thisBooking.pickTable(event);
    });

    thisBooking.dom.bookingForm.addEventListener('submit', function(event){
      thisBooking.sendBookings(event);
    });

    //thisBooking.dom.starters.addEventListener('')

  }
}

export default booking; 