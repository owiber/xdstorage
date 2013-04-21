
XDStorage.easyXDM = easyXDM.noConflict('XDStorage');

XDStorage.setup = function (cfg) {
  var config = cfg || {};
  function updateKeys (key, remove) {
    try {
      var keys = store.get('keys') || {};
      if (remove) {
        delete keys[key];
      } else {
        keys[key] = new Date().getTime();
      }
      store.set('keys', keys);
    } catch (e) {
      store.clear();
    }
  }

  function removeOldKeys () {
    var keys = store.get('keys');
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
      store.set('keys', keys);
    }
  }

  new XDStorage.easyXDM.Rpc(
    { swf : config.swf },
    {
      local : {
        set : {
          method : function (key, passkey, val, fn) {
            var value = CryptoJS.AES.encrypt(JSON.stringify(val), passkey) + '';
            store.set(key, value);
            updateKeys(key);
            fn(val);
          }
        },
        get : {
          method : function (key, passkey, fn) {
            var storedValue = store.get(key);
            var result;
            if (storedValue) {
              try {
                result = JSON.parse( CryptoJS.AES.decrypt(storedValue, passkey).toString(CryptoJS.enc.Utf8) );
              } catch (e) {
                store.set(key);
              }
            }
            fn(result);
          }
        },
        remove : {
          method : function (key, fn) {
            store.set(key);
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
    store.clear();
  }

};

