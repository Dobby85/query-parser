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

      if (code < 48 || (code > 57 && code < 65) || (code > 90 && code < 97) || code > 122) {
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
