let ValidatorsShortlistComponent = function(
    $q,
    FormBuilderService,
    OrganizationService,
    PushNotificationsService
) {
    let $ctrl = this;

    $ctrl.filters = {
        values: {},
    };

    $ctrl.onPageChange = (query) => {
        return $q((resolve, reject) => {});
    };

    $ctrl.updateFundAcceptance = (fund) => {
        OrganizationService.externalFundUpdate($ctrl.organization.id, fund.id, {
            criteria: fund.criteria
        }).then(() => {
            PushNotificationsService.success('Opgeslagen!');
        }, (err) => {
            PushNotificationsService.danger('Error!');
            console.error(err);
        });
    };

    $ctrl.acceptAll = (fund) => {
        fund.criteria.forEach(function(criterion) {
            criterion.accepted = true;
        });

        $ctrl.updateFundAcceptance(fund);
    };

    $ctrl.declineAll = (fund) => {
        fund.criteria.forEach(function(criterion) {
            criterion.accepted = false;
        });

        $ctrl.updateFundAcceptance(fund);
    };

    $ctrl.$onInit = function() {
        $ctrl.auto_validate_form = FormBuilderService.build({
            validator_auto_accept_funds: $ctrl.organization.validator_auto_accept_funds,
        }, function(form) {
            OrganizationService.updateRole($ctrl.organization.id, form.values).then(() => {
                PushNotificationsService.success('Opgeslagen!');
                form.unlock();
            }, () => {
                PushNotificationsService.danger('Error!');
                form.unlock();
            });
        }, true);
    };
};

module.exports = {
    bindings: {
        funds: '<',
        organization: '<',
    },
    controller: [
        '$q',
        'FormBuilderService',
        'OrganizationService',
        'PushNotificationsService',
        ValidatorsShortlistComponent
    ],
    templateUrl: 'assets/tpl/pages/external-funds.html'
};