const assert = require('assert')
const queryParser = require('../index')

describe('Query parser', () => {
  describe('Parser', () => {
    it('should convert a simple object query to array', () => {
      let obj = { price: '23', orderBy: 'recent', page: '20' }
      let result = queryParser.parse(obj)

      assert.deepStrictEqual(result, [{
        key: 'price',
        value: 23,
        comparator: '='
      }, {
        key: 'orderBy',
        value: 'recent',
        comparator: '='
      }, {
        key: 'page',
        value: 20,
        comparator: '='
      }])
    })

    it('should convert an object query with comparators to array', () => {
      let obj = { price: 'gt:23', orderBy: 'df:recent', page: 'lte:20' }
      let result = queryParser.parse(obj)

      assert.deepStrictEqual(result, [{
        key: 'price',
        value: 23,
        comparator: '>'
      }, {
        key: 'orderBy',
        value: 'recent',
        comparator: '!='
      }, {
        key: 'page',
        value: 20,
        comparator: '<='
      }])
    })

    it('should convert an object with arrays query with comparators to array', () => {
      let obj = { price: ['gt:23', 'lt:30'], orderBy: 'df:recent' }
      let result = queryParser.parse(obj)

      assert.deepStrictEqual(result, [{
        key: 'price',
        value: 23,
        comparator: '>'
      }, {
        key: 'price',
        value: 30,
        comparator: '<'
      }, {
        key: 'orderBy',
        value: 'recent',
        comparator: '!='
      }])
    })

    it('should ignore keys which contains special caracters', () => {
      let obj = { 'pri;ce': 'gt:23', 'order By': 'df:recent', page: 'lte:20' }
      let result = queryParser.parse(obj)

      assert.deepStrictEqual(result, [{
        key: 'page',
        value: 20,
        comparator: '<='
      }])
    })

    it('should parse an array with int values', () => {
      let obj = { 'price': '12,25,26,28' }
      let result = queryParser.parse(obj)

      assert.deepStrictEqual(result, [{
        key: 'price',
        value: [12, 25, 26, 28],
        comparator: '='
      }])
    })

    it('should parse an array with string values', () => {
      let obj = { 'name': 'toto,tata,titi' }
      let result = queryParser.parse(obj)

      assert.deepStrictEqual(result, [{
        key: 'name',
        value: ['toto', 'tata', 'titi'],
        comparator: '='
      }])
    })

    it('should parse a version number', () => {
      let obj = { 'version': '1.0.0' }
      let result = queryParser.parse(obj)

      assert.deepStrictEqual(result, [{
        key: 'version',
        value: '1.0.0',
        comparator: '='
      }])
    })
  })

  describe('Parse to int if number', () => {
    it('should convert int string to real int', () => {
      assert.strictEqual(queryParser.parseToIntIfNumber('123456'), 123456)
    })

    it('should convert float string to real float', () => {
      assert.strictEqual(queryParser.parseToIntIfNumber('123456.789'), 123456.789)
    })

    it('should not convert string if value contains a letter', () => {
      assert.strictEqual(queryParser.parseToIntIfNumber('A123456.789'), 'A123456.789')
    })

    it('should return value if value is null', () => {
      assert.strictEqual(queryParser.parseToIntIfNumber(null), null)
    })

    it('should return value if value is undefined', () => {
      assert.strictEqual(queryParser.parseToIntIfNumber(undefined), undefined)
    })

    it('should return value if value is empty', () => {
      assert.strictEqual(queryParser.parseToIntIfNumber(''), '')
    })
  })

  describe('Contains only letter or number', () => {
    it('should contains only letter (uppercase, lowercase)', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('abcABC'), true)
    })

    it('should contains only letter (uppercase, lowercase) and numbers', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('abcABC123'), true)
    })

    it('should contains only letter at the end of the alphabet (uppercase, lowercase) and numbers', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('xyzXYZ789'), true)
    })

    it('should return false if value contains @', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('@toto'), false)
    })

    it('should return false if value contains [', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('[toto'), false)
    })

    it('should return false if value contains `', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('`toto'), false)
    })

    it('should return false if value contains {', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('{toto'), false)
    })

    it('should return false if value contains {', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('{toto'), false)
    })

    it('should return false if value contains /', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter('/toto'), false)
    })

    it('should return false if value contains :', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter(':toto'), false)
    })

    it('should return false if value is null', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter(null), false)
    })

    it('should return false if value is undefined', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter(undefined), false)
    })

    it('should return false if value is empty', () => {
      assert.strictEqual(queryParser.containsNumberOrLetter(''), false)
    })
  })

  describe('Contains only number', () => {
    it('should contains an int number', () => {
      assert.strictEqual(queryParser.containsOnlyNumber('1560'), true)
    })

    it('should contains a float number', () => {
      assert.strictEqual(queryParser.containsOnlyNumber('156.12'), true)
    })

    it('should return false if value contains letter', () => {
      assert.strictEqual(queryParser.containsOnlyNumber('1de56.12'), false)
    })

    it('should return false if value contains special character', () => {
      assert.strictEqual(queryParser.containsOnlyNumber('1:;56.12'), false)
    })

    it('should return false if value is null', () => {
      assert.strictEqual(queryParser.containsOnlyNumber(null), false)
    })

    it('should return false if value is undefined', () => {
      assert.strictEqual(queryParser.containsOnlyNumber(undefined), false)
    })

    it('should return false if value is empty', () => {
      assert.strictEqual(queryParser.containsOnlyNumber(''), false)
    })
  })

  describe('Grouped filters', () => {
    it('should parse a plain object as a grouped filter with integer values', () => {
      let obj = { variations: { '10000': '1000,1001', '10001': '1004' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{
        key: 'variations',
        comparator: 'grouped',
        value: [
          { groupKey: '10000', values: [1000, 1001] },
          { groupKey: '10001', values: [1004] }
        ]
      }])
    })

    it('should parse a grouped filter with string values', () => {
      let obj = { colors: { 'axis1': 'red,blue', 'axis2': 'green' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{
        key: 'colors',
        comparator: 'grouped',
        value: [
          { groupKey: 'axis1', values: ['red', 'blue'] },
          { groupKey: 'axis2', values: ['green'] }
        ]
      }])
    })

    it('should parse a grouped filter with a single value per group', () => {
      let obj = { filters: { 'grp1': '42' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{
        key: 'filters',
        comparator: 'grouped',
        value: [{ groupKey: 'grp1', values: [42] }]
      }])
    })

    it('should apply comparator prefix to grouped values', () => {
      let obj = { price: { 'range1': 'gte:10', 'range2': 'lte:50' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{
        key: 'price',
        comparator: 'grouped',
        value: [
          { groupKey: 'range1', values: [10], comparator: '>=' },
          { groupKey: 'range2', values: [50], comparator: '<=' }
        ]
      }])
    })

    it('should apply LIKE wrapping in a grouped filter', () => {
      let obj = { name: { 'grp1': 'lk:wine' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{
        key: 'name',
        comparator: 'grouped',
        value: [
          { groupKey: 'grp1', values: ['%wine%'], comparator: 'LIKE' }
        ]
      }])
    })

    it('should coexist with flat params without regression', () => {
      let obj = { page: '1', variations: { '10000': '1000,1001' }, orderBy: 'price' }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [
        { key: 'page', value: 1, comparator: '=' },
        { key: 'variations', comparator: 'grouped', value: [{ groupKey: '10000', values: [1000, 1001] }] },
        { key: 'orderBy', value: 'price', comparator: '=' }
      ])
    })

    it('should skip the grouped key if the outer key contains special characters', () => {
      let obj = { 'var;iations': { '10000': '1000' }, page: '1' }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{ key: 'page', value: 1, comparator: '=' }])
    })

    it('should ignore groups whose values are empty after parsing', () => {
      let obj = { variations: { '10000': '', '10001': '1004' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{
        key: 'variations',
        comparator: 'grouped',
        value: [{ groupKey: '10001', values: [1004] }]
      }])
    })

    it('should produce no entry when all groups are empty', () => {
      let obj = { variations: { '10000': '' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [])
    })

    it('should accept numeric-only sub-keys without validation', () => {
      let obj = { tags: { '123': 'SWEAT,SHORT', '456': 'JEAN' } }
      let result = queryParser.parse(obj)
      assert.deepStrictEqual(result, [{
        key: 'tags',
        comparator: 'grouped',
        value: [
          { groupKey: '123', values: ['SWEAT', 'SHORT'] },
          { groupKey: '456', values: ['JEAN'] }
        ]
      }])
    })
  })
})
