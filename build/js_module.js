'use strict';

// For geth
if (typeof dapple === 'undefined') {
  var dapple = {};
}

if (typeof web3 === 'undefined' && typeof Web3 === 'undefined') {
  var Web3 = require('web3');
}

dapple['023_simple_storage'] = (function builder () {
  var environments = {};

  function ContractWrapper (headers, _web3) {
    if (!_web3) {
      throw new Error('Must supply a Web3 connection!');
    }

    this.headers = headers;
    this._class = _web3.eth.contract(headers.interface);
  }

  ContractWrapper.prototype.deploy = function () {
    var args = new Array(arguments);
    args[args.length - 1].data = this.headers.bytecode;
    return this._class.new.apply(this._class, args);
  };

  var passthroughs = ['at', 'new'];
  for (var i = 0; i < passthroughs.length; i += 1) {
    ContractWrapper.prototype[passthroughs[i]] = (function (passthrough) {
      return function () {
        return this._class[passthrough].apply(this._class, arguments);
      };
    })(passthroughs[i]);
  }

  function constructor (_web3, env) {
    if (!env) {
      env = {};
    }
    while (typeof env !== 'object') {
      if (!(env in environments)) {
        throw new Error('Cannot resolve environment name: ' + env);
      }
      env = environments[env];
    }

    if (typeof _web3 === 'undefined') {
      if (!env.rpcURL) {
        throw new Error('Need either a Web3 instance or an RPC URL!');
      }
      _web3 = new Web3(new Web3.providers.HttpProvider(env.rpcURL));
    }

    this.headers = {
      'SimpleStorage': {
        'interface': [
          {
            'constant': true,
            'inputs': [],
            'name': 'storedData',
            'outputs': [
              {
                'name': '',
                'type': 'uint256'
              }
            ],
            'type': 'function'
          },
          {
            'constant': false,
            'inputs': [
              {
                'name': 'x',
                'type': 'uint256'
              }
            ],
            'name': 'set',
            'outputs': [],
            'type': 'function'
          },
          {
            'constant': true,
            'inputs': [],
            'name': 'get',
            'outputs': [
              {
                'name': 'retVal',
                'type': 'uint256'
              }
            ],
            'type': 'function'
          },
          {
            'inputs': [
              {
                'name': 'initialValue',
                'type': 'uint256'
              }
            ],
            'type': 'constructor'
          }
        ],
        'bytecode': '6060604052604051602080610105833981016040528080519060200190919050505b806000600050819055505b5060cb8061003a6000396000f360606040526000357c0100000000000000000000000000000000000000000000000000000000900480632a1afcd914604b57806360fe47b114606c5780636d4ce63c146082576049565b005b6056600480505060a3565b6040518082815260200191505060405180910390f35b6080600480803590602001909190505060ac565b005b608d600480505060ba565b6040518082815260200191505060405180910390f35b60006000505481565b806000600050819055505b50565b6000600060005054905060c8565b9056'
      }
    };

    this.classes = {};
    for (var key in this.headers) {
      this.classes[key] = new ContractWrapper(this.headers[key], _web3);
    }

    this.objects = {};
    for (var i in env.objects) {
      var obj = env.objects[i];
      this.objects[i] = this.classes[obj['class']].at(obj.address);
    }
  }

  return {
    class: constructor,
    environments: environments
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = dapple['023_simple_storage'];
}
