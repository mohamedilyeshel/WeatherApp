const weatherIcon = document.querySelector(
  ".currentWeather .stateWeather .icon i"
);
const weatherHeaderInfo = {
  temp: document.querySelector(".currentWeather .stateWeather .temp"),
  loc: document.querySelector(".currentWeather .stateWeather .location"),
  desc: document.querySelector(".currentWeather .stateWeather .skyState"),
  wind: document.querySelector(".currentWeather .info .wind"),
  sunrise: document.querySelector(".currentWeather .info .sunrise"),
  sunset: document.querySelector(".currentWeather .info .sunset"),
};
const getMyLoc = document.querySelector(".getLoca .btn");
const otherLocForm = document.querySelector("form");
let getP = "";

otherLocForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (otherLocForm.elements.loca.value !== "") {
    const res = await getLocation(otherLocForm.elements.loca.value);
    if (res.data.length > 0) {
      getP = res.data[0].lat + "-" + res.data[0].lon;
      const r = await getWeather();
      ChangeHeaderInfo(r);
    } else {
      console.log("no result");
    }
  }
});

const getWeather = async () => {
  try {
    let la = getP.slice(0, getP.indexOf("-"));
    let lo = getP.slice(getP.indexOf("-") + 1);
    const res = await axios({
      method: "get",
      url: "//api.openweathermap.org/data/2.5/forecast",
      params: {
        lat: la,
        lon: lo,
        appid: "579701ab9a2d71976fd082539b575e9a",
        units: "metric",
      },
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

const getLocation = async (l) => {
  try {
    const res = await axios({
      method: "get",
      url: "//api.openweathermap.org/geo/1.0/direct",
      params: {
        q: l,
        limit: 1,
        appid: "579701ab9a2d71976fd082539b575e9a",
      },
    });

    return res;
  } catch (err) {}
};

const ChangeIconDOM = (c, isDay, noSM = false) => {
  weatherIcon.classList.remove(weatherIcon.classList[1]);
  if (noSM === true) {
    weatherIcon.classList.add("wi-" + c);
    return;
  }
  if (isDay === true) {
    weatherIcon.classList.add("wi-day-" + c);
  } else {
    weatherIcon.classList.add("wi-night-alt-" + c);
  }
};

const ChangeIcon = ({ weather, sys }) => {
  let isDay = false;
  if (sys.pod === "d") {
    isDay = true;
  }
  switch (weather[0].main) {
    case "Clouds":
      if (weather[0].id == 801) {
        ChangeIconDOM("cloudy", isDay);
      } else if (weather[0].id == 802) {
        ChangeIconDOM("cloud", isDay, true);
      } else {
        ChangeIconDOM("cloudy", isDay, true);
      }
      break;
    case "Thunderstorm":
      ChangeIconDOM("thunderstorm", isDay);
      break;
    case "Drizzle":
      ChangeIconDOM("showers", isDay, true);
      break;
    case "Rain":
      if (weather[0].id >= 500 && weather[0].id <= 504) {
        ChangeIconDOM("rain", isDay);
      } else if (weather[0].id >= 520 && weather[0].id <= 531) {
        ChangeIconDOM("showers", isDay);
      } else {
        ChangeIconDOM("snow", isDay);
      }
      break;
    case "Snow":
      ChangeIconDOM("snow", isDay);
      break;
    default:
      if (isDay === true) {
        ChangeIconDOM("day-sunny", isDay, true);
      } else {
        ChangeIconDOM("night-clear", isDay, true);
      }
      break;
  }
};

const ChangeInfos = (
  { main, wind, weather },
  { name, country, sunrise, sunset, timezone }
) => {
  weatherHeaderInfo.temp.innerText = `${Math.ceil(main.temp)}°C`;
  weatherHeaderInfo.loc.innerText = `${name}, ${country}`;
  weatherHeaderInfo.desc.innerText = `${weather[0].main}, ${weather[0].description}`;
  weatherHeaderInfo.wind.children[0].children[1].innerText = Math.ceil(
    wind.speed * 3.6
  );
  weatherHeaderInfo.wind.children[0].children[0].classList.remove(2);
  weatherHeaderInfo.wind.children[0].children[0].classList.add(
    "wi-towards-" + wind.deg
  );
  let sunriseTime = new Date(sunrise * 1000 + timezone * 1000);
  let sunsetTime = new Date(sunset * 1000 + timezone * 1000);
  let utcH = `UTC+${new Date(timezone * 1000).getHours()}`;
  weatherHeaderInfo.sunrise.children[0].children[1].innerText = `${sunriseTime.getHours()}:${sunriseTime.getMinutes()} ${utcH}`;
  weatherHeaderInfo.sunset.children[0].children[1].innerText = `${sunsetTime.getHours()}:${sunsetTime.getMinutes()} ${utcH}`;
};

const ChangeHeaderInfo = async (res) => {
  try {
    ChangeIcon(res.data.list[0]);
    ChangeInfos(res.data.list[0], res.data.city);
  } catch (err) {
    console.log(err);
  }
};

const GetCurr = () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    getP = pos.coords.latitude + "-" + pos.coords.longitude;
    const res = await getWeather();
    ChangeHeaderInfo(res);
  });
};

getMyLoc.addEventListener("click", () => {
  if (navigator.geolocation) {
    GetCurr();
  }
});

if (navigator.geolocation) {
  GetCurr();
}
