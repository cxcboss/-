// 获取 DOM 元素
const loadingEl = document.getElementById('loading');
const weatherInfo = document.getElementById('weatherInfo');
const currentTempEl = document.getElementById('currentTemp');
const weatherIconEl = document.getElementById('weatherIcon');
const feelsLikeEl = document.getElementById('feelsLike');
const windDirEl = document.getElementById('windDir');
const windScaleEl = document.getElementById('windScale');
const humidityEl = document.getElementById('humidity');
const hourlyForecastEl = document.getElementById('hourlyForecast');
const weeklyForecastEl = document.getElementById('weeklyForecast');

// 填写你的 API Key
const API_KEY = '053d2e66a0784d5d9c287c535089c570'; // 你的 API Key

// 英文到中文天气描述映射
const WEATHER_TEXT_MAP = {
  'Sunny': '晴',
  'Cloudy': '多云',
  'Partly cloudy': '局部多云',
  'Overcast': '阴',
  'Light rain': '小雨',
  'Moderate rain': '中雨',
  'Heavy rain': '大雨',
  'Thunderstorm': '雷阵雨',
  'Snow': '雪',
  'Fog': '雾',
};

// 页面加载时自动获取天气数据
window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await fetchWeatherData(longitude, latitude); // 注意顺序是经度,纬度
    }, (error) => {
      alert('无法获取位置信息，请检查定位权限。');
      loadingEl.classList.add('hidden');
    });
  } else {
    alert('您的浏览器不支持地理定位功能。');
  }
});

// 获取天气数据
async function fetchWeatherData(lon, lat) {
  try {
    // 显示加载动画
    loadingEl.classList.remove('hidden');
    weatherInfo.classList.add('hidden');

    // 调用实时天气 API
    const weatherResponse = await fetch(`https://devapi.qweather.com/v7/weather/now?location=${lon},${lat}&key=${API_KEY}`);
    const weatherData = await weatherResponse.json();

    if (weatherData.code === '200') {
      const now = weatherData.now;

      // 更新页面内容
      currentTempEl.textContent = now.temp;
      feelsLikeEl.textContent = now.feelsLike;
      windDirEl.textContent = translateWindDirection(now.windDir);
      windScaleEl.textContent = now.windScale;
      humidityEl.textContent = now.humidity;

      // 设置天气图标和描述
      const iconUrl = `icons/${now.icon}.svg`;
      weatherIconEl.src = iconUrl;
      const weatherCondition = WEATHER_TEXT_MAP[now.text] || now.text;
      weatherIconEl.alt = weatherCondition;

      // 更新每小时天气预报
      updateHourlyForecast(lon, lat);

      // 更新未来一周天气预报
      updateWeeklyForecast(lon, lat);

      // 隐藏加载动画，显示天气信息
      loadingEl.classList.add('hidden');
      weatherInfo.classList.remove('hidden');
    } else {
      alert(`获取天气数据失败，错误代码：${weatherData.code}，错误信息：${weatherData.message}`);
    }
  } catch (error) {
    console.error('获取天气数据失败:', error);
    alert('获取天气数据失败，请稍后重试。');
  }
}

// 更新每小时天气预报
async function updateHourlyForecast(lon, lat) {
  try {
    const response = await fetch(`https://devapi.qweather.com/v7/weather/24h?location=${lon},${lat}&key=${API_KEY}`);
    const data = await response.json();

    if (data.code === '200') {
      hourlyForecastEl.innerHTML = '';
      data.hourly.forEach(hour => {
        const time = new Date(hour.fxTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = hour.temp;
        const li = document.createElement('li');
        li.innerHTML = `
          <p>${time}</p>
          <p>${temp}°C</p>
        `;
        hourlyForecastEl.appendChild(li);
      });
    }
  } catch (error) {
    console.error('获取每小时天气预报失败:', error);
  }
}

// 更新未来一周天气预报
async function updateWeeklyForecast(lon, lat) {
  try {
    const response = await fetch(`https://devapi.qweather.com/v7/weather/7d?location=${lon},${lat}&key=${API_KEY}`);
    const data = await response.json();

    if (data.code === '200') {
      weeklyForecastEl.innerHTML = '';
      data.daily.forEach(day => {
        const date = formatDate(day.fxDate);
        const minTemp = day.tempMin;
        const maxTemp = day.tempMax;
        const condition = WEATHER_TEXT_MAP[day.textDay] || day.textDay;
        const li = document.createElement('li');
        li.innerHTML = `
          <p>${date}</p>
          <p>最高 ${maxTemp}°C</p>
          <p>最低 ${minTemp}°C</p>
          <p>${condition}</p>
        `;
        weeklyForecastEl.appendChild(li);
      });
    }
  } catch (error) {
    console.error('获取未来一周天气预报失败:', error);
  }
}

// 格式化日期为“星期+日期”
function formatDate(dateString) {
  const date = new Date(dateString);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[date.getDay()];
  const monthDay = date.getDate();
  return `${weekDay} ${monthDay}日`;
}

// 翻译风向为中文
function translateWindDirection(direction) {
  const WIND_DIRECTION_MAP = {
    'N': '北风',
    'NE': '东北风',
    'E': '东风',
    'SE': '东南风',
    'S': '南风',
    'SW': '西南风',
    'W': '西风',
    'NW': '西北风',
  };
  return WIND_DIRECTION_MAP[direction] || direction;
}