# json2csv-rolling-writer
This is a convenience tool to write a rolling jsonline file/stream to a partial csv file (with headers or columns in a separate file).

# How to use:
```
const jsonLines = [
  { "field1": "val1", "field2": "val2" },
  { "field1": "val1", "field2": "val2", "field3": "val3" },
  { "fieldX": "valX" },
  {},
  'NOT_VALID_JSON'
];

const opts = {
  dir: 'tmp',
  fileName: 'tmpfile',
  fileExtension: 'csv',
  charWhenBlank: '_',
  charSeparator: ',',
  newLineIfBlank: true,
  newLineIfInvalid: true
}
const csvRollingWriter = new Json2CsvRollingWriter({...opts});
jsonLines.forEach((line) => {
  csvRollingWriter.rollingWrite(line);
});
```

The write will create 2 files
```
FOR DATA - tmp/tmpfile.csv
FOR COLUMNS - tmp/tmpfile-cols.csv
```
