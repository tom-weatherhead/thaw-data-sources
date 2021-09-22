// thaw-data-sources/src/data-feed.ts

import { Observable, Subscriber } from 'rxjs';

import { IDataFeed, IDataSource } from 'thaw-types';

// TODO? : Also pass in:
// - fnGenerateNextState: (previousState: T, previousResult: U) => T
// - initialState: T | undefined
// (The 'state data' is basically the options param that is passed to the data source)

export function createDataFeedFromDataSource<T, U>(
	dataSource: IDataSource<T, U | undefined>,
	msDelay: number /*, options: IDataFeedOptions<T, U> = {} */
): IDataFeed<U> {
	// let numIterationsRemaining = ifDefinedThenElse(options.maxNumIterations, 0);

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

				// if (typeof options.fnGenerateNextState !== 'undefined') {
				// 	stateData = options.fnGenerateNextState(stateData, result);
				// }
				// } else {
				if (typeof result === 'undefined') {
					console.log('Data feed warning: dataSource.getData() returned undefined');
				}
			})
			.catch((error: unknown) => {
				console.error('Data feed error:', typeof error, error);
				// subscriber.error(error);
			})
			.finally(() => {
				// if (Number.isNaN(numIterationsRemaining) || numIterationsRemaining === 0 || --numIterationsRemaining > 0) {
				setTimeout(() => fn(subscriber /*, stateData */), msDelay);
				// } else {
				// console.log('The data feed has completed.');
				// subscriber.complete();
				// }
			});
	};

	return new Observable((subscriber: Subscriber<U>) =>
		fn(subscriber /*, options.initialState */)
	);
}
