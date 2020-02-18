# Query parser

This module is a simple query parser which can handle different operator.

## Getting started

First install the package

```bash
npm i --save query-parser
```

Then you can start using the module

```js
const queryParser = require('query-parser')

// ...
```

## How it works?

This module needs an object with parsed queries. With express, you can get it in `req.query`.

For example, the following route

```
https://mywebsite.com/product?price=lte:25&orderBy=recent&page=3
```

would be translate by express in

```js
let queryParams = {
  price: 'lte:25',
  orderBy: 'recent',
  page: '3'
}
```

And than translate by query parser like this:

```js
const queryParser = require('query-parser')

let parsedParams = queryParser.parse(queryParams)

// parseParams contains
[{
  key: 'price',
  value: 25,
  comparator: '<='
}, {
  key: 'orderBy',
  value: 'recent',
  comparator: '='
}, {
  key: 'page',
  value: 3,
  comparator: '='
}]
```

If your values could be convert to int or float number, query-parser will do it automatically.

### Compators

Here is the list of comparator.

`lte` -> `<=`  
`lt` -> `<`  
`gte` -> `>=`  
`gt` -> `>`  
`df` -> `!=`  
`eq` -> `=`


## Limit

Your keys can only contains letter or number, if there are special caracters in it, it will be skipped.

This route

```
https://mywebsite.com/product?order;By=recent&page=3
```

will at the end be transformed in this array.

```js
[{
  key: 'page',
  value: 3,
  comparator: '='
}]
```
