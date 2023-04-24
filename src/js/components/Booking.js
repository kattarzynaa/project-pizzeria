import { templates, select } from '../settings.js';

class booking {
    constructor(element){

        const thisBooking = this; 

        thisBooking.getElement();
        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    getElement() {

        const thisBooking = this; 

   
    }

    render(element){

        const thisBooking = this; 
    
        /* generate HTML based on template */
        const generatedHTML = templates.bookingWidget()
    

        thisBooking.dom = {
            wrapper: element,
            peopleAmount: thisBooking.peopleAmount,
            hoursAmount: select.booking.hoursAmount,
        }

        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.peopleAmount = document.querySelector(select.booking.peopleAmount);
        thisBooking.peopleAmount = document.querySelector(select.booking.peopleAmount);
        console.log('thisBooking', thisBooking.dom);
        console.log('element', thisBooking.element);
        console.log('peopleAmount', thisBooking.peopleAmount);

    }

    initWidgets(){

    }
}

export default booking; 