'use strict';

(function($){

  var apiURL = 'http://api.wunderground.com/api/c0b168fbe50bdfd7/';

  var pageData = localStorage.pageData ? JSON.parse(localStorage.pageData) : [];

  $(document).ready(init);

  function init(){

    let userLocationURL = apiURL + 'geolookup/q/autoip.json';

    $.get(userLocationURL)
    .done(function(data){
      // debugger;
      let userCity = data.location.city;
      let userCityFormatted = userCity.split(' ').join('_');
      let userState = data.location.state;
      let userLocation = userState + '/' + userCityFormatted;

      let userLocationData = {
        userCity: userCity,
        userState: userState,
        userTempType: 'F'
      }

      pageData.push(userLocationData);


      let conditionsURL = apiURL + 'conditions/q/' + userLocation + '.json';

      $.get(conditionsURL)
      .done(function(data){
        // debugger;
        let currentTempF = data.current_observation.temp_f
        let currentTempC = data.current_observation.temp_c
        let feelsLikeF = data.current_observation.feelslike_f
        let feelsLikeC = data.current_observation.feelslike_c
        let weatherIconURL = data.current_observation.icon_url

        let conditionsData = {
          currentTempF: currentTempF,
          currentTempC: currentTempC,
          feelsLikeF: feelsLikeF,
          feelsLikeC: feelsLikeC,
          weatherIconURL: weatherIconURL
        }

        pageData.push(conditionsData);

        let forecastURL = apiURL + 'forecast/q/' + userLocation + '.json';

        $.get(forecastURL)
        .done(function(data){
          // debugger;

          let firstDay = new ForecastDay(data, 0);
          let secondDay = new ForecastDay(data, 1);
          let thirdDay = new ForecastDay(data, 2);
          let fourthDay = new ForecastDay(data, 3);

          let forecastData = {
            firstDay: firstDay,
            secondDay: secondDay,
            thirdDay: thirdDay,
            fourthDay: fourthDay
          }

          pageData.push(forecastData);

        // helpful hint from stackoverflow!
          Date.prototype.yyyymmdd = function() {
            var yyyy = (this.getFullYear() - 1).toString();
            var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
            var dd  = this.getDate().toString();
            return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
           };

          let oneYearAgo = new Date();
          oneYearAgo = oneYearAgo.yyyymmdd();

          let historyURL = apiURL + 'history_' + oneYearAgo + '/q/' + userLocation + '.json';

          $.get(historyURL)
          .done(function(data){
            // debugger;

            let lastYearTempF = data.history.dailysummary[0].meantempi;
            let lastYearTempC = data.history.dailysummary[0].meantempm;
            let lastYearDatePretty = data.history.date.pretty;

            let historyData = {
              lastYearTempF: lastYearTempF,
              lastYearTempC: lastYearTempC,
              lastYearDatePretty: lastYearDatePretty
            }

            pageData.push(historyData);

            let almanacURL = apiURL + 'almanac/q/' + userLocation + '.json';

            $.get(almanacURL)
            .done(function(data){
              // debugger;

              let recordHighYear = data.almanac.temp_high.recordyear;
              let recordHighTempF = data.almanac.temp_high.record.F;
              let recordHighTempC = data.almanac.temp_high.record.C;

              let recordLowYear = data.almanac.temp_low.recordyear;
              let recordLowTempF = data.almanac.temp_low.record.F;
              let recordLowTempC = data.almanac.temp_low.record.C;

              let almanacData = {
                recordHighYear: recordHighYear,
                recordHighTempF: recordHighTempF,
                recordHighTempC: recordHighTempC,
                recordLowYear: recordLowYear,
                recordLowTempF: recordLowTempF,
                recordLowTempC: recordLowTempC
              }

              pageData.push(almanacData);

              populateValuesOnPage();


            }).fail(function(error){
              console.log('almanac error', error);
            });
          }).fail(function(error){
            console.log('forecast error', error)
          });
        }).fail(function(error){
          console.log('forecast error', error)
        });
      }).fail(function(error){
        console.log('conditions error', error);
      });
    }).fail(function(error){
      console.log('user location error', error);
    });

    let ForecastDay = function(data, i){
      this.weekday = data.forecast.simpleforecast.forecastday[i].date.weekday;
      this.conditions = data.forecast.simpleforecast.forecastday[i].conditions;
      this.icon = data.forecast.simpleforecast.forecastday[i].icon_url;
      this.highF = data.forecast.simpleforecast.forecastday[i].high.fahrenheit;
      this.highC = data.forecast.simpleforecast.forecastday[i].high.celsius;
      this.lowF = data.forecast.simpleforecast.forecastday[i].low.fahrenheit;
      this.lowC = data.forecast.simpleforecast.forecastday[i].low.celsius;
      this.forecastText = data.forecast.txt_forecast.forecastday[i*2].fcttext;
    }

    function populateValuesOnPage() {
      // debugger;
      console.log(pageData);

      $('#userLocation').text(pageData[0].userCity + ", " + pageData[0].userState);
      $('#currentWeatherIcon').attr('src', pageData[1].weatherIconURL);

// refactor to loop if time
      let $forecastIcon1 = $('<img>').attr('src', pageData[2].firstDay.icon);
      $('#forecastDayOne h3').text(pageData[2].firstDay.weekday);
      $('#forecastDayOne h1').text(pageData[2].firstDay.conditions);
      $('#forecastDayOne h1').append($forecastIcon1);
      $('#forecastDayOne p').text(pageData[2].firstDay.forecastText);

      let $forecastIcon2 = $('<img>').attr('src', pageData[2].secondDay.icon);
      $('#forecastDayTwo h3').text(pageData[2].secondDay.weekday);
      $('#forecastDayTwo h1').text(pageData[2].secondDay.conditions);
      $('#forecastDayTwo h1').append($forecastIcon2);
      $('#forecastDayTwo p').text(pageData[2].secondDay.forecastText);

      let $forecastIcon3 = $('<img>').attr('src', pageData[2].thirdDay.icon);
      $('#forecastDayThree h3').text(pageData[2].thirdDay.weekday);
      $('#forecastDayThree h1').text(pageData[2].thirdDay.conditions);
      $('#forecastDayThree h1').append($forecastIcon3);
      $('#forecastDayThree p').text(pageData[2].thirdDay.forecastText);

      let $forecastIcon4 = $('<img>').attr('src', pageData[2].fourthDay.icon);
      $('#forecastDayFour h3').text(pageData[2].fourthDay.weekday);
      $('#forecastDayFour h1').text(pageData[2].fourthDay.conditions);
      $('#forecastDayFour h1').append($forecastIcon4);
      $('#forecastDayFour p').text(pageData[2].fourthDay.forecastText);

      // F or C if conditional
      if (pageData[0].userTempType === 'F'){
        $('#currentTemp').text(pageData[1].currentTempF.toString() + ' °F');
        $('#feelsLike').text('Feels Like: ' + pageData[1].feelsLikeF + ' °F');

        $('#forecastDayOne h4:first').text('high: ' + pageData[2].firstDay.highF + ' °F');
        $('#forecastDayOne h4:last').text('low: ' + pageData[2].firstDay.lowF + ' °F');
        $('#forecastDayTwo h4:first').text('high: ' + pageData[2].secondDay.highF + ' °F');
        $('#forecastDayTwo h4:last').text('low: ' + pageData[2].secondDay.lowF + ' °F');
        $('#forecastDayThree h4:first').text('high: ' + pageData[2].thirdDay.highF + ' °F');
        $('#forecastDayThree h4:last').text('low: ' + pageData[2].thirdDay.lowF + ' °F');
        $('#forecastDayFour h4:first').text('high: ' + pageData[2].fourthDay.highF + ' °F');
        $('#forecastDayFour h4:last').text('low: ' + pageData[2].fourthDay.lowF + ' °F');

        $('#lastYearInfo').text('Last year on ' + pageData[3].lastYearDatePretty + ', it was ' + pageData[3].lastYearTempF + ' °F');

        $('#recordHigh').text('The highest recorded temperature for today was ' + pageData[4].recordHighTempF + '°F in ' + pageData[4].recordHighYear);
        $('#recordLow').text('The lowest recorded temperature for today was ' + pageData[4].recordLowTempF  + '°F in ' + pageData[4].recordLowYear);
      } else {
        $('#currentTemp').text(pageData[1].currentTempC.toString() + ' °C');
        $('#feelsLike').text('Feels Like: ' + pageData[1].feelsLikeC + ' °C');

        $('#forecastDayOne h4:first').text('high: ' +pageData[2].firstDay.highC + ' °C');
        $('#forecastDayOne h4:last').text('low: ' + pageData[2].firstDay.lowC + ' °C');
        $('#forecastDayTwo h4:first').text('high: ' +pageData[2].secondDay.highC + ' °C');
        $('#forecastDayTwo h4:last').text('low: ' + pageData[2].secondDay.lowC + ' °C');
        $('#forecastDayThree h4:first').text('high: ' +pageData[2].thirdDay.highC + ' °C');
        $('#forecastDayThree h4:last').text('low: ' + pageData[2].thirdDay.lowC + ' °C');
        $('#forecastDayFour h4:first').text('high: ' +pageData[2].fourthDay.highC + ' °C');
        $('#forecastDayFour h4:last').text('low: ' + pageData[2].fourthDay.lowC + ' °C');

        $('#lastYearInfo').text('On ' + pageData[3].lastYearDatePretty + ', it was ' + pageData[3].lastYearTempC + '°C');

        $('#recordHigh').text('The highest recorded temperature for today was ' + pageData[4].recordHighTempC + '°C in ' + pageData[4].recordHighYear);
        $('#recordLow').text('The lowest recorded temperature for today was ' + pageData[4].recordLowTempC  + '°C in ' + pageData[4].recordLowYear);

      }
    }

    console.log('done');

  }




})(jQuery);
