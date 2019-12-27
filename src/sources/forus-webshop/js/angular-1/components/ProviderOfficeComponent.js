let ProviderOfficeComponent = function(
    $scope,
    $state,
    $element,
    OfficeService
) {
    let $ctrl = this;

    $ctrl.goToOffice = (office) => {
        $state.go('provider-office', {
            provider_id: office.organization_id,
            office_id: office.id
        });
    };
    
    $ctrl.$onInit = () => {
        // console.log($ctrl.office);
        $ctrl.weekDays = OfficeService.scheduleWeekFullDays();
        $ctrl.schedules = $ctrl.office.schedule.reduce((schedules, schedule) => {
            schedules[schedule.week_day] = schedule;
            return schedules;
        }, {});

        /* let map = $element.find('iframe');
        map.attr('src', map.data('src').replace('_lat_', $ctrl.office.lat).replace('_lon_', $ctrl.office.lon)); */
    };
    
    $ctrl.$onDestroy = () => {};
};

module.exports = {
    bindings: {
        provider: '<',
        office: '<'
    },
    controller: [
        '$scope',
        '$state',
        '$element',
        'OfficeService',
        ProviderOfficeComponent
    ],
    templateUrl: 'assets/tpl/pages/provider-office.html'
};