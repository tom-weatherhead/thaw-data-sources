// f-you-money-widget/src/app/web-page-scrapers/yahoo-finance.ts

import { from } from 'rxjs';

import { IDataSource, IHttpClient } from 'thaw-types';

export interface IYahooFinanceScraperOptions {
	symbol: string;
}

export interface IYahooFinanceScraperFormattedValueType {
	readonly raw: number;
	readonly fmt: string;
}

export interface IYahooFinanceScraperFormattedStringType {
	readonly raw: string;
	readonly fmt: string;
}

export interface IYahooFinanceScraperExtendedFormattedValueType
	extends IYahooFinanceScraperFormattedValueType {
	readonly longFmt: string;
}

// This schema works for the ETF VFV.TO :

export interface IYahooFinanceScraperPriceType {
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
	readonly priceHint: IYahooFinanceScraperExtendedFormattedValueType;
	readonly currency: string;
	readonly currencySymbol: string;
	// averageDailyVolume3Month: ;
	// averageDailyVolume10Day: ;

	readonly regularMarketSource: string;
	readonly regularMarketTime: number;

	readonly regularMarketPrice: IYahooFinanceScraperFormattedValueType;
	readonly regularMarketPreviousClose: IYahooFinanceScraperFormattedValueType;
	readonly regularMarketOpen: IYahooFinanceScraperFormattedValueType;
	readonly regularMarketDailyHigh: IYahooFinanceScraperFormattedValueType;
	readonly regularMarketDailyLow: IYahooFinanceScraperFormattedValueType;
	readonly regularMarketChange: IYahooFinanceScraperFormattedValueType;
	readonly regularMarketChangePercent: IYahooFinanceScraperFormattedValueType;
	readonly regularMarketVolume: IYahooFinanceScraperExtendedFormattedValueType;
}

export interface IYahooFinanceScraperSummaryDetailType {
	readonly fiftyTwoWeekHigh: IYahooFinanceScraperFormattedValueType;
	readonly fiftyTwoWeekLow: IYahooFinanceScraperFormattedValueType;
	readonly fiftyTwoWeekRange: IYahooFinanceScraperFormattedStringType;
}

export interface IYahooFinanceScraperResultType {
	readonly price: IYahooFinanceScraperPriceType;
	readonly summaryDetail: IYahooFinanceScraperSummaryDetailType;
}

interface IYahooFinanceScraperInternalResultType {
	context: {
		dispatcher?: {
			stores: {
				readonly QuoteSummaryStore: IYahooFinanceScraperResultType;
				// QuoteSummaryStore: {
				// 	readonly price: IYahooFinanceScraperPriceType;
				// 	readonly summaryDetail: IYahooFinanceScraperSummaryDetailType;
				// };
			};
		};
	};
}

async function getDetailsFromYahooFinance(
	httpClient: IHttpClient,
	symbol: string
): Promise<IYahooFinanceScraperResultType | undefined> {
	const url = `https://finance.yahoo.com/quote/${symbol}?p=${symbol}`;
	// const headers = new HttpHeaders().set('Accept', 'text/html').set('content-type', 'text/html');
	// .set('Access-Control-Allow-Origin', '*');
	let responseBodyAsString: string;

	// responseType: 'text'
	try {
		responseBodyAsString = await httpClient.get(url).toPromise();
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

	let data: IYahooFinanceScraperInternalResultType;

	try {
		data = JSON.parse(matches[1]) as IYahooFinanceScraperInternalResultType;
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

	// const price = data.context.dispatcher.stores.QuoteSummaryStore.price;

	// console.log('getPriceFromYahooFinance() price:', price);
	console.log(
		'getPriceFromYahooFinance() data.context.dispatcher.stores.QuoteSummaryStore.summaryDetail:',
		data.context.dispatcher.stores.QuoteSummaryStore.summaryDetail
	);

	// E.g. getPriceFromYahooFinance() data.context.dispatcher.stores.QuoteSummaryStore.summaryDetail: {
	//   previousClose: { raw: 4536.95, fmt: '4,536.95' },
	//   regularMarketOpen: { raw: 4532.42, fmt: '4,532.42' },
	//   twoHundredDayAverage: { raw: 4200.5005, fmt: '4,200.50' },
	//   trailingAnnualDividendYield: {},
	//   payoutRatio: {},
	//   volume24Hr: {},
	//   regularMarketDayHigh: { raw: 4541.45, fmt: '4,541.45' },
	//   navPrice: {},
	//   averageDailyVolume10Day: { raw: 2853090000, fmt: '2.85B', longFmt: '2,853,090,000' },
	//   totalAssets: {},
	//   regularMarketPreviousClose: { raw: 4536.95, fmt: '4,536.95' },
	//   fiftyDayAverage: { raw: 4438.1504, fmt: '4,438.15' },
	//   trailingAnnualDividendRate: {},
	//   open: { raw: 4532.42, fmt: '4,532.42' },
	//   toCurrency: null,
	//   averageVolume10days: { raw: 2853090000, fmt: '2.85B', longFmt: '2,853,090,000' },
	//   expireDate: {},
	//   yield: {},
	//   algorithm: null,
	//   dividendRate: {},
	//   exDividendDate: {},
	//   beta: {},
	//   circulatingSupply: {},
	//   startDate: {},
	//   regularMarketDayLow: { raw: 4521.3, fmt: '4,521.30' },
	//   priceHint: { raw: 2, fmt: '2', longFmt: '2' },
	//   currency: 'USD',
	//   regularMarketVolume: { raw: 1533435000, fmt: '1.53B', longFmt: '1,533,435,000' },
	//   lastMarket: null,
	//   maxSupply: {},
	//   openInterest: {},
	//   marketCap: {},
	//   volumeAllCurrencies: {},
	//   strikePrice: {},
	//   averageVolume: { raw: 3234025937, fmt: '3.23B', longFmt: '3,234,025,937' },
	//   priceToSalesTrailing12Months: {},
	//   dayLow: { raw: 4521.3, fmt: '4,521.30' },
	//   ask: { raw: 4572.31, fmt: '4,572.31' },
	//   ytdReturn: {},
	//   askSize: { raw: 0, fmt: null, longFmt: '0' },
	//   volume: { raw: 1533435000, fmt: '1.53B', longFmt: '1,533,435,000' },
	//   fiftyTwoWeekHigh: { raw: 4545.85, fmt: '4,545.85' },
	//   forwardPE: {},
	//   maxAge: 1,
	//   fromCurrency: null,
	//   fiveYearAvgDividendYield: {},
	//   fiftyTwoWeekLow: { raw: 3209.45, fmt: '3,209.45' },
	//   bid: { raw: 4490.16, fmt: '4,490.16' },
	//   tradeable: false,
	//   dividendYield: {},
	//   bidSize: { raw: 0, fmt: null, longFmt: '0' },
	//   dayHigh: { raw: 4541.45, fmt: '4,541.45' }
	// }

	// return price;

	return data.context.dispatcher.stores.QuoteSummaryStore;
}

async function getPriceFromYahooFinance(
	httpClient: IHttpClient,
	symbol: string
): Promise<IYahooFinanceScraperPriceType | undefined> {
	const details = await getDetailsFromYahooFinance(httpClient, symbol);

	if (typeof details === 'undefined') {
		return undefined;
	}

	return details.price;
}

export function createYahooFinanceDetailsScraper(
	httpClient: IHttpClient
): IDataSource<IYahooFinanceScraperOptions, IYahooFinanceScraperResultType | undefined> {
	return {
		getData: (options?: IYahooFinanceScraperOptions) => {
			if (typeof options === 'undefined' || !options.symbol) {
				throw new Error('createYahooFinanceScraper() : Options error');
			}

			return from(getDetailsFromYahooFinance(httpClient, options.symbol));
		}
	};
}

export function createYahooFinanceScraper(
	httpClient: IHttpClient
): IDataSource<IYahooFinanceScraperOptions, IYahooFinanceScraperPriceType | undefined> {
	return {
		getData: (options?: IYahooFinanceScraperOptions) => {
			if (typeof options === 'undefined' || !options.symbol) {
				throw new Error('createYahooFinanceScraper() : Options error');
			}

			return from(getPriceFromYahooFinance(httpClient, options.symbol));
		}
	};
}
