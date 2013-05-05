XDStorage - Cross Domain localStorage
=====================================

Intro
-----

Using native sessionStorage has the downside that data does not span subdomains, tabs, or protocols. localStorage has similar subdomain and protocol limitations. Session cookies have the scope we want, but stricter size limitations.

XDStorage is useful if you want to save state on the client side at the scope of a session cookie, but don't want to store all the data in a cookie.

XDStorage solves these issues by:

* Creating a single session cookie that stores a secret (with configurable domain, allowing for sharing data between subdomains)
* Leverages [EasyXDM](http://easyxdm.net/) to communicate with an HTTPS page (potentially on another domain) to share data across protocols
 * On this page, data is stored using [Store.js](https://github.com/marcuswestin/store.js/) (localStorage + equivalents)
 * Data is encrypted with the secret stored in the session cookie (so is no longer accessible once the session cookie is gone)

Usage
-----

```javascript
// Initialize
var xds = new XDStorage({
  cookieName : 'myCookie',
	storage : 'https://otherhost.example.com/xdstorage.htm'
});

// Do we already have a session?
console.log('Existing session: ', xds.id());

// Set some data
xds.set('randomNum', Math.random()).done(function () {
  // Output session ID/secret (existing or newly created)
  console.log('Using session: ', xds.id());
  console.log('Wrote a random number to key: randomNum');
  
  // Get the data we just set
  xds.get('randomNum').done(function (d) {
    console.log('Read from key randomNum: ', d);
  });
});
```
