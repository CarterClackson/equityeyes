# Stocks Routes

## Get All Stocks for User
Allows authenticated users to retrieve a list of all stocks in their currently saved markets. 
Can be returned all at once or paginated.

### Endpoint
/stocks

### Method
GET

### Authentication
Bearer Token required.

### Parameters
- `paginated` (optional, boolean): Set to `true` for paginated response. Default is `false`.
- `page` (optional, integer): Page number for paginated response. Default is `1`.
- `pageSize` (optional, integer): Number of stocks per page for paginated response. Default is `100`.

### Example Request
```
GET /stocks
```

### Example Response (All Stocks)
```
[
  // List of all stocks in user's markets
  // ...
]
```

### Example Response (Paginated)
```
{
  "page": 1,
  "totalPages": 5,
  "stocks": [
    // List of stocks for the specified page
    // ...
  ]
}
```

# Stock Routes

## Get Moving Average
Retrieve moving average values for a specific stock.

### Endpoint
/stock/:symbol/sma/:timeFrame

### Method
GET

### Parameters
- `symbol` (string): Stock symbol (e.g., AAPL).
- `timeFrame` (string): Timeframe for moving average (e.g., week).
- `window` (optional, string): Moving average window size.
- `seriesType` (optional, string): Type of series for moving average.
- `order` (optional, string): Order of results (e.g., desc).

### Example Request
GET /stock/AAPL/sma/week?window=1&series_type=close&order=desc

###  Example Response
```
[
  {
        "timestamp": 1703394000000,
        "value": 498.54999999999967
    },
    {
        "timestamp": 1702789200000,
        "value": 488.2999999999996
    },
    {
        "timestamp": 1702184400000,
        "value": 488.8999999999996
    },
    ...
]
```

## Get Stock News
Retrieve latest news related to a specific stock.

### Endpoint
/stock/:symbol/news

### Method
GET

### Parameters
- `symbol` (string): Stock symbol (e.g. AAPL).

### Example Request
GET /stock/AAPL/news

### Example Response
```
[
    {
        "id": "1VXZBlT4-TbCx5dmazNIwJO-Kk__PEAY921KHPkZqlA",
        "publisher": {
            "name": "MarketWatch",
            "homepage_url": "https://www.marketwatch.com/",
            "logo_url": "https://s3.polygon.io/public/assets/news/logos/marketwatch.svg",
            "favicon_url": "https://s3.polygon.io/public/assets/news/favicons/marketwatch.ico"
        },
        "title": "4 of the Magnificent Seven stocks are losing their mojo",
        "author": "MarketWatch",
        "published_utc": "2023-12-29T18:30:00Z",
        "article_url": "https://www.marketwatch.com/story/4-of-the-magnificent-seven-stocks-are-losing-their-mojo-and-the-entire-group-could-stall-out-in-2024-8359c149",
        "tickers": [
            "AMZN",
            "AAPL",
            "GOOG",
            "NVDA",
            "META",
            "MSFT",
            "TSLA"
        ],
        "amp_url": "https://www.marketwatch.com/amp/story/4-of-the-magnificent-seven-stocks-are-losing-their-mojo-and-the-entire-group-could-stall-out-in-2024-8359c149",
        "image_url": "https://images.mktw.net/im-810845/social",
        "description": "Applying technical analysis to the U.S. market's seven standouts."
    },
    ...
]
```

## Get Stock Details
Retrieve details about a specific stock

### Endpoint
/stock/:symbol

### Method
GET

### Parameters
- `symbol` (string): Stock symbol (e.g. AAPL).

### Example Request
/stock/AAPL

### Example Response
```
{
    "stock": {
        "status": "OK",
        "from": "2023-12-28",
        "symbol": "AAPL",
        "open": 194.14,
        "high": 194.66,
        "low": 193.17,
        "close": 193.58,
        "volume": 34049898,
        "afterHours": 193.78,
        "preMarket": 193.5
    },
    "ticker": {
        "request_id": "7bbb10b2f3c40b9f15d5b8c7d27a8773",
        "results": {
            "ticker": "AAPL",
            "name": "Apple Inc.",
            "market": "stocks",
            "locale": "us",
            "primary_exchange": "XNAS",
            "type": "CS",
            "active": true,
            "currency_name": "usd",
            "cik": "0000320193",
            "composite_figi": "BBG000B9XRY4",
            "share_class_figi": "BBG001S5N8V8",
            "market_cap": 3010701732160,
            "phone_number": "(408) 996-1010",
            "address": {
                "address1": "ONE APPLE PARK WAY",
                "city": "CUPERTINO",
                "state": "CA",
                "postal_code": "95014"
            },
            "description": "Apple is among the largest companies in the world, with a broad portfolio of hardware and software products targeted at consumers and businesses. Apple's iPhone makes up a majority of the firm sales, and Apple's other products like Mac, iPad, and Watch are designed around the iPhone as the focal point of an expansive software ecosystem. Apple has progressively worked to add new applications, like streaming video, subscription bundles, and augmented reality. The firm designs its own software and semiconductors while working with subcontractors like Foxconn and TSMC to build its products and chips. Slightly less than half of Apple's sales come directly through its flagship stores, with a majority of sales coming indirectly through partnerships and distribution.",
            "sic_code": "3571",
            "sic_description": "ELECTRONIC COMPUTERS",
            "ticker_root": "AAPL",
            "homepage_url": "https://www.apple.com",
            "total_employees": 161000,
            "list_date": "1980-12-12",
            "branding": {
                "logo_url": "https://api.polygon.io/v1/reference/company-branding/YXBwbGUuY29t/images/2023-12-27_logo.svg",
                "icon_url": "https://api.polygon.io/v1/reference/company-branding/YXBwbGUuY29t/images/2023-12-27_icon.jpeg"
            },
            "share_class_shares_outstanding": 15552750000,
            "weighted_shares_outstanding": 15552752000,
            "round_lot": 100
        },
        "status": "OK"
    }
}
```

# User's Routes

## Get User's Stocks
Retrieve details about all stocks saved by the authenticated user.

### Endpoint
/user/stocks

### Method
GET

### Authentication
Bearer token required.


### Example Request
GET /user/stocks

### Example Response
```
[
    {
        "symbol": "AAPL",
        "buyInPrice": "150.00",
        "data": {
            "status": "OK",
            "from": "2023-12-28",
            "symbol": "AAPL",
            "open": 194.14,
            "high": 194.66,
            "low": 193.17,
            "close": 193.58,
            "volume": 34049898,
            "afterHours": 193.78,
            "preMarket": 193.5
        }
    },
    {
        "symbol": "MSFT",
        "buyInPrice": "150.00",
        "data": {
            "status": "OK",
            "from": "2023-12-28",
            "symbol": "MSFT",
            "open": 375.37,
            "high": 376.458,
            "low": 374.16,
            "close": 375.28,
            "volume": 14327013,
            "afterHours": 376,
            "preMarket": 374.5
        }
    },
    ...
]
```

## Sign Up
Create a new user account

### Endpoint
/user/signup

### Method
POST

### Parameters
- `name` (string): User's name(optional)
- `email` (string): User's email address(required)
- `password` (string): User's chosen password(required)

### Example Request
```
POST /user/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Example Response
```
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

## Log In
Authenticate an existing user

### Endpoint
/user/login

### Method
POST

### Parameters
- `email` (string): User's email address
- `password` (string): User's password

### Example Request
```
POST /user/login
{
  "email": "john@example.com",
  "password": "securepassword"
}
```
### Example Response
```
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

## Update User Data
Update user-specific information.

### Endpoint
/user/update/user-data

### Method
PATCH

### Authentication
Bearer Token required.

### Parameters
- `name` (optional, string): Updated user name.
- `email` (optional, string): Updated email address.
- `password` (optional, string): Updated user password.

### Example Request
```
PATCH /user/update/user-data
{
  "name": "New Name",
  "email": "new.email@example.com",
  "password": "newpassword123"
}
```

### Example Response
```
{
  "message": "User data updated successfully",
  "user": {
    // Updated user details
  }
}
```

## Update User Markets
Update user's saved markets.

### Endpoint
/user/update/markets

### Method
PATCH

### Authentication
Bearer Token required

### Parameters
- `add` (optional, array): Markets to add.
- `remove` (optional, array): Markets to remove.

### Example Request
```
PATCH /user/update/markets
{
  "add": ["XLON"],
  "remove": ["XNAS"]
}
```

### Example Response
```
{
  "message": "Markets updated successfully",
  "user": {
    // Updated user details
  }
}
```

## Add Saved Stock
Add a new stock to the user's saved stocks.
Buy in price will be set as previous day closing price.

### Endpoint
/user/stocks/add

### Method
POST

### Authentication
Bearer Token required.

### Parameters
- `savedStock` (object): Object containing `ticker`.

### Example Request
```
POST /user/stocks/add
{
  "savedStock": {
    "ticker": "AAPL",
    "buyInPrice": "150.00"
  }
}
```

### Example Response
```
{
  "message": "Saved stock to user."
}
```

## Delete Saved Stock
Remove a stock from the user's saved stock.

### Endpoint
/user/stocks/delete

### Method
DELETE

### Authentication
Bearer Token required.

### Parameters
- `stockToDelete` (string): Ticker symbol of the stock to delete.

### Example Request
```
DELETE /user/stocks/delete
{
  "stockToDelete": "AAPL"
}
```

### Example Response
```
{
  "message": "Stock removed from user"
}
```

