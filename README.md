XDStorage - Cross Domain localStorage
=====================================

WORK IN PROGRESS...

Intro
-----

Using native sessionStorage has the downside that data does not span subdomains, tabs, or protocols. localStorage has similar subdomain and protocol limitations. Session cookies have the scope we want, but stricter size limitations.

XDStorage is useful if you want to save state on the client side at the scope of a session cookie, but don't want to store all the data in a cookie.

XDStorage solves these issues by:

* Creating a single session cookie that stores a secret (with configurable domain, allowing for sharing data between subdomains)
* Leverages [EasyXDM](http://easyxdm.net/) to communicate with an HTTPS page (potentially on another domain) to share data across protocols
 * On this page, data is stored using [Store.js](https://github.com/marcuswestin/store.js/) (localStorage + equivalents)
 * Data is encrypted with the secret stored in the session cookie (so is no longer accessible once the session cookie is gone)

Setup
-----
1. Place ```dist/xdstorage.htm``` on the domain you want to store data on (this is where localStorage will save to).
2. Make sure the path to ```xdstorage.min.js``` in ```xdstorage.htm``` is correct.
3. If you need to support IE6/IE7, you'll also need to host easyxdm.swf and configure it in ```xdstorage.htm```:

```javascript
XDStorage.storage({
  swf : 'https://path/to/easyxdm.swf'
});
```

Usage
-----
Include ```xdstorage.min.js``` on the page you want to use XDStorage.

```javascript
// Initialize
var xds = new XDStorage({
  cookieName : 'myCookie',
  cookieDomain : '.example.com', // Set this if you need cross-subdomain support. Remember the leading dot.
  swf : 'https://path/to/easyxdm.swf', // If you need to support IE6/IE7. Must match the location in xdstorage.htm
  storage : 'https://storage.example.com/xdstorage.htm' // Needs to be HTTPS if you want access to the data cross-protocol
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
