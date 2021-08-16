// thaw-data-sources/src/web-page-scrapers/iqair.ts

import { from } from 'rxjs';

import { IDataSource, IHttpClient } from 'thaw-types';

async function getData(httpClient: IHttpClient): Promise<string> {
	let responseBodyAsString: string;
	const url = 'https://www.iqair.com/ca/canada/alberta/calgary';

	try {
		responseBodyAsString = await httpClient
			// .get<string>(url, { responseType: 'text' as 'json' })
			.get(url)
			.toPromise();
	} catch (error) {
		console.error('httpClient.get() error:', typeof error, error);

		throw error;
	}

	const regex1 =
		/<script id="airvisual-web-state" type="application\/json">([^<]+)<\/script>/;
	const matches1 = responseBodyAsString.match(regex1);

	if (!matches1 || !matches1[1]) {
		console.error('IQAir: Fsck. No regex1 match.');

		throw new Error('IQAir: Fsck. No regex1 match.');
	}

	// console.log(matches1[1]);

	// - Replace &a; with & (?)
	// - Replace &g; with > (?)
	// - Replace &l; with < (?)
	// - Replace &q; with " (?)
	// - Replace &s; with ; (?)
	// - Then JSON.parse()

	// console.log('Success!');

	const result = JSON.parse(
		matches1[1]
			.replaceAll('&g;', '>')
			.replaceAll('&l;', '<')
			.replaceAll('&q;', '"')
			.replaceAll('&a;', '&')
			.replaceAll('&s;', ';')
	);

	return Promise.resolve(result);
}

export function createIQAirScraper(httpClient: IHttpClient): IDataSource<unknown, string> {
	return {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getData: (options?: unknown) => from(getData(httpClient))
	};
}
