(function () {
  "use strict";

  angular
    .module("mnPermissions", [])
    .provider("mnPermissions", mnPermissionsProvider);

  function mnPermissionsProvider() {

    this.$get = ["$http", "$timeout", "$q", "$rootScope", "mnBucketsService", "$parse", mnPermissionsFacatory];
    this.set = set;
    this.setBucketSpecific = setBucketSpecific;

    var bucketSpecificPermissions = [function (name) {
      return [
        "cluster.bucket[" + name + "].settings!write",
        "cluster.bucket[" + name + "].data!write",
        "cluster.bucket[" + name + "].recovery!write",
        "cluster.bucket[" + name + "].settings!read",
        "cluster.bucket[" + name + "].data!read",
        "cluster.bucket[" + name + "].data.docs!read",
        "cluster.bucket[" + name + "].recovery!read",
        "cluster.bucket[" + name + "].views!read",
        "cluster.bucket[" + name + "].views!write",
        "cluster.bucket[" + name + "].stats!read",
        "cluster.bucket[" + name + "]!flush",
        "cluster.bucket[" + name + "]!delete",
        "cluster.bucket[" + name + "]!compact",
        "cluster.bucket[" + name + "].views!compact",
        "cluster.bucket[" + name + "].xdcr!read",
        "cluster.bucket[" + name + "].xdcr!write",
        "cluster.bucket[" + name + "].xdcr!execute"
      ];
    }];

    var interestingPermissions = [
      "cluster.buckets!create",
      "cluster.nodes!write",
      "cluster.pools!read",
      "cluster.server_groups!read",
      "cluster.server_groups!write",
      "cluster.settings!read",
      "cluster.settings!write",
      "cluster.stats!read",
      "cluster.tasks!read",
      "cluster.indexes!read",
      "cluster.admin.internal!all",
      "cluster.xdcr.settings!read",
      "cluster.xdcr.settings!write",
      "cluster.xdcr.remote_clusters!read",
      "cluster.xdcr.remote_clusters!write",
      "cluster.admin.security!read",
      "cluster.admin.logs!read",
      "cluster.logs!read",
      "cluster.pools!write",
      "cluster.indexes!write",
      "cluster.admin.security!write",
      "cluster.samples!read",
      "cluster.nodes!read"
    ];

    function getAll() {
      return _.clone(interestingPermissions);
    }

    function set(permission) {
      if (!_.contains(interestingPermissions, permission)) {
        interestingPermissions.push(permission);
      }
      return this;
    }

    function setBucketSpecific(func) {
      if (angular.isFunction(func)) {
        bucketSpecificPermissions.push(func);
      }
      return this;
    }

    function generateBucketPermissions(bucketName) {
      return bucketSpecificPermissions.reduce(function (acc, getChunk) {
        return acc.concat(getChunk(bucketName));
      }, []);
    }

    function mnPermissionsFacatory($http, $timeout, $q, $rootScope, mnBucketsService, $parse) {
      var mnPermissions = {
        clear: clear,
        set: set,
        setBucketSpecific: setBucketSpecific,
        get: doCheck,
        check: check,
        getFresh: getFresh,
        export: {
          data: {},
          cluster: {},
          default: {
            all: undefined,
            membase: undefined
          }
        }
      };

      var cached;

      interestingPermissions.push(generateBucketPermissions("."));

      return mnPermissions;

      function clear() {
        delete $rootScope.rbac;
        mnPermissions.export.cluster = {};
        mnPermissions.export.data = {};
        clearCache();
      }

      function clearCache() {
        cached = null;
      }

      function getFresh() {
        clearCache();
        return mnPermissions.check();
      }

      function check() {
        if (cached) {
          return $q.when(mnPermissions.export);
        }
        return doCheck(["cluster.bucket[.].settings!read"]).then(function (resp) {
          var permissions = getAll();
          if (resp.data["cluster.bucket[.].settings!read"]) {
            return mnBucketsService.getBucketsByType().then(function (bucketsDetails) {
              if (bucketsDetails.length) {
                angular.forEach(bucketsDetails, function (bucket) {
                  permissions = permissions.concat(generateBucketPermissions(bucket.name));
                });

                mnPermissions.export.default.all = bucketsDetails.byType.defaultName;
                mnPermissions.export.default.membase = bucketsDetails.byType.membase.defaultName;
                mnPermissions.export.default.ephemeral = bucketsDetails.byType.ephemeral.defaultName;
              }
              return doCheck(permissions);
            });
          } else {
            return doCheck(permissions);
          }
        }).then(function (resp) {
          cached = convertIntoTree(resp.data);

          mnPermissions.export.data = resp.data;
          mnPermissions.export.cluster = cached.cluster;

          return mnPermissions.export;
        });
      }

      function convertIntoTree(permissions) {
        var rv = {};
        angular.forEach(permissions, function (value, key) {
          var levels = key.split(/[\[\]]+/);
          var regex = /[.:!]+/;
          if (levels[1]) {
            levels = _.compact(levels[0].split(regex).concat([levels[1]]).concat(levels[2].split(regex)))
          } else {
            levels = levels[0].split(regex);
          }
          var path = levels.shift() + "['" + levels.join("']['") + "']"; //in order to properly handle bucket names
          $parse(path).assign(rv, value);
        });
        return rv;
      }

      function doCheck(interestingPermissions) {
        return $http({
          method: "POST",
          url: "/pools/default/checkPermissions",
          data: interestingPermissions.join(',')
        });
      }
    }
  }
})();
