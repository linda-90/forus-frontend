let ModalFundProviderChatComponent = function(
    $element,
    $timeout,
    appConfigs,
    FormBuilderService,
    FundProviderChatService
) {
    let $ctrl = this;

    $ctrl.panelType = appConfigs.panel_type;

    $ctrl.loadMessages = () => {
        FundProviderChatService.listMessages(
            $ctrl.organization_id,
            $ctrl.fund_id,
            $ctrl.fund_provider_id,
            $ctrl.fund_provider_chat_id, {
                per_page: 100
            }
        ).then(res => {
            $ctrl.messages = res.data.data.reduce((messages, message) => {
                if (!messages.hasOwnProperty(message.date)) {
                    messages[message.date] = [message];
                } else {
                    messages[message.date].push(message);
                }

                return messages;
            }, {});
            
            $timeout($ctrl.scrollTheChat, 0);
        }, console.error);
    };

    $ctrl.initForm = () => {
        $ctrl.form = FormBuilderService.build({
            message: '',
        }, (form) => {
            FundProviderChatService.storeMessage(
                $ctrl.organization_id,
                $ctrl.fund_id,
                $ctrl.fund_provider_id,
                $ctrl.fund_provider_chat_id,
                form.values
            ).then(res => {
                $ctrl.init();
            }, (res) => {
                form.errors = res.data.errors;
                form.unlock();
            });
        }, true);
    };

    $ctrl.scrollTheChat = () => {
        $element.find('#chat_root').scrollTop(1000000);
    };

    $ctrl.init = () => {
        $ctrl.loadMessages();
        $ctrl.initForm();
    };

    $ctrl.$onInit = () => {
        $ctrl.fund_id = $ctrl.modal.scope.fund_id;
        $ctrl.fund_provider_id = $ctrl.modal.scope.fund_provider_id;
        $ctrl.organization_id = $ctrl.modal.scope.organization_id;
        $ctrl.fund_provider_chat_id = $ctrl.modal.scope.fund_provider_chat_id;
        $ctrl.onClose = $ctrl.modal.scope.onClose;

        $ctrl.init();
    };

    $ctrl.closeModal = () => {
        $ctrl.close();
        $ctrl.onClose();
    };

    $ctrl.$onDestroy = function() {};
};

module.exports = {
    bindings: {
        close: '=',
        modal: '='
    },
    controller: [
        '$element',
        '$timeout',
        'appConfigs',
        'FormBuilderService',
        'FundProviderChatService',
        ModalFundProviderChatComponent
    ],
    templateUrl: () => {
        return 'assets/tpl/modals/fund-requests/modal-fund-provider-chat.html';
    }
};