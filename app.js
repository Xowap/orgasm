/*globals angular*/

(function (ng) {
    'use strict';

    var orgasm = ng.module('orgasm', ['hungarian']);

    orgasm.controller('OrgasmControl', function ($scope, munkres) {
        $scope.n = 6;
        $scope.matrix = [];
        $scope.groups = [];
        $scope.subjects = [];
        $scope.results = [];

        $scope.$watch('n', function (n) {
            var i, j;

            $scope.matrix.length = n;
            $scope.groups.length = n;
            $scope.subjects.length = n;

            for (i = 0; i < n; i += 1) {
                if ($scope.matrix[i] === undefined) {
                    $scope.matrix[i] = [];
                }

                $scope.matrix[i].length = n;

                for (j = 0; j < n; j += 1) {
                    if ($scope.matrix[i][j] === undefined) {
                        $scope.matrix[i][j] = 1000;
                    }
                }

                if ($scope.groups[i] === undefined) {
                    $scope.groups[i] = 'Group ' + (i + 1);
                }

                if ($scope.subjects[i] === undefined) {
                    $scope.subjects[i] = 'Subject ' + (i + 1);
                }
            }
        });

        $scope.$watch('matrix', function (matrix) {
            $scope.results = munkres.compute($scope.matrix);
        }, true);
    });
}(angular));
