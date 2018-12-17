let VoucherComponent = function(
    $filter,
    $element,
    VoucherService,
    ModalService
) {
    let $ctrl = this;

    $ctrl.$onInit = function() {
        let qrCodeEl = $element.find('#voucher_qr')[0];

        new QRCode(qrCodeEl, {
            text: JSON.stringify({
                type: 'voucher',
                value: $ctrl.voucher.address
            }),
            correctLevel: QRCode.CorrectLevel.L
        });

        qrCodeEl.removeAttribute('title');

        $ctrl.voucherCard = VoucherService.composeCardData($ctrl.voucher);

        $ctrl.printQrCode = () => {
            let html = angular.element('html');
            let body = angular.element('body');
            let printContents = $element.find('#voucher_qr').clone();
            
            printContents.addClass('printable-qr_code');
            body.css('display', 'none');
            html.append(printContents);
            window.print();
            body.css('display', '');
            printContents.remove();
        }

        $ctrl.sendVoucherEmail = function(voucher) {
            return ModalService.open('modalNotification', {
                type: 'confirm',
                title: "E-Mail voucher naar uzelf",
                description: "U kunt uw voucher naar uzelf mailen. Laat de voucher, in de vorm van een QR-code, aan de aanbieder zien vanuit uw vertrouwde e-mailbox.",
                confirm: () => {
                    VoucherService.sendToEmail(voucher.address).then(res => {
                        ModalService.open('modalNotification', {
                            type: 'action-result',
                            class: 'modal-description-pad',
                            title: $filter('translate')('popup_auth.labels.voucher_email'),
                            description: $filter('translate')('popup_auth.notifications.voucher_email'),
                            confirmBtnText: $filter('translate')('popup_auth.buttons.confirm')
                        });
                    });
                }
            });
        };
    };
};

module.exports = {
    bindings: {
        voucher: '<'
    },
    controller: [
        '$filter',
        '$element',
        'VoucherService',
        'ModalService',
        VoucherComponent
    ],
    templateUrl: 'assets/tpl/pages/voucher.html'
};
