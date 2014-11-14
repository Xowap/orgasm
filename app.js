/*globals angular*/

(function (ng) {
    'use strict';

    var orgasm = ng.module('orgasm', []);

    orgasm.controller('OrgasmControl', function ($scope) {
        $scope.n = 6;
        $scope.matrix = [];
        $scope.groups = [];
        $scope.subjects = [];

        $scope.$watch('n', function (n) {
            var i;

            $scope.matrix.length = n;
            $scope.groups.length = n;
            $scope.subjects.length = n;

            for (i = 0; i < n; i += 1) {
                if ($scope.matrix[i] === undefined) {
                    $scope.matrix[i] = [];
                }

                $scope.matrix[i].length = n;

                if ($scope.groups[i] === undefined) {
                    $scope.groups[i] = 'Group ' + (i + 1);
                }

                if ($scope.subjects[i] === undefined) {
                    $scope.subjects[i] = 'Subject ' + (i + 1);
                }
            }
        });
    });
}(angular));
