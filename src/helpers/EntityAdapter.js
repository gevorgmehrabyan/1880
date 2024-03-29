import { toInteger, toNumber, isArray, cloneDeep } from "lodash";
import Formatter from "./Formatter";

export default class EntityAdapter {
  RULES = {
    noCondition: "noCondition",
    id: "id",
    number: "number",
    positiveNumber: "positiveNumber",
    intOrNull: "intOrNull",
    string: "string",
    bool: "bool",
    date: "date",
    time: "time",
    dateTime: "dateTime",
    fullDate: "fullDate",
    arrayID: "arrayID",
    arrayNumber: "arrayNumber",
    arrayDate: "arrayDate",
    arrayString: "arrayString",
    arrayObject: "arrayObject",
    token: "token"
  };

  fields = [];
  values = [];
  excludes = [];

  getRules() {
    return cloneDeep(this.RULES);
  }

  addValue(paramsName, value) {
    this.values.push({
      paramsName,
      value
    });
  }

  addField(rule, objectName, paramsName = null) {
    this.fields.push({
      rule,
      objectName,
      paramsName: paramsName || objectName,
    });
  }


  addExcludeField(fieldName) {
    this.excludes.push(fieldName);
  }

  adapt(rawObject) {
    const result = this.processData(rawObject, "paramsName", "objectName");
    return result;
  }

  adaptList(rawList) {
    if (!isArray(rawList)) {
      return [];
    }

    const resultList = rawList.map(rawObject => {
      return this.adapt(rawObject);
    });

    return resultList;
  }

  prepare(rawObject) {
    const result = this.processData(rawObject, "objectName", "paramsName");
    return result;
  }

  prepareList(rawList) {
    if (!isArray(rawList)) {
      return [];
    }

    const resultList = rawList.map(rawObject => {
      return this.prepare(rawObject);
    });

    return resultList;
  }

  processData(rawObject, sourceName, targetName) {
    const result = {};

    this.values.forEach(item => {
      const fieldName = item[targetName];
      result[fieldName] = item.value;
    });

    this.fields.forEach(field => {
      const rule = field.rule;
      const fieldName = field[targetName];
      const valueName = field[sourceName];
      const value = rawObject[valueName];

      if (this.excludes.includes(valueName)) {
        return;
      }

      switch (rule) {
        case this.RULES.id:
          result[fieldName] = toInteger(value);
          break;

        case this.RULES.number:
          result[fieldName] = toNumber(value) || 0;
          break;

        case this.RULES.positiveNumber:
          result[fieldName] = Math.max(0, toNumber(value) || 0);
          break;

        case this.RULES.intOrNull:
          result[fieldName] = toInteger(value) > 0 ? toInteger(value) : null;
          break;

        case this.RULES.string:
          result[fieldName] = Boolean(value) ? String(value) : "";
          break;

        case this.RULES.bool:
          result[fieldName] = Boolean(value);
          break;

        case this.RULES.date:
          result[fieldName] = Formatter.date(value);
          break;

        case this.RULES.time:
          result[fieldName] = Formatter.time(value);
          break;

        case this.RULES.dateTime:
          result[fieldName] = Formatter.dateTime(value);
          break;

        case this.RULES.fullDate:
          result[fieldName] = Formatter.fullDateTime(value);
          break;

        case this.RULES.arrayID:
          result[fieldName] = this.getArrayID(value);
          break;

        case this.RULES.arrayNumber:
          result[fieldName] = this.getArrayNumber(value);
          break;

        case this.RULES.arrayDate:
          result[fieldName] = this.getArrayDate(value);
          break;

        case this.RULES.arrayString:
          result[fieldName] = this.getArrayString(value);
          break;

        case this.RULES.arrayObject:
          result[fieldName] = this.getArrayObject(value);
          break;

        default:
          result[fieldName] = value;
      }
    });

    return result;
  }

  getArrayID(rawArray) {
    if (!isArray(rawArray)) {
      return [];
    }

    const result = rawArray.map(item => {
      return toInteger(item);
    });

    return result;
  }

  getArrayNumber(rawArray) {
    if (!isArray(rawArray)) {
      return [];
    }

    const result = rawArray.map(item => {
      return toNumber(item) || 0;
    });

    return result;
  }

  getArrayDate(rawArray) {
    if (!isArray(rawArray)) {
      return [];
    }

    const result = rawArray.map(item => {
      return Formatter.date(item);
    });

    return result;
  }

  getArrayString(rawArray) {
    if (!isArray(rawArray)) {
      return [];
    }

    const result = rawArray.map(item => {
      return String(item);
    });

    return result;
  }

  getArrayObject(rawArray) {
    if (!isArray(rawArray)) {
      return [];
    }

    return rawArray;
  }

  clearExcludes() {
    this.excludes = [];
  }
}
