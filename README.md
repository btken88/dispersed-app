# Dispersed App

## Table of Contents

- [Dispersed App](#dispersed-app)
  - [Table of Contents](#table-of-contents)
  - [General Info](#general-info)
  - [Inspiration](#inspiration)
  - [Demonstration Video](#demonstration-video)
  - [Technologies](#technologies)
  - [Setup](#setup)
  - [Example Code](#example-code)
  - [Features](#features)
  - [Status](#status)
  - [Contact](#contact)
  - [License](#license)

## General Info

Dispersed is a frontend web application which allows users to explore the National Forest system to find and save new or old favorite dispersed camping sites. It is built with the React framework, using hooks instead of class components.

## Inspiration

Dispersed camping is allowed on most forest service roads open to public use, but map options to find new sites are less than ideal. Generally the only way to explore dispersed camping locations is on a large paper map from the forest service, which is difficult to later locate with gps mapping.

With Dispersed, you can now find available areas on an interactive map, with color-coded road information. You can also get current weather information along with a 5 day forecast, and can save spots you'd like to visit later.

## Demonstration Video

[Dispersed Youtube Demonstation](https://www.youtube.com/watch?v=G7GKNNk4-Lo)

## Technologies

- React
- JavaScript
- ArcGIS JavaSript API (mapping)
- Esri Maps API
- CSS

## Setup

To get Dispersed installed and running, you will need both the dispersed app and the dispersed api. The backend and setup instructions can be found at [Dispersed-API](https://github.com/btken88/dispersed-api). Once you've installed the backend, you can get the frontend running by navigating into the directory, installing node modules and starting the node server:

```bash
cd dispersed-app
npm install
npm start
```

## Example Code

```javascript
<div className='form-page'>
  <Header />
  <div className='form-container' onSubmit={toggle ? signUp : signIn}>
    <h2>{toggle ? 'Sign Up' : 'Sign In'}</h2>
    <form className='sign-in'>
      {toggle
        ? <>
          <label>Email</label>
          <input type="text"
            name="Email"
            value={email}
            onChange={e => setEmail(e.target.value)} />
        </>
        : null}
      <label>Username</label>
      <input type="text"
        name="Username"
        value={username}
        onChange={e => setUsername(e.target.value)} />
      <label>Password</label>
      <input type="password"
        name="Password"
        value={password}
        onChange={e => setPassword(e.target.value)} />
      <input type='submit' value={toggle ? 'Sign Up' : 'Sign In'} />
    </form>
    <div className='toggler'>
      <p>{toggle ? 'Already have an account?' : 'Need to create an account?'}</p>
      <button onClick={() => setToggle(!toggle)}>{toggle ? 'Sign In' : 'Sign Up'}</button>
    </div>
  </div>
  <Footer />
</div>

useEffect(() => {
  fetch(elevationAPI)
    .then(response => response.json())
    .then(data => {
      let elevationResult = Math.floor(data.elevationProfile[0].height)
      setElevation(elevationResult)
    })
}, [elevationAPI])

const loggedIn = localStorage.getItem('token')


let fiveDayForecast = null
if (daily) {
  fiveDayForecast = daily.slice(0, 5).map(day => {
    return (
      <div className='day' key={day.sunrise}>
        <img src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
          alt={day.weather[0].main} />
        <p>{day.weather[0].main}</p>
        <p>High: {Math.floor(day.temp.max)}</p>
        <p>Low: {Math.floor(day.temp.min)}</p>
      </div>
    )
  })
}

function showFavoriteForm(event) {
  event.stopPropagation()
  setShowForm(!showForm)
}

return (
  <div className='modal-card'>
    <h2>Current Weather</h2>
    {weather.current ?
      (<>
        <p>Elevation: {elevation} ft.</p>
        <p>Lat: {point.lat.toFixed(4)}</p>
        <p>Lon: {point.lng.toFixed(4)}</p>
        <img src={`http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
          alt={current.weather[0].main} />
        <p>{current.weather[0].description}</p>
        <br></br>
        <p>Current Temp: {Math.floor(current.temp)}</p>
        <p>Feels like: {Math.floor(current.feels_like)}</p>
        <p>Humidity: {Math.floor(current.humidity)}%</p>
        <br></br>
        <h2>Five Day Forecast</h2>
        <div className='five-day-forecast'>
          {fiveDayForecast}
        </div>
      </>)
      : null}
    <div className='card-buttons'>
      <a href={`https://www.google.com/maps/dir/''/${lat},${lng}`} target="blank">Get there with Google</a>
      {loggedIn ? <button onClick={showFavoriteForm}>Add to Favorites</button> : null}
    </div>
  </div>
)
```

## Features

Current Features:

- Explore the map as a guest user
- Create a secure login to save, update, and delete favorite sites
- View details about a location including elevation, lat/lon, current temperature, and a 5-day weather forecast
- Save favorite sites with notes and view favorited sites as pins on a map

Future Features:

- Save campsites either publicly or privately
- Upload photos of campsites and road conditions
- Display forest service and weather alerts regarding closures and warnings
- Refactor current code

## Status

The application is fully functional and ready to be enjoyed as is. Future updates and improvements are still a possibility.

## Contact

Created by [Bryce Kennedy](https://www.linkedin.com/in/bryce-kennedy/)

If you have any questions or comments, suggestions, or bug fixes, feel free to reach out to me.

## License

[Click to view](https://github.com/btken88/dispersed-app/blob/master/license.txt)
