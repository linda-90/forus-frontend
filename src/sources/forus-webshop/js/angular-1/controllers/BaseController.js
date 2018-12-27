let BaseController = function(
    $rootScope,
    $state,
    IdentityService,
    AuthService,
    RecordService,
    OrganizationService,
    ConfigService,
    BrowserService,
    $filter,
    appConfigs
) {
    $rootScope.loadAuthUser = function() {
        
        AuthService.identity().then((res) => {
            let auth_user = res.data;

            // 15 minutes
            BrowserService.detectInactivity(15 * 60 * 1000).then(() => {
                if (AuthService.hasCredentials()) {
                    IdentityService.deleteToken();
                    $rootScope.signOut();
                }
            }, () => {});

            RecordService.list().then((res) => {
                auth_user.records = res.data;
                auth_user.primary_email = res.data.filter((record) => {
                    return record.key == 'primary_email';
                })[0].value;
            });

            OrganizationService.list().then((res) => {
                auth_user.organizations = res.data.data;
                auth_user.organizationsMap = {};
                auth_user.organizationsIds = Object.values(res.data.data).map(function(organization) {
                    auth_user.organizationsMap[organization.id] = organization;
                    return organization.id;
                });
            });

            $rootScope.auth_user = auth_user;
        });
    };

    $rootScope.$on('organization-changed', (event) => {
        $rootScope.activeOrganization = OrganizationService.active();
    });

    $rootScope.$on('auth:update', (event) => {
        $rootScope.loadAuthUser();
    });

    $rootScope.activeOrganization = OrganizationService.active();

    $rootScope.signOut = () => {
        AuthService.signOut();
        $state.go('home');
        $rootScope.auth_user = false;
    };

    $rootScope.appConfigs = appConfigs;

    if (AuthService.hasCredentials()) {
        $rootScope.loadAuthUser();
    }

    ConfigService.get('webshop').then((res) => {
        $rootScope.appConfigs.features = res.data;
    });

    $rootScope.pageTitle = $filter('translate')('page_title');
    $rootScope.client_key = appConfigs.client_key;
};

module.exports = [
    '$rootScope',
    '$state',
    'IdentityService',
    'AuthService',
    'RecordService',
    'OrganizationService',
    'ConfigService',
    'BrowserService',
    '$filter',
    'appConfigs',
    BaseController
];