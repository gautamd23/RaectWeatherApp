import logo from "./logo.svg";
import "./index.css";
import { useEffect, useReducer, useState, axios } from "react";
import clip from "./vclouds.mp4";

const initialState = {
  location: "",
  weather: {},
  isLoading: false,
  disPlayName: "",
  x: 0,
  y: 0,
  curLoc: "",
  isCur: false,
  name: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "input":
      return {
        ...state,
        location: action.payload,

        isCur: !state.isCur,
      };
    case "weather":
      return {
        ...state,
        weather: state.location.length > 2 ? action.payload : initialState,
      };
    case "display":
      return {
        ...state,
        disPlayName:
          state.location.length === action.payload.length ? action.payload : "",
      };
    case "x":
      return { ...state, x: action.payload };
    case "y":
      return { ...state, y: action.payload };
    case "current":
      return { ...state, curLoc: action.payload, location: state.curLoc };
    case "cur":
      return { ...state, isCur: action.payload };
    case "setname":
      return { ...state, name: state.location.length > 2 ? state.location : '' };
  }
}
function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}
function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}
const api = {
  key: "40bb0a8e40ccd8b22e3c3c0f59fdb699",
  base: "https://api.openweathermap.org/data/2.5/",
};
export default function App() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [
    { location, weather, isLoading, disPlayName, x, y, curLoc, isCur, name },
    dispatch,
  ] = useReducer(reducer, initialState);

  useEffect(function () {
    async function getLocWeather() {
      try {
        const position = await new Promise((resolve, reject) => {
          window.navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        let getApi = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${api.key}&units=metric`;
        const result = await fetch(getApi);
        const res = await result.json();
        console.log(res.name);
        dispatch({ type: "current", payload: res.name });

        //  const result = axios.get(getApi).then((res)=>{
        //   console.log(res.data);
        // })
        // console.log(result);
      } catch (error) {}
    }
    getLocWeather();
  }, []);

  useEffect(
    function () {
      const controller = new AbortController();
      async function handleWeather() {
        // if (location.length === 0) return null;
        try {
          // await navigator.geolocation.getCurrentPosition(savePositionToState);
          // const res = await fetch(
          //   `https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&appid=${api.key}&units=metric`
          // );
          // console.log();
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
          );
          const data = await res.json();
          // console.log(data);
          const { latitude, longitude, timezone, name, country_code } =
            data.results.at(0);
          dispatch({ type: "display", payload: name });
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherdata = await weatherRes.json();
          console.log(weatherdata);
          let getApi = `https://api.openweathermap.org/data/2.5/weather?lat=${weatherdata.latitude}&lon=${weatherdata.longitude}&appid=${api.key}&units=metric`;
          console.log(getApi);
          const result = await fetch(getApi);
          const r = await result.json();
          console.log(r);
          dispatch({ type: "setname", payload: r.name });
          dispatch({ type: "weather", payload: weatherdata.daily });
          dispatch({ type: "cur", payload: true });
        } catch (error) {}
      }
      handleWeather();
      return function () {
        controller.abort();
        
      };
    },
    [location]
  );
  return (
    <>
      <video autoPlay muted loop className="myVideo">
        <source src={clip} type="video/mp4" />
      </video>
      <div className="app">
        <h1 className="gradient-text">Weather forcast</h1>
        <input
          type="text"
          placeholder="Enter city here.."
          value={location}
          onChange={(e) => dispatch({ type: "input", payload: e.target.value })}
        ></input>
        <CurrentLoc
          curLoc={curLoc}
          location={location}
          disPlayName={disPlayName}
          isCur={isCur}
          name={name}
        />
        <Weather
          weather={weather}
          getWeatherIcon={getWeatherIcon}
          formatDay={formatDay}
          disPlayName={disPlayName}
          location={location}
          name={name}
        />
      </div>
    </>
  );
}

function Weather({
  weather,
  location,
  getWeatherIcon,
  disPlayName,
  curLoc,
  name,
}) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes,
  } = weather;
  return (
    <div>
      

      <ul className="weather">
      
        {dates?.map((date, i, index) => {
          {/* const id = crypto.randomUUID(); */}
          {/* const { uuid } = require('uuidv4'); */}
          return (
            <Day
              max={max.at(i)}
              min={min.at(i)}
              dates={date}
              codes={codes.at(i)}
              key={index}
              isToday={i === 0}
              getWeatherIcon={getWeatherIcon}
              formatDay={formatDay}
            />
          );
        })}
      </ul>
    </div>
  );
}

function Day({ max, min, codes, dates, getWeatherIcon, formatDay, isToday }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(codes)}</span>
      <p>{isToday ? "Today" : formatDay(dates)}</p>
      <p>
        {Math.floor(max)}&deg; &mdash; {Math.ceil(min)}&deg;{" "}
      </p>
    </li>
  );
}

function CurrentLoc({ curLoc, location, disPlayName, isCur ,name}) {
  return (
    <div>
      <h2>{`${name}`}</h2>
    </div>
  );
}
