const comparatorObject = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  df: '!=',
  eq: '=',
  lk: 'LIKE'
}

const queryParserFunctions = {
  /**
   * Parse all query params, clean them and return the result
   * @param {Object} queryParams All URL params
   */
  parse : function (queryParams) {
    return this.splitInArray(queryParams)
  },

  /**
   * Group all params in an array of object
   * @param {Object} queryParams All URL params
   */
  splitInArray : function (queryParams) {
    let paramsArray = []

    for (let i = 0; i < Object.keys(queryParams).length; i++) {
      let key = Object.keys(queryParams)[i].toString()

      let rawValue = queryParams[key]
      if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
        if (!this.containsNumberOrLetter(key)) continue

        let groups = []
        let subKeys = Object.keys(rawValue)
        for (let k = 0; k < subKeys.length; k++) {
          let groupKey = subKeys[k]
          let groupStr = rawValue[groupKey].toString()
          let groupValues = []
          let groupComparator = '='

          if (groupStr.includes(':')) {
            let parts = groupStr.split(':')
            if (comparatorObject[parts[0]] !== undefined) {
              groupComparator = comparatorObject[parts[0]]
              let subVals = parts[1].includes(',') ? parts[1].split(',') : [parts[1]]
              for (let m = 0; m < subVals.length; m++) {
                groupValues.push(groupComparator === 'LIKE' ? `%${subVals[m]}%` : this.parseToIntIfNumber(subVals[m]))
              }
            }
          } else if (groupStr.includes(',')) {
            let subVals = groupStr.split(',')
            for (let m = 0; m < subVals.length; m++) {
              groupValues.push(this.parseToIntIfNumber(subVals[m]))
            }
          } else if (groupStr.length > 0) {
            groupValues.push(this.parseToIntIfNumber(groupStr))
          }

          if (groupValues.length > 0) {
            let entry = { groupKey: groupKey, values: groupValues }
            if (groupComparator !== '=') entry.comparator = groupComparator
            groups.push(entry)
          }
        }

        if (groups.length > 0) {
          paramsArray.push({ key: key, comparator: 'grouped', value: groups })
        }
        continue
      }

      let values = (Array.isArray(queryParams[key]) === true) ? queryParams[key] : [queryParams[key]]

      for (let j = 0; j < values.length; j++) {
        let value = values[j].toString()
        let searched = {
          key: key,
          value: null,
          comparator: '='
        }

        if (!this.containsNumberOrLetter(key)) {
          continue
        }

        if (value.includes(':')) {
          let splittedValue = value.split(':')

          if (comparatorObject[splittedValue[0]] !== undefined) {
            searched.comparator = comparatorObject[splittedValue[0]]

            searched.value = (comparatorObject[splittedValue[0]] !== 'LIKE') ? this.parseToIntIfNumber(splittedValue[1]) : `%${splittedValue[1]}%`
          }
        } else if (value.includes(',')) {
          let splittedValue = value.split(',')
          searched.value = []

          for (let k = 0; k < splittedValue.length; k++) {
            searched.value.push(this.parseToIntIfNumber(splittedValue[k]))
          }
        } else {
          searched.value = this.parseToIntIfNumber(value)
        }

        paramsArray.push(searched)
      }
    }

    return paramsArray
  },

  /**
   * Check if number is int or float and return the parsed value, else just return the value
   * @param {String} value String to parse
   */
  parseToIntIfNumber : function (value) {
    if (this.containsOnlyNumber(value)) {
      const count = (value.match(/\./g) || []).length;

      if (count >= 2) {
        return value
      }

      if (value.includes('.')) {
        return parseFloat(value)
      }

      return parseInt(value)
    }

    return value
  },

  /**
   * Check a string is only compose of number or letter
   * @param {String} value String to check
   */
  containsNumberOrLetter : function (value) {
    if (value == null) {
      return false
    }

    if (value.length === 0) {
      return false
    }

    for (let i = 0; i < value.length; i++) {
      let code = value[i].charCodeAt(0)

      // Allow [-_a-zA-Z0-9] in key
      if (code !== 45 && code !== 95 && (code < 48 || (code > 57 && code < 65) || (code > 90 && code < 97) || code > 122)) {
        return false
      }
    }

    return true
  },

  /**
   * Check a string contains only number
   * @param {String} value String to check
   */
  containsOnlyNumber : function (value) {
    if (value == null) {
      return false
    }

    if (value.length === 0) {
      return false
    }

    for (let i = 0; i < value.length; i++) {
      let code = value[i].charCodeAt(0)

      // Allow point for floating number
      if (code !== 46 && (code < 48 || code > 57)) {
        return false
      }
    }

    return true
  }
}

module.exports = queryParserFunctions
