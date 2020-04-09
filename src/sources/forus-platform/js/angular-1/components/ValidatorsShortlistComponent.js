let ValidatorsShortlistComponent = function(
    $q,
    OrganizationService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.filters = {
        values: {},
    };

    let prepareValidators = (organizations, approvedOrganizations) => {
        let approvedValidators = approvedOrganizations.map(
            validatorOrganization => validatorOrganization.id
        );

        organizations.forEach((organization) => {
            organization.approved = approvedValidators.indexOf(
                organization.id
            ) !== -1;
        })

        return organizations;
    };

    $ctrl.onPageChange = (query) => {
        return $q((resolve, reject) => {
            let promisses = [
                $ctrl.fetchAvailableList(),
                $ctrl.fetchApprovedList()
            ];

            $q.all(promisses).then(() => resolve($ctrl.updateModels()), reject)
        });
    };

    $ctrl.fetchAvailableList = () => {
        return $q((resolve, reject) => {
            OrganizationService.listValidatorsAvailable().then(res => resolve(
                $ctrl.validatorOrganizations = res.data
            ), reject);
        });
    };

    $ctrl.fetchApprovedList = () => {
        return $q((_res, _rej) => {
            OrganizationService.readListValidators(
                $ctrl.organization.id, {
                    per_page: 1000
                }).then(res => _res(
                $ctrl.validatorOrganizationsApproved = res.data
            ), _rej);
        });
    };

    $ctrl.updateModels = () => {
        return $ctrl.validatorOrganizations.data = prepareValidators(
            $ctrl.validatorOrganizations.data,
            $ctrl.validatorOrganizationsApproved.data
        );
    };

    $ctrl.onChange = (organization) => {
        if (organization.approved) {
            OrganizationService.addOrganizationValidator(
                $ctrl.organization.id,
                organization.id
            ).then(() => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.fetchApprovedList().then(() => $ctrl.updateModels());
            }, () => PushNotificationsService.danger('Error!'));
        } else {
            OrganizationService.removeOrganizationValidator(
                $ctrl.organization.id,
                organization.id
            ).then(res => {
                PushNotificationsService.success('Opgeslagen!');
                $ctrl.fetchApprovedList().then(() => $ctrl.updateModels());
            }, () => PushNotificationsService.danger('Error!'));
        }
    };

    $ctrl.$onInit = function() {
        $ctrl.validatorOrganizations.data = prepareValidators(
            $ctrl.validatorOrganizations.data,
            $ctrl.validatorOrganizationsApproved.data
        );
    };
};

module.exports = {
    bindings: {
        organization: '<',
        validatorOrganizations: '<',
        validatorOrganizationsApproved: '<',
    },
    controller: [
        '$q',
        'OrganizationService',
        'PushNotificationsService',
        ValidatorsShortlistComponent
    ],
    templateUrl: 'assets/tpl/pages/validators-shortlist.html'
};