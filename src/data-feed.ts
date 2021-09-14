// thaw-data-sources/src/data-feed.ts

import { Observable, Subscriber } from 'rxjs';

import { IDataSource } from 'thaw-types';

export type IDataFeed<U> = Observable<U>;

// export interface IDataFeedOptions<T, U> {
// 	readonly fnGenerateNextState?: (previousState: T, previousResult: U) => T;
// 	readonly initialState?: T;
// 	readonly maxNumIterations?: number;
// }

// TODO? : Also pass in:
// - fnGenerateNextState: (previousState: T, previousResult: U) => T
// - initialState: T | undefined
// (The 'state data' is basically the options param that is passed to the data source)

export function createDataFeedFromDataSource<T, U>(
	dataSource: IDataSource<T, U | undefined>,
	msDelay: number /*, options: IDataFeedOptions<T, U> = {} */
): IDataFeed<U> {
	const fn = (
		subscriber: Subscriber<U> // ,
		// stateData?: T
	) => {
		// Observer<>/Subscriber<> has methods: closed?(), complete(), error(), next().

		if (subscriber.closed) {
			subscriber.complete();

			return;
		}

		dataSource
			.getData(/* stateData */)
			.toPromise()
			.then((result: U | undefined) => {
				// if (typeof result !== 'undefined') {
				subscriber.next(result);

				// if (typeof fnGenerateNextState !== 'undefined') {
				// 	stateData = fnGenerateNextState(stateData, result);
				// }
				// } else {
				if (typeof result === 'undefined') {
					console.log('Data feed warning: dataSource.getData() returned undefined');
				}
			})
			.catch((error: unknown) => {
				console.error('Data feed error:', typeof error, error);
			})
			.finally(() => {
				setTimeout(() => fn(subscriber /*, prevDatetimeValue */), msDelay);
			});

		// this.getSpotPrice(symbol).subscribe((spotPrice: ISpotPrice) => {
		// 	const currentDatetimeValue = spotPrice.datetime.valueOf();
		//
		// 	if (currentDatetimeValue > prevDatetimeValue) {
		// 		prevDatetimeValue = currentDatetimeValue;
		// 		subscriber.next(spotPrice);
		// 	} else {
		// 		const now = getDateTimeUTCString(new Date());
		//
		// 		console.log(
		// 			now,
		// 			': Ignoring the spot price because of its datetime:',
		// 			getDateTimeUTCString(spotPrice.datetime)
		// 		);
		// 	}
		//
		// 	setTimeout(
		// 		() => fn(subscriber, prevDatetimeValue),
		// 		msDelay
		// 		// Math.max(
		// 		// 	msDelay - spotPrice.responseMetadata.latencyMs,
		// 		// 	50
		// 		// )
		// 	);
		// });
	};

	return new Observable((subscriber: Subscriber<U>) => fn(subscriber /*, initialState */));
}
