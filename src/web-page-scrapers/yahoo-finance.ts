// f-you-money-widget/src/app/web-page-scrapers/yahoo-finance.ts

// , HttpHeaders
// import { HttpClient } from '@angular/common/http';

import { from } from 'rxjs';

import { IDataSource, IHttpClient } from 'thaw-types';

export interface IYahooFinanceScraperOptions {
	symbol: string;
}

export interface IYahooFinanceFormattedValueType {
	readonly raw: number;
	readonly fmt: string;
}

export interface IYahooFinanceExtendedFormattedValueType
	extends IYahooFinanceFormattedValueType {
	readonly longFmt: string;
}

// This schema works for the ETF VFV.TO :

export interface IYahooFinancePriceType {
	readonly symbol: string;
	readonly shortName: string;
	readonly longName: string;
	readonly exchange: string;
	readonly exchangeName: string;
	// fullExchangeName: string;
	// exchangeTimezoneName: string;
	// exchangeTimezoneShortName: string;
	// gmtOffSetMilliseconds: number;
	readonly exchangeDataDelayedBy: string;
	// sourceInterval: number;
	// market: string;
	readonly marketState: string;
	// region: string;
	// language: string;
	readonly quoteType: string;
	readonly priceHint: IYahooFinanceExtendedFormattedValueType;
	readonly currency: string;
	readonly currencySymbol: string;
	// averageDailyVolume3Month: ;
	// averageDailyVolume10Day: ;

	readonly regularMarketSource: string;
	readonly regularMarketTime: number;

	readonly regularMarketPrice: IYahooFinanceFormattedValueType;
	readonly regularMarketPreviousClose: IYahooFinanceFormattedValueType;
	readonly regularMarketOpen: IYahooFinanceFormattedValueType;
	readonly regularMarketDailyHigh: IYahooFinanceFormattedValueType;
	readonly regularMarketDailyLow: IYahooFinanceFormattedValueType;
	readonly regularMarketChange: IYahooFinanceFormattedValueType;
	readonly regularMarketChangePercent: IYahooFinanceFormattedValueType;
	readonly regularMarketVolume: IYahooFinanceExtendedFormattedValueType;
}

interface IYahooFinanceScraperResultType {
	context: {
		dispatcher?: {
			stores: {
				QuoteSummaryStore: {
					readonly price: IYahooFinancePriceType;
				};
			};
		};
	};
}

async function getPriceFromYahooFinance(
	httpClient: IHttpClient,
	symbol: string
): Promise<IYahooFinancePriceType | undefined> {
	const url = `https://finance.yahoo.com/quote/${symbol}?p=${symbol}`;
	// const headers = new HttpHeaders().set('Accept', 'text/html').set('content-type', 'text/html');
	// .set('Access-Control-Allow-Origin', '*');
	let responseBodyAsString: string;

	// responseType: 'text'
	try {
		responseBodyAsString = await httpClient
			// .get<string>(url, { responseType: 'text' as 'json' })
			.get(url)
			.toPromise();
	} catch (error) {
		console.error('httpClient.get() error:', typeof error, error);

		return undefined;
	}

	const regex = /root\.App\.main = (.*);/;
	const matches = responseBodyAsString.match(regex);

	if (!matches || !matches[1]) {
		console.error('Fsck. No regex match.');

		return undefined;
	}

	let data: IYahooFinanceScraperResultType;

	try {
		data = JSON.parse(matches[1]) as IYahooFinanceScraperResultType;
	} catch (error) {
		console.error('Fsck. JSON.parse() failed.');
		console.error(error);

		return undefined;
	}

	if (typeof data.context === 'undefined') {
		// 2021-07-21 : Requests work intermittently; sometimes data.context is undefined.
		console.error('Fsck. data.context is undefined.');

		return undefined;
	} else if (typeof data.context.dispatcher === 'undefined') {
		console.error('Fsck. data.context.dispatcher is undefined.');

		return undefined;
	}

	const price = data.context.dispatcher.stores.QuoteSummaryStore.price;

	// console.log('getPriceFromYahooFinance() price:', price);

	return price;
}

export function createYahooFinanceScraper(
	httpClient: IHttpClient
): IDataSource<IYahooFinanceScraperOptions, IYahooFinancePriceType | undefined> {
	return {
		getData: (options?: IYahooFinanceScraperOptions) => {
			if (typeof options === 'undefined' || !options.symbol) {
				throw new Error('createYahooFinanceScraper() : Options error');
			}

			return from(getPriceFromYahooFinance(httpClient, options.symbol));
		}
	};
}
