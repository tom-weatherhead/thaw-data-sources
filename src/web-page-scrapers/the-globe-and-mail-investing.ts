// thaw-data-sources/src/web-page-scrapers/the-globe-and-mail-investing.ts

import { from } from 'rxjs';

import { IDataSource, IHttpClient } from 'thaw-types';

export interface ITheGlobeAndMailInvestingScraperOptions {
	fundCode: string;
}

export interface ITheGlobeAndMailInvestingScraperResultType {
	symbol: string;
	symbolName: string;
	lastPrice: string;
	priceChange: string;
	percentChange: string;
	raw: {
		lastPrice: number;
		priceChange: number;
	};
}

async function getPriceFromTheGlobeAndMail(
	httpClient: IHttpClient,
	fundCode: string
): Promise<ITheGlobeAndMailInvestingScraperResultType | undefined> {
	const url = `https://www.theglobeandmail.com/investing/markets/funds/${fundCode}.CF/`;
	let responseBodyAsString: string;

	try {
		responseBodyAsString = await httpClient
			// .get<string>(url, { responseType: 'text' as 'json' })
			.get(url)
			.toPromise();
	} catch (error) {
		console.error('httpClient.get() error:', typeof error, error);

		return undefined;
	}

	// <barchart-field binding="false" symbol="BMO70219.CF" type="price" name="lastPrice" value="18.3569"></barchart-field>

	// <a is="barchart-alert" class="" quote='{"symbol":"BMO70219.CF","symbolName":"BMO U.S. Dividend Fund Series A - NL","exchange":"CADFUNDS","lastPrice":"18.3569","priceChange":"+0.1130","percentChange":"+0.62%","volume":"N\/A","tradeTime":"07\/23\/21","hasBats":"No","mode":"I","symbolCurrency":"CAD","symbolType":15,"raw":{"symbol":"BMO70219.CF","symbolName":"BMO U.S. Dividend Fund Series A - NL","exchange":"CADFUNDS","lastPrice":18.3569,"priceChange":0.113,"percentChange":0.0061938510954346,"volume":null,"tradeTime":1627016400,"hasBats":false,"mode":"I","symbolCurrency":"CAD","symbolType":15}}'><span class="hidden-xs">Add </span>Alerts<i class="bc-action-add"></i></a>

	const regex1 = /<a is="barchart-alert" ([^>]*)>/;
	const matches1 = responseBodyAsString.match(regex1);

	if (!matches1 || !matches1[1]) {
		console.error('Globe: Fsck. No regex1 match.');

		return undefined;
	}

	// console.log('Globe: matches1[1] is:', matches1[1]);
	// console.log('Globe: matches1[1].length is:', matches1[1].length);

	const regex2 = /quote='([^']*)'/;
	const matches2 = matches1[1].match(regex2);

	if (!matches2 || !matches2[1]) {
		console.error('Globe: Fsck. No regex2 match.');

		return undefined;
	}

	// console.log('Globe: matches2[1] is:', matches2[1]);
	// console.log('Globe: matches2[1].length is:', matches2[1].length);

	let data: ITheGlobeAndMailInvestingScraperResultType;

	try {
		data = JSON.parse(matches2[1]) as ITheGlobeAndMailInvestingScraperResultType;
	} catch (error) {
		console.error('Globe: Fsck. JSON.parse() failed.');
		console.error(error);

		return undefined;
	}

	// console.log('Globe: data is:', data);
	// console.log('Globe: lastPrice is:', data.raw.lastPrice);

	return data;
}

export function createTheGlobeAndMailInvestingScraper(
	httpClient: IHttpClient
): IDataSource<
	ITheGlobeAndMailInvestingScraperOptions,
	ITheGlobeAndMailInvestingScraperResultType | undefined
> {
	return {
		getData: (options?: ITheGlobeAndMailInvestingScraperOptions) => {
			if (typeof options === 'undefined' || !options.fundCode) {
				throw new Error('createTheGlobeAndMailScraper() : Options error');
			}

			return from(getPriceFromTheGlobeAndMail(httpClient, options.fundCode));
		}
	};
}
