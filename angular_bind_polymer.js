angular.module('eee-c.angularBindPolymer', []).
directive('bindPolymer', ['$parse', function($parse) {
  'use strict';
  return {
    restrict: 'A',
    scope : false,
    compile: function bindPolymerCompile($element, $attr) {
      var attrMap = {};

      for (var prop in $attr) {
        if (angular.isString($attr[prop])) {
          var _match = $attr[prop].match(/\{\{\s*([\.\w]+)\s*\}\}/);
          if (_match) {
            var camelCaseToHyphen = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            attrMap[camelCaseToHyphen] = $parse(_match[1]);
          }
        }
      }

      return function bindPolymerLink(scope, element, attrs) {

        // When Polymer sees a change to the bound variable,
        // $apply / $digest the changes here in Angular
        var observer = new MutationObserver(function polymerMutationObserver(mutations) {
          scope.$apply(function processMutationsHandler() {
            mutations.forEach(function processMutation(mutation) {

              var attributeName, newValue, oldValue, getter;
              attributeName = mutation.attributeName;
              //var attributeName = attributeName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });

              if (attributeName in attrMap) {
                newValue = element.attr(attributeName);
                getter = attrMap[attributeName];
                oldValue = getter(scope);

                if (oldValue != newValue && angular.isFunction(getter.assign)) {
                  if(newValue !== "") {
                    newValue = JSON.parse(newValue);
                  }
                  getter.assign(scope, newValue);
                }
              }
            });
          });
        });

        observer.observe(element[0], {attributes: true});
        scope.$on('$destroy', observer.disconnect.bind(observer));
      }
    }
  };
}]);
