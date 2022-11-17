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
})
