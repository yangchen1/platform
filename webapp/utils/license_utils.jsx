// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import Constants from 'utils/constants.jsx';

import LocalizationStore from 'stores/localization_store.jsx';

export function isLicenseExpiring() {
    if (window.mm_license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = parseInt(global.window.mm_license.ExpiresAt, 10) - Date.now();
    return timeDiff <= Constants.LICENSE_EXPIRY_NOTIFICATION;
}

export function isLicenseExpired() {
    if (window.mm_license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = parseInt(global.window.mm_license.ExpiresAt, 10) - Date.now();
    return timeDiff < 0;
}

export function isLicensePastGracePeriod() {
    if (window.mm_license.IsLicensed !== 'true') {
        return false;
    }

    const timeDiff = Date.now() - parseInt(global.window.mm_license.ExpiresAt, 10);
    return timeDiff > Constants.LICENSE_GRACE_PERIOD;
}

export function displayExpiryDate() {
    const date = new Date(parseInt(global.window.mm_license.ExpiresAt, 10));
    return date.toLocaleString(LocalizationStore.getLocale(), {year: 'numeric', month: 'long', day: 'numeric'});
}
