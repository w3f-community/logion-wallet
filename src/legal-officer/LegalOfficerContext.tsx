import React, { useContext, useEffect, useReducer, Reducer } from 'react';
import { AxiosInstance } from 'axios';
import { VaultTransferRequest } from '@logion/client';
import { ProtectionRequest } from '@logion/client/dist/RecoveryClient';

import { fetchProtectionRequests, } from '../common/Model';
import { useCommonContext } from '../common/CommonContext';
import { LIGHT_MODE } from './Types';
import { AxiosFactory } from '../common/api';
import { useLogionChain } from '../logion-chain';
import { VaultApi } from '../vault/VaultApi';

export interface LegalOfficerContext {
    refreshRequests: ((clearBeforeRefresh: boolean) => void) | null,
    pendingProtectionRequests: ProtectionRequest[] | null,
    activatedProtectionRequests: ProtectionRequest[] | null,
    protectionRequestsHistory: ProtectionRequest[] | null,
    pendingRecoveryRequests: ProtectionRequest[] | null,
    recoveryRequestsHistory: ProtectionRequest[] | null,
    axios?: AxiosInstance;
    pendingVaultTransferRequests?: VaultTransferRequest[];
    vaultTransferRequestsHistory?: VaultTransferRequest[];
    settings?: Record<string, string>;
    updateSetting: (id: string, value: string) => Promise<void>;
    allSettingsKeys: string[];
}

interface FullLegalOfficerContext extends LegalOfficerContext {
    dataAddress: string | null;
    fetchForAddress: string | null;
}

function initialContextValue(): FullLegalOfficerContext {
    return {
        dataAddress: null,
        fetchForAddress: null,
        refreshRequests: null,
        pendingProtectionRequests: null,
        activatedProtectionRequests: null,
        protectionRequestsHistory: null,
        pendingRecoveryRequests: null,
        recoveryRequestsHistory: null,
        updateSetting: () => Promise.reject(),
        allSettingsKeys: [ 'oath' ]
    };
}

const LegalOfficerContextObject: React.Context<FullLegalOfficerContext> = React.createContext(initialContextValue());

type ActionType = 'FETCH_IN_PROGRESS'
    | 'SET_DATA'
    | 'SET_CURRENT_USER'
    | 'UPDATE_SETTING'
;

interface Action {
    type: ActionType;
    dataAddress?: string;
    pendingProtectionRequests?: ProtectionRequest[];
    protectionRequestsHistory?: ProtectionRequest[];
    activatedProtectionRequests?: ProtectionRequest[];
    pendingRecoveryRequests?: ProtectionRequest[],
    recoveryRequestsHistory?: ProtectionRequest[],
    refreshRequests?: (clearBeforeRefresh: boolean) => void;
    clearBeforeRefresh?: boolean;
    axios?: AxiosInstance;
    currentAccount?: string;
    rejectRequest?: ((requestId: string, reason: string) => Promise<void>) | null;
    pendingVaultTransferRequests?: VaultTransferRequest[];
    vaultTransferRequestsHistory?: VaultTransferRequest[];
    settings?: Record<string, string>;
    updateSetting?: (id: string, value: string) => Promise<void>;
    id?: string;
    value?: string;
}

const reducer: Reducer<FullLegalOfficerContext, Action> = (state: FullLegalOfficerContext, action: Action): FullLegalOfficerContext => {
    switch (action.type) {
        case 'FETCH_IN_PROGRESS':
            if(action.clearBeforeRefresh!) {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                    pendingProtectionRequests: null,
                    protectionRequestsHistory: null,
                };
            } else {
                return {
                    ...state,
                    fetchForAddress: action.dataAddress!,
                };
            }
        case 'SET_DATA':
            if(action.dataAddress === state.fetchForAddress) {
                return {
                    ...state,
                    fetchForAddress: null,
                    dataAddress: action.dataAddress!,
                    pendingProtectionRequests: action.pendingProtectionRequests!,
                    protectionRequestsHistory: action.protectionRequestsHistory!,
                    activatedProtectionRequests: action.activatedProtectionRequests!,
                    pendingRecoveryRequests: action.pendingRecoveryRequests!,
                    recoveryRequestsHistory: action.recoveryRequestsHistory!,
                    pendingVaultTransferRequests: action.pendingVaultTransferRequests!,
                    vaultTransferRequestsHistory: action.vaultTransferRequestsHistory!,
                    settings: action.settings!,
                };
            } else {
                return state;
            }
        case "SET_CURRENT_USER": {
            return {
                ...state,
                refreshRequests: action.refreshRequests!,
                axios: action.axios!,
                updateSetting: action.updateSetting!,
            };
        }
        case "UPDATE_SETTING":
            return {
                ...state,
                settings: {
                    ...state.settings!,
                    [action.id!]: action.value!,
                }
            }
        default:
            /* istanbul ignore next */
            throw new Error(`Unknown type: ${action.type}`);
    }
}

export interface Props {
    children: JSX.Element | JSX.Element[] | null
}

export function LegalOfficerContextProvider(props: Props) {
    const { accounts, axiosFactory, isCurrentAuthenticated, client, getOfficer } = useLogionChain();
    const { colorTheme, setColorTheme } = useCommonContext();
    const [ contextValue, dispatch ] = useReducer(reducer, initialContextValue());

    useEffect(() => {
        if(colorTheme !== LIGHT_MODE && setColorTheme !== null) {
            setColorTheme(LIGHT_MODE);
        }
    }, [ colorTheme, setColorTheme ]);

    useEffect(() => {
        if(accounts !== null
                && getOfficer !== undefined
                && client
                && axiosFactory !== undefined
                && accounts.current !== undefined
                && contextValue.dataAddress !== accounts.current.address
                && contextValue.fetchForAddress !== accounts.current.address
                && isCurrentAuthenticated()) {
            const currentAccount = accounts!.current!.address;
            const currentLegalOfficer = getOfficer(currentAccount);
            if(currentLegalOfficer!.node) {
                const refreshRequests = (clear: boolean) => refreshRequestsFunction(clear, currentAccount, dispatch, axiosFactory);
                const axios = axiosFactory(currentAccount);
                const updateSettingCallback = async (id: string, value: string) => {
                    await updateSetting(axios, id, value);
                    dispatch({
                        type: "UPDATE_SETTING",
                        id,
                        value,
                    })
                };
                dispatch({
                    type: 'SET_CURRENT_USER',
                    axios,
                    currentAccount,
                    refreshRequests,
                    updateSetting: updateSettingCallback,
                });
                refreshRequests(true);
            }
        }
    }, [ contextValue, axiosFactory, accounts, isCurrentAuthenticated, client, getOfficer ]);

    return (
        <LegalOfficerContextObject.Provider value={contextValue}>
            {props.children}
        </LegalOfficerContextObject.Provider>
    );
}

export function useLegalOfficerContext(): LegalOfficerContext {
    return { ...useContext(LegalOfficerContextObject) };
}

function refreshRequestsFunction(clearBeforeRefresh: boolean, currentAddress: string, dispatch: React.Dispatch<Action>, axiosFactory: AxiosFactory) {
    dispatch({
        type: "FETCH_IN_PROGRESS",
        dataAddress: currentAddress,
        clearBeforeRefresh,
    });

    (async function() {
        const axios = axiosFactory(currentAddress);
        const pendingProtectionRequests = await fetchProtectionRequests(axios, {
            statuses: ["PENDING"],
            kind: 'PROTECTION_ONLY',
        });
        const activatedProtectionRequests = await fetchProtectionRequests(axios, {
            statuses: ["ACTIVATED"],
            kind: 'ANY',
        });
        const protectionRequestsHistory = await fetchProtectionRequests(axios, {
            statuses: ["ACCEPTED", "REJECTED", "ACTIVATED"],
            kind: 'PROTECTION_ONLY',
        });

        const pendingRecoveryRequests = await fetchProtectionRequests(axios, {
            statuses: ["PENDING"],
            kind: 'RECOVERY',
        });
        const recoveryRequestsHistory = await fetchProtectionRequests(axios, {
            statuses: ["ACCEPTED", "REJECTED", "ACTIVATED"],
            kind: 'RECOVERY',
        });

        const vaultSpecificationFragment = {
            statuses: []
        }

        const vaultTransferRequestsResult = await new VaultApi(axios, currentAddress).getVaultTransferRequests({
            ...vaultSpecificationFragment,
            statuses: [ "PENDING" ]
        });
        const pendingVaultTransferRequests = vaultTransferRequestsResult.sort((a, b) => b.createdOn.localeCompare(a.createdOn));

        const vaultTransferRequestsHistoryResult = await new VaultApi(axios, currentAddress).getVaultTransferRequests({
            ...vaultSpecificationFragment,
            statuses: [ "CANCELLED", "REJECTED_CANCELLED", "REJECTED", "ACCEPTED" ]
        });
        const vaultTransferRequestsHistory = vaultTransferRequestsHistoryResult.sort((a, b) => b.createdOn.localeCompare(a.createdOn));

        const settings = await getSettings(axios);

        dispatch({
            type: "SET_DATA",
            pendingProtectionRequests,
            activatedProtectionRequests,
            protectionRequestsHistory,
            dataAddress: currentAddress,
            pendingRecoveryRequests,
            recoveryRequestsHistory,
            pendingVaultTransferRequests,
            vaultTransferRequestsHistory,
            settings,
        });
    })();
}

async function getSettings(axios: AxiosInstance): Promise<Record<string, string>> {
    const response = await axios.get('/api/setting');
    return response.data.settings;
}

async function updateSetting(axios: AxiosInstance, id: string, value: string): Promise<void> {
    await axios.put(`/api/setting/${id}`, { value });
}
