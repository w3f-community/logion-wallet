import { COLOR_THEME } from "../../common/TestData";

import {
    pendingTokenizationRequests,
    rejectRequest,
    rejectedTokenizationRequests,
    acceptedTokenizationRequests,
    refreshRequests,
    pendingProtectionRequests,
    activatedProtectionRequests,
    protectionRequestsHistory,
} from "./LegalOfficerContextMock";

export function useLegalOfficerContext() {
    return {
        pendingTokenizationRequests,
        rejectRequest,
        rejectedTokenizationRequests,
        acceptedTokenizationRequests,
        refreshRequests,
        pendingProtectionRequests,
        activatedProtectionRequests,
        protectionRequestsHistory,
        colorTheme: COLOR_THEME,
    };
}
