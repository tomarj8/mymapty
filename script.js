'use strict';




const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date();
    id =  (Date.now() + '').slice(-10);
    
    constructor(distance,duration,coords)
    {
      this.distance = distance;
      this.duration = duration; // in km
      this.coords   = coords;  //[lat,lng]
      console.log(this.type);
    }

    setdescription()
    {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description  = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }



}

class running extends Workout {
    type = 'running';
    constructor(distance, duration, coords, cadence)
    {
          super(distance,duration,coords);
          this.cadence = cadence;
          this.calcpace();
          this.setdescription();

    }

    calcpace(){
        this.pace = this.duration/this.distance;
        return this.pace;
    }
}

class cycling extends Workout {
    type = 'cycling';
    constructor(distance, duration, coords, elevation)
    {
          super(distance,duration,coords);
          this.elevation = elevation;
          this.calcspeed();
          this.setdescription();
        
    }

    calcspeed(){
        this.speed = this.distance/(this.duration / 60);
        return this.speed;
    }

    
}




class App{
        
        type;
        #map1;
        #mapevent;
        #workouts = [];
        constructor(){
        this._getPosition();
        console.log(this);

        form.addEventListener('submit',this._newWorkout.bind(this));
        containerWorkouts.addEventListener('click',this._movetomarker.bind(this));

        this._getLocalstorage();// we have created this function to get localstorage instantly when the app is started
        
        inputType.addEventListener('change', this._toogleElevation);

    }

    // here we are getting position using geolocation api
    // and we call this function in constructor so that it will be called automatically when the script is loaded

    _getPosition(){
      //  console.log(this);
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function()
        {
        alert('location access is not given');
        });

    }
   

     // this is loadmap function that we call in _getposition using bind to bind it with current object

    _loadMap(position)
    {
        console.log(this);
        console.log(position);
        const{latitude} = position.coords;
        const{longitude}  = position.coords;
        console.log(latitude);

        const coords = [latitude, longitude];
   
        this.#map1 = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map1);

      //here it will call the showform function

        this.#map1.on('click',this._showForm.bind(this) )

        // here i am calling this function because this will called instantly in the constructor function of the app

        this.#workouts.forEach(work => 
          
          this._renderworkoutmarker(work) // this will render the 
         );


    }

    _showForm(e)
    {

        form.classList.remove('hidden');
        this.#mapevent = e;
        inputDistance.focus();
        console.log(this.#mapevent);
       
    }

    _toogleElevation(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');

    }

    hideform(){
        inputCadence.value = inputDistance.value = inputElevation.value = inputDuration.value = ' ';
        form.classList.add('hidden');``

    }



    _newWorkout(e){

       

           const validinputs = (...inputs) => inputs.every( inp => Number.isFinite(inp));

           const allpositive = (...inputs) => inputs.every(inp=> inp>0);
        
            e.preventDefault();

            // get data from form

             this.type = inputType.value;
            const distance = +inputDistance.value; // here i have used + operator to convert form string value into number
            const duration = +inputDuration.value;
            const{lat,lng} = this.#mapevent.latlng;
            let workout;



            // check if data is valid

            


            //if workout running create running object
            if(this.type==='running'){
                const cadence = +inputCadence.value;

                if(!validinputs(distance,duration,cadence) || !allpositive(distance, duration, cadence) ) return alert('please enter right value');

                workout = new running(distance,duration,[lat,lng],cadence);
            }

            // if workout is cycling create cycling object

            if(this.type==='cycling'){
                const elevation = +inputElevation.value;
                if(!validinputs(distance,duration,elevation) || !allpositive(distance,duration)) return alert('please enter right value');

                workout = new cycling(distance , duration, [lat,lng],elevation);
            }

            

            // Add new object to workout array

            this.#workouts.push(workout);
            console.log(workout);
            


            //Render workout on map

            this._renderworkoutmarker(workout);


            //render workout on list

            this._renderworkout(workout);   

            //clear input fields

            this.hideform(workout);

            // now lets make local storage

            this._setLocalstorage();


        
        
        
        }

        _renderworkoutmarker(workout)

        {
           console.log(this.type);

            L.marker(workout.coords).addTo(this.#map1)
           .bindPopup(L.popup({
               maxWidth:250,
               minWidth:100,
               autoClose:false,
               closeOnClick:false,
               className:`${this.type}-popup`
           })).setPopupContent(`${workout.type==='running'?'🏃‍♂️':'🚴‍♀️'} ${workout.description}` )
           .openPopup();
        }

        _renderworkout(workout)

        {  
          let html =  `<li class="workout workout--${this.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${this.type==='running'?'🏃‍♂️':'🚴‍♀️'}</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>`;

            if(this.type==='running')
            {
                html+=` 
              <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
              </div>
              </li>`
            }

            if(this.type==='cycling')
            {
                html+=`
                <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
         </li>

                
                
                `
            }

            form.insertAdjacentHTML('afterend', html);
          }

        _movetomarker(e)
        {
          const workoutEl = e.target.closest('.workout');
          // console.log(workoutEl);

          const worko = this.#workouts.find(work=>work.id===workoutEl.dataset.id);
          console.log(worko);

          this.#map1.setView(worko.coords,13,{  //this setview function is from leaflet that is used to move marker
                                                // into view
            animate:true,
            pan:{
              duration:1
            },
          });

        }
          
        _setLocalstorage()
        {
            localStorage.setItem('workou',JSON.stringify(this.#workouts));
        }

        _getLocalstorage()
        {
          const data = JSON.parse(localStorage.getItem('workou'));
          console.log(data);
          
          if(!data) return;

         this.#workouts = data;

         this.#workouts.forEach(work => 
          
          this._renderworkout(work)
         );

        

        

        }


        }

    



const app = new App();



  




