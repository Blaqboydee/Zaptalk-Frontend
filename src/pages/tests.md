IMPORTANT INSTRUCTIONS:

Reply with only the complete source code file and nothing else (no explanation, no commentary, no extra text).

Put the complete source in a single fenced code block labeled typescript, for example:

// code here

Do not output multiple files, file lists, or archives.

Do not output any text before or after the single code block.

Use only ASCII characters.

Use Node v22.18 standard library only. Do not import external packages.

Cohort Event Analytics for Health Research

Context and Purpose
You are building an analytics engine for health researchers and policy makers. The engine measures event incidence and short-term trends in a patient cohort. The engine will receive patient records and must support queries that produce the same results every time. All rules must be followed exactly. Outputs must be stable, and rounding rules must be consistent.

You will write a class that validates input data, performs date arithmetic, handles age boundaries, detects duplicate patients, caches results, and invalidates the cache when the dataset changes.

Input Data Model
You will work with these shapes:

interface MedicalEvent {
date: string; // YYYY-MM-DD
code: string; // non-empty event code
value: number | null; // may be null
}

interface PatientRecord {
id: string; // non-empty unique identifier
dob: string; // date of birth, YYYY-MM-DD
sex: 'M' | 'F' | 'O';
events: MedicalEvent[]; // may be empty but must be an array
}

What to Implement and Export
Provide a single typescript file;

const ERR_INVALID_DATE = 'ERR_INVALID_DATE'
const ERR_RECORD_MISSING_FIELD = 'ERR_RECORD_MISSING_FIELD'
const ERR_EMPTY_RECORDSET = 'ERR_EMPTY_RECORDSET'

class DataAnalyzer {
constructor(records)
loadRecords(records)
addRecord(record)
detectDuplicateIds()
computeIncidence(params) // see params below
movingAverage7Days(params) // see params below
}

Method signatures and return shapes

computeIncidence(params: {
eventCode: string;
startDate: string; // YYYY-MM-DD
endDate: string; // YYYY-MM-DD
minAgeInclusive: number;
maxAgeInclusive: number;
}) => { cases: number; personYears: number; ratePer1000: number }

movingAverage7Days(params: {
eventCode: string;
startDate: string; // YYYY-MM-DD
endDate: string; // YYYY-MM-DD
}) => { date: string; average: number }[] // one entry per date in range inclusive

Validation and Error Rules

Dates must be in YYYY-MM-DD format and valid. Invalid dates must throw ERR_INVALID_DATE.

ERR_RECORD_MISSING_FIELD must be thrown for missing or empty required PatientRecord fields: id, dob, sex, events.

The ERR_RECORD_MISSING_FIELD error must also be thrown for:

sex field containing a value other than 'M', 'F', or 'O'.

A MedicalEvent object missing its date field.

A MedicalEvent object missing its code field.

A MedicalEvent object having an empty string for its code field.

events not being an array.

MedicalEvent validation (explicit):

date: must be present and a valid YYYY-MM-DD date. If missing -> ERR_RECORD_MISSING_FIELD. If present but invalid -> ERR_INVALID_DATE.

code: must be present and a non-empty string. Missing or empty -> ERR_RECORD_MISSING_FIELD.

value: may be a number or null. No extra validation beyond type checking.

All validation happens immediately when calling loadRecords or addRecord. These operations are atomic: if any record in loadRecords or addRecord is invalid, abort and leave internal state unchanged.

Calling computeIncidence or movingAverage7Days when no records are loaded must throw ERR_EMPTY_RECORDSET.

Query parameter validation: in computeIncidence and movingAverage7Days, if startDate is after endDate, throw ERR_INVALID_DATE.

Definitions and Rules

Date comparisons are inclusive.

When computing completed years for age comparisons, treat February 29 birthdays as occurring on February 28 in non-leap years. Example: born 2000-02-29 is considered to complete 25 years on 2025-02-28.

Age is measured in completed years.

A person is a case if they have at least one matching event (event.code === eventCode) within [startDate, endDate] and their age on that event date is within [minAgeInclusive, maxAgeInclusive]. Count each person at most once.

Person-time (personYears):

For each person, compute the overlap between:

query window [startDate, endDate], and

days when the person is within the specified age range (inclusive).

Convert days to years by dividing by 365.25, sum across persons.

Round personYears to 3 decimal places using half-up rounding before using it to calculate rates.

Rate per 1000:

Use the rounded personYears in the rate calculation.

If personYears is zero, ratePer1000 = 0.

Otherwise ratePer1000 = (cases / personYears) * 1000 rounded to 6 decimal places using half-up rounding.

Moving Average 7 Days:

For each date D in [startDate, endDate], count events with event.date === D and event.code === eventCode.

The 7-day moving average for D is the average of counts for days D-3 through D+3, including only days that lie within [startDate, endDate].

Round averages to 3 decimal places using half-up rounding.

Caching Rules

Cache computeIncidence results keyed by all query parameters. Clear the cache whenever loadRecords or addRecord modifies the dataset.

detectDuplicateIds returns a sorted array alphabetically and does not require caching.

Edge Cases and Transactional Behavior

Events on startDate or endDate are included.

A person who turns the minimum age on a date starts contributing from that day.

Leap year birthdays on Feb 29 are treated as Feb 28 in non-leap years.

Duplicate IDs must be detected and returned alphabetically.

loadRecords and addRecord are atomic: invalid input aborts operation and leaves internal data unchanged.

Rounding and Number Formats

Round to specified decimals using half-up rounding.

All numbers returned must be numbers, not strings.

Constraints

Use only Node v22.18 standard library.

No external packages.

Begin the file with these exported constants and a class template (replace the implementation comments with a working implementation):

const ERR_INVALID_DATE = 'ERR_INVALID_DATE';
const ERR_RECORD_MISSING_FIELD = 'ERR_RECORD_MISSING_FIELD';
const ERR_EMPTY_RECORDSET = 'ERR_EMPTY_RECORDSET';

class DataAnalyzer {
constructor(records) { /* implement / }
loadRecords(records) { / implement / }
addRecord(record) { / implement / }
detectDuplicateIds() { / implement / }
computeIncidence(params) { / implement / }
movingAverage7Days(params) { / implement */ }
}

module.exports = { ERR_INVALID_DATE, ERR_RECORD_MISSING_FIELD, ERR_EMPTY_RECORDSET, DataAnalyzer }