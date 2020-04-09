const sprintf = require('sprintf-js').sprintf;

let FundCriteriaEditorDirective = function(
    $scope,
) {
    let $dir = $scope.$dir = {};

    $dir.addCriteria = () => {
        $scope.criteria.push({
            is_new: true,
            is_editing: true,
            show_attachment: false,
            validators: [],
            record_type_key: 0,
            operator: "=",
            value: "",
        });
    };

    $dir.onDelete = (criterion) => {
        let index = $scope.criteria.indexOf(criterion);

        if (index != -1) {
            $scope.criteria.splice(index, 1);
        }
    };

    $dir.saveCriteria = () => {
        $scope.onSaveCriteria({
            fund: $dir.fund
        });
    };

    $dir.init = function() {
        $dir.fund = $scope.fund;
        $dir.criteria = $scope.criteria;
        $dir.saveButton = !!$scope.saveButton;
        $dir.recordTypes = $scope.recordTypes.filter(
            recordType => recordType.key != 'primary_email'
        );
        $dir.recordTypes.unshift({
            key: 0,
            name: "Select"
        });
        $dir.organization = $scope.organization;
        $dir.validatorOrganizations = $scope.validatorOrganizations;
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            fund: '=',
            criteria: '=',
            recordTypes: '=',
            organization: '=',
            saveButton: '=',
            onSaveCriteria: '&',
            validatorOrganizations: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            FundCriteriaEditorDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-criteria-editor.html'
    };
};