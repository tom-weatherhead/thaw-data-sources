// data-source-iqair/examples/cli.js

/* eslint-disable @typescript-eslint/no-var-requires */
const httpClient = require('thaw-http-json-client-node').createHttpClient();
const { createIQAirScraper } = require('..');

const dataSourceClient = createIQAirScraper(httpClient);

function main(timeout = 0) {
	dataSourceClient.getData().subscribe(
		(result) => {
			// console.log('result:', result);
			// console.log('result.CITY_STATIONS:', result.CITY_STATIONS);
			// console.log('result.CITY_STATIONS.length:', result.CITY_STATIONS.length);

			// const cityStations = result.CITY_STATIONS;

			// cityStations.sort((a, b) => a.aqi - b.aqi); // Sort by increasing AQI

			// console.log('cityStations');
			// console.log(cityStations);

			// result.CITY_STATIONS[n] === e.g.:

			// {
			// 	id: '894ab47c2f44cc2aee76',
			// 	name: 'Calgary Varsity',
			// 	url: '/canada/alberta/calgary/calgary-varsity',
			// 	aqiLevel: 'unhealthyForSensitiveGroup',
			// 	aqi: 155
			// },

			const currentData = result.CITY_DATA.current;
			const timestamp = new Date(Date.parse(currentData.ts));
			const aqi = currentData.aqi;

			if (
				typeof aqi !== 'number' ||
				Number.isNaN(aqi) ||
				aqi < 0 ||
				aqi !== Math.round(aqi)
			) {
				throw new Error(`AQI '${aqi}' is not a non-negative integer.`);
			}

			let colour; // : string;
			let colourInterpretation; // : string;

			// AQI (US) :

			if (aqi <= 50) {
				colour = 'green'; // Good
				colourInterpretation = 'Good';
			} else if (aqi <= 100) {
				colour = 'yellow'; // Moderate
				colourInterpretation = 'Moderate';
			} else if (aqi <= 150) {
				colour = 'orange'; // Unhealthy for sensitive groups
				colourInterpretation = 'Unhealthy for sensitive groups';
			} else if (aqi <= 200) {
				colour = 'red'; // Unhealthy
				colourInterpretation = 'Unhealthy';
			} else if (aqi <= 300) {
				colour = 'purple'; // Very unhealthy
				colourInterpretation = 'Very unhealthy';
			} else if (aqi <= 500) {
				colour = 'maroon'; // Hazardous
				colourInterpretation = 'Hazardous';
			} else {
				colour = 'black'; // Oh shit.
				colourInterpretation = "Oh shit. We're dead.";
			}

			// console.log('result.CITY_DATA.current:', currentData);
			console.log(`Calgary at ${timestamp} :`);
			console.log(`AQI: ${currentData.aqi} : ${colour} : ${colourInterpretation}`);
			console.log(`Conditio: ${currentData.condition}`);
			console.log(`Temperature: ${currentData.temperature} C`);
			console.log(`Humidity: ${currentData.humidity} %`);
		},
		(error) => {
			console.error('error:', typeof error, error);
		},
		() => {
			if (!Number.isNaN(timeout) && timeout > 0) {
				setTimeout(() => main(timeout), timeout);
			} else {
				console.log('\nDone.');
			}
		}
	);
}

main();
// main(300000); // 5 minutes
