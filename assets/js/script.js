//Content to display time 
var datetime = document.querySelector('#currentDay');

var date = moment(new Date())
datetime.textContent = (date.format('dddd, MMMM Do YYYY'));

//Format the date in MM/DD/YY for the weather card
var todayDate = (date.format('MM/D/YY'));

//APIKey for the request to openweather
var APIKey = "18478b8e8991a96f7973ebca1c12f563";

var historyEl = document.getElementById("history");
var searchInputEl = document.getElementById("cityname");
var searchInputBtn = document.getElementById("searchBtn");

var parsedLocations = [];

//Need an API pull to get the 5 day forecast using the same key and same city
function getFiveDayApi(lat, lon) {

  //one call request

  var oneCallQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=" + APIKey;

  // This request is for  
  fetch(oneCallQueryUrl)
  .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //before we enter the loop to create and append elements to the forecastAnchor
      //we need to clean it of any previously attached elements
      while (forecastAnchor.firstChild) {
        forecastAnchor.removeChild(forecastAnchor.firstChild);
      }

      //[0] is the current day so start at 1
      for(i = 1; i <6; i++){
        // need to populate the 5 day forcast containers
        // steps create a variable with the value I want to display
        // create the elements I need on my html page but alo make the
        // containers to hold them
        // append the items to each other, the appended item is a child
        // set the attributes, notice multiple classes in one statement
        // append the new container to the document as the last step

        // create the variables
        var iterationMoment = moment().add(i, 'days');
        var date = (iterationMoment.format('MM/D/YY'));
        //console.log("displayMoment", displayMoment);
        var temp = data.daily[i].temp.max;
        var icon = data.daily[i].weather[0].icon;
        var iconHttp = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
        var humidity = data.daily[i].humidity;
        var uv = data.daily[i].uvi;
        //create an element
        var col = document.createElement("div");
        var card = document.createElement("div");
        var cardTitle = document.createElement("h4");
        var body = document.createElement("div");
        var iconEl = document.createElement("img");
        var tempEl = document.createElement("p");
        var humEl = document.createElement("p");
        var uviEl = document.createElement("p");

        //append to html - need to append before attaching a class
        col.append(card);
        card.append(body);
        body.append(cardTitle, iconEl, tempEl, humEl, uviEl);
           
        //attach a class - set attribute
        col.setAttribute('class', "col weatherDay");

        //use text content to to assign content to html elements
        cardTitle.textContent = date;
        iconEl.setAttribute('src', iconHttp);
        tempEl.textContent = "Temp (F): " + temp;
        humEl.textContent = "Humidity (%): " + humidity;
        uviEl.textContent = "UV Index: " + uv;

        //appened the new container to the document
        forecastAnchor.append(col);
      }

      //variable for current day uvi
      var currentDayUvi = data.current.uvi;

      searchUVindex.textContent = "UV Index: " + currentDayUvi;

      //Need to set a backgournd color, maybe by setting class depending on the UV index value
      if (currentDayUvi <= 2) {
        searchUVindex.setAttribute('class', "uvilow");
      } else if (currentDayUvi <= 5) {
        searchUVindex.setAttribute('class', "uvimod");
      } else if (currentDayUvi <= 7) {
        searchUVindex.setAttribute('class', "uvihigh");
      } else if (currentDayUvi > 7) {
        searchUVindex.setAttribute('class', "uviveryhigh");
      }
    });
  }

// Send an API request to the URL

function getApi(city) {

  //need a request Url 
  var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&appid=" + APIKey;

  // This request is for open weather  
  fetch(queryUrl)
  .then(function (response) {
     //start of code to redirect in the event of of 404 event
    //  if (response.status !== 200) {
    //    document.location.replace('./404.html')
    //  } else - NEED TO INCLUDE THE LINE BELOW IN THE ELSE STATEMENT
      return response.json();
    })
    .then(function (data) {
      // the query is successful I have the values I need to set the today card
      // you don't need variable to use textContent if you have ids
 
      searchCityDate.textContent = data.name + "   (" + todayDate +")";
      searchTemp.textContent =  "Temp (F): " + data.main.temp;
      searchWind.textContent = "Wind (mph): " + data.wind.speed;
      searchHumidity.textContent = "Humidity (%): " + data.main.humidity;
      searchDescription.textContent = "Description: " + data.weather[0].description;
      
      //make the searched city's icon a variable so it can be attached
      var currentIcon = data.weather[0].icon;
      var currentIconHttp = "https://openweathermap.org/img/wn/" + currentIcon + "@2x.png";

      //Create image element
      var currentIconEl = document.createElement("img");
      //set attribute, specifically make it an src with  a link
      currentIconEl.setAttribute('src', currentIconHttp);
      //append the new element to the document to the city name
      searchCityDate.append(currentIconEl);

      //THESE VARIABLE PULLS FROM THE FETCH DATA
      var lat = data.coord.lat;
      var lon = data.coord.lon;

      //call my fiveDayApi function to get the five day forecast
      getFiveDayApi(lat, lon);      

    });
  }


//This saves a new location to the local storage and then reruns the display saved locations function
function saveNewLocation() {
  localStorage.setItem("savedLocations", JSON.stringify(parsedLocations));
  displaySavedLocations();
}


function displaySavedLocations() {
  var locations = localStorage.getItem("savedLocations");
  if (locations) {
    parsedLocations = JSON.parse(locations);

    //need to clear any existing html elements
    while (historyEl.firstChild) {
      historyEl.removeChild(historyEl.firstChild);
    }

    //this function runs a for each loop over each city in the parsedlocations Array
    //for each city it makes a list element
    //it creates content in the form of a button with a data location where
    //the data attribute is the item, the city name
    //then the inner html of the listitem is set to the button/attribute

    parsedLocations.forEach(function (item) {
      var listItem = document.createElement('li');
      var content = `<button data-location ="${item}">${item}</button>`;
      
      listItem.innerHTML = content;
      historyEl.appendChild(listItem);
  }); 
  }
}

function updateContentPane (evt){
  var buttonClicked = evt.target;
  var location = buttonClicked.getAttribute("data-location");
  // call the fetch function with the location from the attribute
  getApi(location);
}

function getLocation(evt) {
  //If form input always use prevent default
  evt.preventDefault();
  var location = searchInputEl.value;

  //adding the new location to parsedLocations
  if (parsedLocations.includes(location) === false && location !== ""){
  parsedLocations.push(location);

  //call the function to save my updated parsedLocations
  saveNewLocation();
  }

  // Call the fetch Function here aftering getting the location
  // and hand the function the location
  getApi(location);
}

function setEventListeners(){
  historyEl.addEventListener("click", updateContentPane);
  searchInputBtn.addEventListener("click", getLocation);
}

function init() {
  setEventListeners();
  displaySavedLocations();
}

//calls init on page load
init();