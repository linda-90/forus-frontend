let SignUpComponent = function(
    $q,
    $state,
    $scope,
    $rootScope,
    $stateParams,
    $timeout,
    $interval,
    $filter,
    OrganizationService,
    IdentityService,
    CredentialsService,
    FormBuilderService,
    MediaService
) {
    let $ctrl = this;

    /*
     step 1 - app links
     step 2 - email and name form
     step 3 - organization form
     step 4 - pin code
     step 5 - qr code
     */
    $ctrl.step = 1;
    $ctrl.organizationStep = false;
    $ctrl.signedIn = false;

    let qrCodeEl;
    let qrCode;
    let has_app = false;

    let progressStorage = new(function() {
        let interval;

        this.init = () => {
            let step = this.getStep();
            if (step != null) {
                $ctrl.step = step;
            }

            if (localStorage.getItem('sign_up_form.signUpForm') != null) {
                $ctrl.signUpForm.values = JSON.parse(
                    localStorage.getItem('sign_up_form.signUpForm')
                );
            }

            if (localStorage.getItem('sign_up_form.organizationForm') != null) {
                $ctrl.organizationForm.values = JSON.parse(
                    localStorage.getItem('sign_up_form.organizationForm')
                );
            }

            interval = $interval(() => {
                if ($ctrl.step == 2) {
                    if ($ctrl.signUpForm.values) {
                        localStorage.setItem('sign_up_form.signUpForm', JSON.stringify(
                            $ctrl.signUpForm.values
                        ));
                    }
                } else if ($ctrl.step == 3) {
                    if ($ctrl.organizationForm.values) {
                        localStorage.setItem('sign_up_form.organizationForm', JSON.stringify(
                            $ctrl.organizationForm.values
                        ));

                        if (!$ctrl.organizationForm.values.product_categories) {
                            $ctrl.organizationForm.values.product_categories = [];
                        }
                    }
                }
            }, 500);
        };

        this.destroy = () => {
            $interval.cancel(interval);
        };

        this.setStep = (step) => {
            localStorage.setItem('sign_up_form.step', step);
        };

        this.getStep = () => {
            let step = parseInt(localStorage.getItem('sign_up_form.step'));

            return isNaN(step) ? null : step;
        };

        this.clear = () => {
            $interval.cancel(interval);
            
            localStorage.removeItem('sign_up_form.step');
            localStorage.removeItem('sign_up_form.signUpForm');
            localStorage.removeItem('sign_up_form.organizationForm');
        };
    })();

    $ctrl.$onInit = function() {
        if ($rootScope.auth_user) {
            $state.go('organizations');
        }

        $ctrl.signUpForm = FormBuilderService.build({
            pin_code: "1111",
        }, function(form) {

            if (form.values.records && form.values.records.primary_email != form.values.records.primary_email_confirmation) {
                return $q((resolve, reject) => {
                    reject({
                        data: {
                            errors: {
                                'records.primary_email_confirmation': [$filter('translate')('validation.email_confirmation')]
                            }
                        }
                    });
                });
            }

            let formValues = form.values;

            if (formValues.records) {
                delete formValues.records.primary_email_confirmation;
            }

            form.lock();

            return IdentityService.make(formValues);
        });

        $ctrl.organizationForm = FormBuilderService.build({
            "product_categories": []
        }, (form) => {

            if (form.values && form.values.iban != form.values.iban_confirmation) {
                return $q((resolve, reject) => {
                    reject({
                        data: {
                            errors: {
                                'iban_confirmation': [$filter('translate')('validation.iban_confirmation')]
                            }
                        }
                    });
                });
            }

            form.lock();

            return OrganizationService.store(
                form.values
            );
        });

        progressStorage.init();

        $scope.$on('$destroy', progressStorage.destroy);
    };

    $ctrl.changeHasApp = function() {
        has_app = !has_app;
    };

    $ctrl.next = function() {
        if ($ctrl.organizationStep && !$ctrl.signedIn && $ctrl.step > 1) {
            $ctrl.signUpForm.submit().then((res) => {
                CredentialsService.set(res.data.access_token);
                $ctrl.step++;
                $ctrl.signedIn = true;
            }, (res) => {
                $ctrl.signUpForm.unlock();
                $ctrl.signUpForm.errors = res.data.errors;
            });

            return;
        }

        if ($ctrl.step == 1) {
            $ctrl.step++;
            progressStorage.setStep($ctrl.step);

        } else if ($ctrl.step == 2) {
            $ctrl.step++;
            progressStorage.setStep($ctrl.step);

        } else if ($ctrl.step == 3) {

            if ($ctrl.signedIn) {
                $ctrl.organizationForm.submit().then((res) => {
                    $rootScope.$broadcast('auth:update');
                    $ctrl.step++;
                    progressStorage.clear();

                }, (res) => {
                    $ctrl.organizationForm.errors = res.data.errors;
                    $ctrl.organizationForm.unlock();
                });

            } else {
                $ctrl.signUpForm.submit().then((res) => {
                    CredentialsService.set(res.data.access_token);
                    $ctrl.signedIn = true;

                    $ctrl.organizationForm.submit().then((res) => {
                        $rootScope.$broadcast('auth:update');
                        $ctrl.step++;
                        progressStorage.clear();

                    }, (res) => {
                        $ctrl.organizationForm.errors = res.data.errors;
                        $ctrl.organizationForm.unlock();
                    });
                }, (res) => {
                    $ctrl.signUpForm.unlock();
                    $ctrl.signUpForm.errors = res.data.errors;
                    $ctrl.step = 2;
                    $ctrl.organizationStep = true;
                    progressStorage.setStep($ctrl.step);
                });
            }
        } else if ($ctrl.step == 4) {

            $scope.authorizePincodeForm.submit().then((res) => {
                CredentialsService.set(null);

                qrCodeEl = document.getElementById('platform_auth_qrcode');
                qrCode = new QRCode(qrCodeEl, {
                    correctLevel: QRCode.CorrectLevel.L
                });

                $ctrl.requestAuthQrToken();

                $ctrl.step++;

            }, (res) => {
                $scope.authorizePincodeForm.unlock();
                $scope.authorizePincodeForm.errors = res.data.errors;

                if (res.status == 404) {
                    $scope.authorizePincodeForm.errors = {
                        auth_code: ["Unknown code."]
                    };
                }
            });
        }
    };

    $ctrl.back = function() {
        $ctrl.step--;

        if ($ctrl.step <= 3) {
            progressStorage.setStep($ctrl.step);
        } else {
            progressStorage.clear();
        }
    };

    $ctrl.applyAccessToken = function(access_token) {
        CredentialsService.set(access_token);
        $rootScope.$broadcast('auth:update');
        $state.go('organizations');
    };

    $ctrl.checkAccessTokenStatus = (type, access_token) => {
        IdentityService.checkAccessToken(access_token).then((res) => {
            if (res.data.message == 'active') {
                $ctrl.applyAccessToken(access_token);
            } else if (res.data.message == 'pending') {
                $timeout(function() {
                    $ctrl.checkAccessTokenStatus(type, access_token);
                }, 2500);
            } else {
                document.location.reload();
            }
        });
    };

    $ctrl.requestAuthQrToken = () => {
        IdentityService.makeAuthToken().then((res) => {
            $ctrl.authToken = res.data.auth_token;

            qrCode.makeCode(
                JSON.stringify({
                    type: 'auth_token',
                    'value': $ctrl.authToken
                })
            );

            qrCodeEl.removeAttribute('title');

            $ctrl.checkAccessTokenStatus('token', res.data.access_token);
        }, console.log);
    };

    $ctrl.selectPhoto = (e) => {
        MediaService.store('organization_logo', e.target.files[0]).then(function(res) {
            $ctrl.media = res.data.data;
            $ctrl.organizationForm.values.media_uid = $ctrl.media.uid;
        });
    };

    $scope.authorizePincodeForm = FormBuilderService.build({
        auth_code: "",
    }, function(form) {
        form.lock();

        return IdentityService.authorizeAuthCode(
            form.values.auth_code
        );
    });

};

module.exports = {
    bindings: {
        productCategories: '<'
    },
    controller: [
        '$q',
        '$state',
        '$scope',
        '$rootScope',
        '$stateParams',
        '$timeout',
        '$interval',
        '$filter',
        'OrganizationService',
        'IdentityService',
        'CredentialsService',
        'FormBuilderService',
        'MediaService',
        SignUpComponent
    ],
    templateUrl: 'assets/tpl/pages/sign-up.html'
};