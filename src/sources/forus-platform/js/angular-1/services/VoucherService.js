module.exports = [
    'ApiRequest',
    function(
        ApiRequest
    ) {
        return new(function() {
            this.index = (organization_id, query) => {
                return ApiRequest.get([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers'
                ].join(''), query);
            };

            this.store = (organization_id, data) => {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers'
                ].join(''), data);
            };

            this.storeValidate = (organization_id, data) => {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/validate'
                ].join(''), data);
            };
            
            this.storeCollection = function(organization_id, fund_id, vouchers) {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/batch' 
                ].join(''), {
                    fund_id: fund_id,
                    vouchers: vouchers
                });
            };

            this.show = (organization_id, voucher_id) => {
                return ApiRequest.get([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/' + voucher_id
                ].join(''));
            };

            this.assign = (organization_id, voucher_id, query) => {
                return ApiRequest.patch([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/' + voucher_id + '/assign',
                ].join(''), query);
            };

            this.sendToEmail = (organization_id, voucher_id, email) => {
                return ApiRequest.post([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/' + voucher_id + '/send',
                ].join(''), {
                    email: email
                });
            };

            this.downloadQRCodes = function(organization_id, query) {
                return ApiRequest.get([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/export-unassigned',
                ].join(''), query, {}, true, (params) => {
                    params.responseType = 'blob';
                    return params;
                });
            };

            this.sampleCSVBudgetVoucher = (expires_at = "2020-02-20") => {
                let headers = ['amount', 'expires_at', 'note', 'email'];
                let values = [10, expires_at, 'voorbeeld notitie', 'test@example.com'];

                return Papa.unparse([headers, values]);
            };

            this.sampleCSVProuctVoucher = (product_id = null, expires_at = "2020-02-20") => {
                let headers = ['product_id', 'expires_at', 'note', 'email'];
                let values = [product_id, expires_at, 'voorbeeld notitie', 'test@example.com'];

                return Papa.unparse([headers, values]);
            };
        });
    }
];
