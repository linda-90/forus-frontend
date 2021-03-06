let ProviderOfficeComponent = function(
    $state,
    OfficeService
) {
    let $ctrl = this;

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };

    $ctrl.goToProvider = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        $state.go('provider', {
            provider_id: provider.id
        });
    };

    $ctrl.toggleOffices = ($event, provider) => {
        $event.preventDefault();
        $event.stopPropagation();

        provider.showOffices = !provider.showOffices;
    };
    
    $ctrl.$onInit = () => {
        $ctrl.weekDays = OfficeService.scheduleWeekFullDays();
        $ctrl.schedules = $ctrl.office.schedule.reduce((schedules, schedule) => {
            schedules[schedule.week_day] = schedule;
            return schedules;
        }, {});

        if ($ctrl.office.photo) {
            $ctrl.imageUrl = $ctrl.office.photo.sizes.thumbnail;
        } else if ($ctrl.office.organization.logo) {
            $ctrl.imageUrl = $ctrl.office.organization.logo.sizes.thumbnail;
        } else {
            $ctrl.imageUrl = 'assets/img/placeholders/office-thumbnail.png';
        }
    };
    
    $ctrl.$onDestroy = () => {};
};

module.exports = {
    bindings: {
        provider: '<',
        office: '<'
    },
    controller: [
        '$state',
        'OfficeService',
        ProviderOfficeComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-office.html'
};