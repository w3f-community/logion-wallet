import React from 'react';

import Dashboard from '../common/Dashboard';

import LegalOfficerRouter from './LegalOfficerRouter';
import { useLegalOfficerContext } from './LegalOfficerContext';
import { useRootContext } from '../RootContext';

import {
    TOKENIZATION_REQUESTS_PATH,
    PROTECTION_REQUESTS_PATH,
    RECOVERY_REQUESTS_PATH,
    SETTINGS_PATH,
} from './LegalOfficerPaths';

export default function ContextualizedWallet() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

    return (
        <Dashboard
            colors={ colorTheme }
            menuTop={[
                {
                    id: "tokens",
                    text: "Tokens",
                    to: TOKENIZATION_REQUESTS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'tokens'
                        },
                        background: colorTheme.topMenuItems.iconGradient,
                    },
                }
            ]}
            menuMiddle={[
                {
                    id: "protection",
                    text: "Protection Management",
                    to: PROTECTION_REQUESTS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'shield',
                            hasVariants: true,
                        },
                        height: 'auto',
                        width: '60px',
                    }
                },
                {
                    id: "recovery",
                    text: "Recovery Requests",
                    to: RECOVERY_REQUESTS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'recovery_request',
                            hasVariants: true,
                        },
                        height: 'auto',
                        width: '60px',
                    }
                }
            ]}
            menuBottom={[
                {
                    id: "settings",
                    text: "Settings",
                    to: SETTINGS_PATH,
                    exact: true,
                    icon: {
                        icon: {
                            id: 'settings'
                        },
                        background: colorTheme.bottomMenuItems.iconGradient,
                    },
                }
            ]}
        >
            <LegalOfficerRouter />
        </Dashboard>
    );
}
