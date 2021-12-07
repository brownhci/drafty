export const tableName = 'SuggestionType';

export const name = 'name';

// @TODO auto-update suggestion type lower bound and upper bound
export const idSuggestionTypeLowerBound = 1;
export const idSuggestionTypeUpperBound = 14;

// @TODO @zhengyi these should always be pulled based on the DB (profs/ajobs/etc...
export const names = new Set();
names.add('FullName');
names.add('University');
names.add('Bachelors');
names.add('Masters');
names.add('Doctorate');
names.add('PostDoc');
names.add('JoinYear');
names.add('Rank');
names.add('SubField');
names.add('Gender');
names.add('PhotoURL');
names.add('Sources');
names.add('Last_Updated_By');
names.add('Last_Updated');
