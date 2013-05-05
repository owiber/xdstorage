require(
['lib/lodash.custom', 'lib/aes', 'lib/deferred', 'lib/json2', 'lib/store', 'lib/cookie', 'lib/easyxdm', 'lib/uid'],
function (_, CryptoJS, Dfd, JSON, Store, Cookie, easyXDM, UID) {

if (window.XDStorage) {
  return;
}

var Deferred = Dfd.Deferred;
var noop = function () {};
var cache = {};

// Config:
// {
//  cookieName : 'myCookie',
//  cookieDomain : 'example.com',
//  swf : 'https://path/to/easyxdm.swf',
//  storage : 'https://path/to/storage.htm'
// }
var XDStorage = window.XDStorage = function (config) {
  if ( !(this instanceof arguments.callee) ) {
    return new XDStorage(config);
  }
  // Shallow copy
  this.config = _.extend({}, config || {});
  this.cookieName = this.config.cookieName;
  this.sessionCookie = Cookie.read(this.cookieName);
  cache[this.cookieName] = {};
};

XDStorage.easyXDM = easyXDM.noConflict('XDStorage');

function _getHelper (key, fn) {
  var self = this;
  fn = fn || noop;
  if (self.sessionCookie) {
    self.setup().done(function (rpc) {
      rpc.get(self.cookieName + '_' + key, self.sessionCookie, fn);
    });
  } else {
    fn();
  }
}

_(XDStorage.prototype).extend({
  id : function () {
    return this.sessionCookie;
  },
  setup : function () {
    var dfd = Deferred();
    // Only do this setup once
    this.setup = function () {
      return dfd.promise();
    };
    dfd.resolve(
      new XDStorage.easyXDM.Rpc({
        hash : true,
        remote : this.config.storage,
        swf : this.config.swf
      }, {
        remote: {
          set : {},
          get : {},
          remove : {}
        }
      })
    );
    return this.setup();
  },
  create : function () {
    this.setup();
    var secret = UID();
    Cookie.create(this.cookieName, secret, null, this.config.cookieDomain);
    this.sessionCookie = Cookie.read(this.cookieName);
    return this.sessionCookie;
  },
  set : function (key, data, fn) {
    var self = this;
    fn = fn || noop;
    if (!self.sessionCookie) {
      self.create();
    }
    self.setup().done(function (rpc) {
      rpc.set(self.cookieName + '_' + key, self.sessionCookie, data, function (result) {
        cache[self.cookieName][key] = Deferred().resolve(result);
        fn(result);
      });
    });
  },
  get : function (key, fn) {
    var self = this;
    fn = fn || noop;
    if (self.sessionCookie) {
      if (!cache[self.cookieName][key]) {
        cache[self.cookieName][key] = cache[self.cookieName][key] || Deferred();
        _getHelper.call(self, key, function (data) {
          cache[self.cookieName][key].resolve(data);
        });
      }
      cache[self.cookieName][key].done(fn);
    } else {
      fn();
    }
  },
  remove : function (key, fn) {
    var self = this;
    fn = fn || noop;
    if (self.sessionCookie) {
      delete cache[self.cookieName][key];
      self.setup().done(function (rpc) {
        rpc.remove(self.cookieName + '_' + key, fn);
      });
    } else {
      fn();
    }
  }
});


XDStorage.storage = function (cfg) {
  var config = cfg || {};
  function updateKeys (key, remove) {
    try {
      var keys = Store.get('keys') || {};
      if (remove) {
        delete keys[key];
      } else {
        keys[key] = new Date().getTime();
      }
      Store.set('keys', keys);
    } catch (e) {
      Store.clear();
    }
  }

  function removeOldKeys () {
    var keys = Store.get('keys');
    var now = new Date().getTime();
    var deleted = false;
    for (var key in keys) {
      // Delete if older than 60 days
      if ( (now - keys[key]) > 5184000) {
        deleted = true;
        delete keys[key];
      }
    }
    if (deleted) {
      Store.set('keys', keys);
    }
  }

  new XDStorage.easyXDM.Rpc(
    { swf : config.swf },
    {
      local : {
        set : {
          method : function (key, passkey, val, fn) {
            var value = CryptoJS.AES.encrypt(JSON.stringify(val), passkey) + '';
            Store.set(key, value);
            updateKeys(key);
            fn(val);
          }
        },
        get : {
          method : function (key, passkey, fn) {
            var storedValue = Store.get(key);
            var result;
            if (storedValue) {
              try {
                result = JSON.parse( CryptoJS.AES.decrypt(storedValue, passkey).toString(CryptoJS.enc.Utf8) );
              } catch (e) {
                Store.set(key);
              }
            }
            fn(result);
          }
        },
        remove : {
          method : function (key, fn) {
            Store.set(key);
            updateKeys(key, true);
            fn();
          }
        }
      }
    }
  );

  try {
    removeOldKeys();
  } catch (e) {
    Store.clear();
  }

};


});