const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const weatherCardDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const skeleton = document.querySelectorAll(".skeleton-before");


const apiKey = 'b1f50a44db537058198a7237b8f77baa';


//<====== create card ======>
const createWeatherCard = (cityName, wtrItem, index) => {
    if (index === 0) {
        return (`
        <div class="details">
          <h2>${cityName} (${wtrItem.dt_txt.split(" ")[0]})</h2>
          <h4>Temperature: ${(wtrItem.main.temp - 273.15).toFixed(2)}°C</h4>
          <h4>Wind: ${wtrItem.wind.speed} m/s</h4>
          <h4>Humidity: ${wtrItem.main.humidity}%</h4>
        </div>
        <div class="icon">
          <img src="https://openweathermap.org/img/wn/${wtrItem.weather[0].icon}@4x.png" alt="Weather-Icon">
          <h4>${wtrItem.weather[0].description}</h4>
        </div>`);
    } else {
        return (`<li class="card">
        <h3>${wtrItem.dt_txt.split(" ")[0]}</h3>
        <img src="https://openweathermap.org/img/wn/${wtrItem.weather[0].icon}@2x.png" alt="Weather-Icon">
        <h4>Temp: ${(wtrItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${wtrItem.wind.speed} m/s</h4>
        <h4>Humidity: ${wtrItem.main.humidity}%</h4>
    </li>`);
    }

}

//<====== fetching weather detail ======>
const getWeatherDetails = async (cityName, lat, lon) => {
    const weatherUlr = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    skeleton.forEach((item) => { return item.classList.add("skeleton"); });

    const response = await fetch(weatherUlr);
    const data = await response.json();

    skeleton.forEach((item) => { return item.classList.remove("skeleton"); });

    const uniqFCDays = [];
    const fiveDayFC = data.list.filter((foreCast) => {
        const fcDate = new Date(foreCast.dt_txt).getDate();
        if (!uniqFCDays.includes(fcDate)) {
            return (uniqFCDays.push(fcDate));
        }
    });

    //<==== remove previous card or do empty DOM ====>
    weatherCardDiv.innerHTML = '';
    currentWeatherDiv.innerHTML = '';
    
    //<==== set card inside DOM ====>
    fiveDayFC.forEach((wtrItem, index) => {
        if (index === 0) {
            currentWeatherDiv.insertAdjacentHTML('beforeend', createWeatherCard(cityName, wtrItem, index));
        } else {
            weatherCardDiv.insertAdjacentHTML('beforeend', createWeatherCard(cityName, wtrItem, index));
        }
    })
}

//<====== fetch city coordinate by clicking on search button ======>
const getCityCoord = async () => {
    const cityName = cityInput.value.trim();
    const coordUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
    if (!cityName) {
        return;
    }

    const response = await fetch(coordUrl);
    const data = await response.json();

    if (!data.length) {
        alert("city not found");
    }
    else {
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }

}

//<====== fetch current position by clicking on location button ======>
const getLocationCoord = ()=>{
    navigator.geolocation.getCurrentPosition(async (position)=>{
        const { latitude, longitude} = position.coords;
        const reverseCoord = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

        const response = await fetch(reverseCoord);
        const data = await response.json();

        const {name} = data[0];
        getWeatherDetails(name,latitude,longitude);
    },(error)=>{
        if(error.code === error.PERMISSION_DENIED){
            alert('Location Permission Is Block');
        }
    })
}


//<====== addEventListener on searchButton ======>
searchBtn.addEventListener('click', getCityCoord);

//<====== addEventListener on locationButton ======>
locationBtn.addEventListener('click', getLocationCoord);

//<====== addEventListener on Enter key ======>
cityInput.addEventListener('keyup',(e)=>{
    e.key === 'Enter' && getCityCoord();
});
