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

            this.assign = (organization_id, voucher_id, email) => {
                return ApiRequest.patch([
                    '/platform/organizations/' + organization_id,
                    '/sponsor/vouchers/' + voucher_id + '/assign',
                ].join(''), {
                    email: email
                });
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

            this.sampleCSV = (voucher_type, product_id = null) => {
                let headers = ['amount', 'expires_at', 'note', 'email'];
                let values = [10, '2020-02-20', 'voorbeeld notitie', 'test@example.com'];

                if (voucher_type != 'product_voucher') {
                    return Papa.unparse([headers, values]);
                }

                headers.splice(1, 0, 'product_id');
                values.splice(1, 0, product_id);

                return Papa.unparse([headers, values]);
            };
        });
    }
];
