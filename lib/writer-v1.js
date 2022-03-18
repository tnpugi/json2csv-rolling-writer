/**
 * writer-v1.js: This is a convenience tool to write a rolling jsonline file/stream to a partial csv file (with headers or columns in a separate file).
 *
 * (C) 2022 Tan Lonceras
 * MIT LICENCE
 */

 'use strict';

 const fs = require('fs');

class Json2CsvRollingWriter {
  #keysIdx;
  #dir;
  #fileName;
  #fileExtension;
  #charWhenBlank
  #charSeparator;
  #newLineIfBlank;
  #newLineIfInvalid;

  constructor(opts) {
    opts = opts || {};
    this.#keysIdx = {};
    this.#dir = opts.dir || './_tmp';
    this.#fileName = opts.fileName || '_tmp';
    this.#fileExtension = opts.fileExtension || 'csv';
    this.#charWhenBlank = opts.charWhenBlank || '';
    this.#charSeparator = opts.charSeparator || ',';
    this.#newLineIfBlank = opts.hasOwnProperty('newLineIfBlank') ? opts.newLineIfBlank  : true;
    this.#newLineIfInvalid = opts.hasOwnProperty('newLineIfInvalid') ? opts.newLineIfInvalid  : true;
  }

  get dataFilePath() {
    return `${this.#dir}/${this.#fileName}.${this.#fileExtension}`;
  }

  get columnsFilePath() {
    return `${this.#dir}/${this.#fileName}-cols.${this.#fileExtension}`;
  }

  async rollingWrite(json) {
   const jsonline = await this.#sanitizeJson(json);
   await this.#autoCreateDir();
       
   const keysIdx = this.#keysIdx;
   const jsonEntries = {};
   Object.entries(jsonline).forEach((entry) => {
     const [k, v] = entry;
     if (!keysIdx.hasOwnProperty(k)) {
       keysIdx[k] = -1;
       keysIdx[k] = Object.keys(keysIdx).length - 1;
     }
     jsonEntries[k] = v;
   });
   const keysLength = Object.keys(keysIdx).length;
   fs.appendFileSync(
     this.dataFilePath, 
     this.#lineToCsv(
       keysLength,
       Object.entries(jsonEntries), 
       (vals, k, v) =>  vals[keysIdx[k]] = v
     ),
   );
   fs.writeFileSync(
     this.columnsFilePath, 
     this.#lineToCsv(
       keysLength,
       Object.entries(keysIdx),
       (vals, k, v) => vals[v] = k
     )
   );
  };

  async finalizeFile() {
    //TODO: merge data file + cols file for the final write.
  }

  async #sanitizeJson(json) {
    if (!json && this.#newLineIfBlank) {
      return {};
    }
    if (json) {
      if (typeof json === 'object') {
        return json;
      } else if (this.#newLineIfInvalid) {
        return {};
      }
    }

    throw new Error('Invalid input!');
  };

  async #autoCreateDir() {
    if (!fs.existsSync(this.#dir)) {
      fs.mkdirSync(this.#dir, { recursive: true});
    }
  };

  #lineToCsv (
    length, 
    entries, 
    reduceFn) {
    const vals = new Array(length).fill(this.#charWhenBlank);
    entries.forEach((entry) => {
      const [k, v] = entry;
      reduceFn(vals, k, v);
    });
    const data = vals.reduce((all, val) => `${all}${this.#charSeparator}${val}`);
    return `${data}\n`;
  };
}

module.exports = {
  Json2CsvRollingWriter,
};
 