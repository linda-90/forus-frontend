const sprintf = require('sprintf-js').sprintf;

let FundCriteriaEditorItemDirective = function(
    $scope,
    $filter,
    FundService,
    ModalService
) {
    let $dir = $scope.$dir = {};
    let $trans = $filter('translate');
    let $currency_format = $filter('currency_format');

    let currency_types = [
        'net_worth', 'base_salary',
    ];

    $dir.operators = [{
        key: "=",
        name: "gelijk aan",
    }, {
        key: "<",
        name: "is kleiner dan",
    }, {
        key: ">",
        name: "is groter dan",
    }];

    $dir.operatorKeys = {};

    $dir.operators.forEach((operator) => {
        $dir.operatorKeys[operator.key] = operator.name;
    });

    $dir.prepareCriteria = (criterion) => {
        criterion.title = criterion.is_new ? 'New criterion' : sprintf(
            "%s %s %s",
            criterion.record_type_name,
            $dir.operatorKeys[criterion.operator],
            currency_types.indexOf(
                criterion.record_type_key
            ) != -1 ? $currency_format(criterion.value) : criterion.value
        );

        if (!Array.isArray(criterion.validators)) {
            criterion.validators = [];
        }

        criterion.validators_models = criterion.validators.map(validatorId => {
            return $scope.validatorOrganizations.filter(
                validatorModel => validatorModel.id == validatorId
            )[0];
        });

        let validatorsModels = criterion.validators_models;
        let validatorsHalf = Math.ceil(validatorsModels.length / 2);

        criterion.use_external_validators = validatorsModels.length > 0;
        criterion.validators_list = [
            validatorsModels.slice(0, validatorsHalf),
            validatorsModels.slice(validatorsHalf, validatorsModels.length),
        ];

        criterion.new_validator = 0;
        criterion.validators_available = [{
            name: "Select",
            id: 0,
        }].concat($scope.validatorOrganizations.filter(
            validator => criterion.validators.indexOf(validator.id) == -1
        ));
    };

    $dir.editDescription = (criterion) => {
        ModalService.open('fundCriteriaDescriptionEdit', {
            description: criterion.description,
            success: (data) => {
                criterion.description = data.description;
            }
        });
    };

    $dir.saveCriterion = (_criterion) => {
        let criterion = JSON.parse(JSON.stringify(_criterion));

        criterion.is_editing = false;

        delete criterion.title;
        delete criterion.new_validator;
        delete criterion.validators_list;
        delete criterion.validators_models;
        delete criterion.validators_available;
        delete criterion.use_external_validators;
        delete criterion.show_external_validators_form;

        if (criterion.record_type_key) {
            let recordType = $dir.recordTypes.filter(
                recordType => recordType.key == criterion.record_type_key
            )[0];

            if (recordType) {
                criterion.record_type_name = recordType ? recordType.name : '';
            }
        }

        FundService.criterionValidate(
            $scope.organization.id,
            criterion
        ).then(() => {
            criterion.is_new = false;

            Object.assign($scope.criterion, criterion);

            // $scope.onSave($scope.criterion);
            $dir.init();
        }, res => {
            $dir.errors = res.data.errors;
        });
    };

    $dir.cancelCriterion = () => {
        if ($scope.criterion.is_new) {
            $dir.removeCriterion();
        } else {
            $dir.init();
        }
    };

    $dir.removeCriterion = () => {
        $scope.onDelete($scope.criterion);
    };

    $dir.criterionEdit = (criterion) => {
        criterion.is_editing = true;
    };

    $dir.criterionEditCancel = (criterion) => {
        criterion.is_editing = false;
    };

    $dir.addExternalValidator = (criterion) => {
        criterion.validators.push(criterion.new_validator);
        criterion.show_external_validators_form = false;
        criterion.new_validator = 0;
        $dir.prepareCriteria($dir.criterion);
    };

    $dir.removeExternalValidator = (criterion, validator_id) => {
        let index = criterion.validators.indexOf(validator_id);

        if (index != -1) {
            criterion.validators.splice(index, 1);
            $dir.prepareCriteria($dir.criterion);
            criterion.use_external_validators = true;
        }
    };

    $dir.init = function() {
        $dir.recordTypes = $scope.recordTypes;

        $dir.criterion = JSON.parse(JSON.stringify($scope.criterion));
        $dir.criterionBackup = JSON.parse(JSON.stringify($scope.criterion));

        $dir.prepareCriteria($dir.criterion);
    };

    $dir.init();
};

module.exports = () => {
    return {
        scope: {
            onSave: '&',
            onDelete: '&',
            fund: '=',
            organization: '=',
            criterion: '=',
            recordTypes: '=',
            onSaveCriterion: '&',
            onRemoveCriterion: '&',
            validatorOrganizations: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$filter',
            'FundService',
            'ModalService',
            FundCriteriaEditorItemDirective
        ],
        templateUrl: 'assets/tpl/directives/fund-criteria-editor-item.html'
    };
};