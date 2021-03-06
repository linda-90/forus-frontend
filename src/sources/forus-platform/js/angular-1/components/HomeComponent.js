let HomeComponent = function(
    $state,
    $rootScope,
    $stateParams,
    ModalService,
    PushNotificationsService
) {
    let $ctrl = this;
    let qrCodeEl = document.getElementById('qrcode');

    $rootScope.showAppHeader = false;

    $ctrl.showModal = false;

    $ctrl.openAuthPopup = function() {
        ModalService.open('modalAuth', {});
    };

    $ctrl.closeModal = function() {
        $ctrl.showModal = false;
        qrCodeEl.innerHTML = '';
    };

    $ctrl.cleanReload = () => {
        $state.go($state.current.name, {
            digid_success: null,
            digid_error: null,
        });
    };

    $ctrl.$onInit = () => {
        if ($stateParams.digid_error == 'uid_not_found') {
            PushNotificationsService.danger(
                "Onbekende BSN-nummer.",
            ) & $ctrl.cleanReload();
        } else if ($stateParams.digid_error != null) {
            PushNotificationsService.danger(
                "Er ging iets mis.",
                "Er kan niet ingelogd worden met DigiD door een onbekend probleem.",
            ) & $ctrl.cleanReload();
        }
    };
};

module.exports = {
    controller: [
        '$state',
        '$rootScope',
        '$stateParams',
        'ModalService',
        'PushNotificationsService',
        HomeComponent
    ],
    templateUrl: ['appConfigs', (appConfigs) => {
        if (appConfigs.panel_type == 'validator') {
            return 'assets/tpl/pages/home.html';
        }

        if (appConfigs.panel_type == 'provider'  && (appConfigs.client_key == 'nijmegen')){
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-'+ appConfigs.client_key +'.html';
        }

        if (appConfigs.panel_type == 'sponsor' && (appConfigs.client_key == 'nijmegen')){
            return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '-'+ appConfigs.client_key +'.html';
        }

        return 'assets/tpl/pages/landing/home-' + appConfigs.panel_type + '.html';
    }]
};
